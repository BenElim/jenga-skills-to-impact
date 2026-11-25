
create type public.app_role as enum ('admin','coordinator','volunteer');
create type public.project_status as enum ('draft','open','in_progress','completed');
create type public.application_status as enum ('pending','accepted','rejected');
create type public.task_status as enum ('todo','completed','verified');
create type public.request_status as enum ('pending','completed','declined');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text default '',
  bio text default '',
  location text default '',
  education text default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  availability text default 'weekends',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "profiles public read" on public.profiles for select to anon, authenticated using (true);
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ORGANIZATIONS
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  description text default '',
  location text default '',
  website text default '',
  verified boolean not null default false,
  verification_requested boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.organizations to anon;
grant select, insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;

create or replace function public.owns_org(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organizations where id = _org and owner_id = auth.uid())
$$;

create policy "orgs public read" on public.organizations for select to anon, authenticated using (true);
create policy "orgs coordinator insert" on public.organizations for insert to authenticated
  with check (owner_id = auth.uid() and verified = false and public.has_role(auth.uid(),'coordinator'));
create policy "orgs owner update" on public.organizations for update to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "orgs admin delete" on public.organizations for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- prevent owners self-verifying
create or replace function public.guard_org_verified()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.verified is distinct from old.verified and not public.has_role(auth.uid(),'admin') then
    new.verified := old.verified;
  end if;
  return new;
end $$;
create trigger trg_guard_org_verified before update on public.organizations for each row execute function public.guard_org_verified();

-- PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 150),
  summary text not null default '',
  description text not null default '',
  category text not null default 'Education',
  location text not null default '',
  required_skills text[] not null default '{}',
  volunteers_needed int not null default 1 check (volunteers_needed between 1 and 500),
  duration_text text not null default '2 weeks',
  start_date date,
  end_date date,
  commitment text default 'weekends',
  beneficiaries_target int not null default 0 check (beneficiaries_target >= 0),
  beneficiaries_reached int not null default 0 check (beneficiaries_reached >= 0),
  status project_status not null default 'open',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create or replace function public.coordinates_project(_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.projects p join public.organizations o on o.id = p.org_id
    where p.id = _project and o.owner_id = auth.uid())
$$;

create policy "projects public read" on public.projects for select to anon, authenticated
  using (status <> 'draft' or public.owns_org(org_id) or public.has_role(auth.uid(),'admin'));
create policy "projects owner insert" on public.projects for insert to authenticated with check (public.owns_org(org_id));
create policy "projects owner update" on public.projects for update to authenticated
  using (public.owns_org(org_id) or public.has_role(auth.uid(),'admin'))
  with check (public.owns_org(org_id) or public.has_role(auth.uid(),'admin'));
create policy "projects owner delete" on public.projects for delete to authenticated
  using (public.owns_org(org_id) or public.has_role(auth.uid(),'admin'));

-- APPLICATIONS
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  motivation text not null default '' check (char_length(motivation) <= 2000),
  status application_status not null default 'pending',
  coordinator_note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, volunteer_id)
);
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;

create policy "apps read" on public.applications for select to authenticated
  using (volunteer_id = auth.uid() or public.coordinates_project(project_id) or public.has_role(auth.uid(),'admin'));
create policy "apps volunteer insert" on public.applications for insert to authenticated
  with check (volunteer_id = auth.uid() and status = 'pending' and not public.coordinates_project(project_id));
create policy "apps coordinator update" on public.applications for update to authenticated
  using (public.coordinates_project(project_id)) with check (public.coordinates_project(project_id));
create policy "apps volunteer withdraw" on public.applications for delete to authenticated
  using (volunteer_id = auth.uid() and status = 'pending');

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assignee_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  description text default '',
  due_date date,
  hours numeric not null default 0 check (hours >= 0 and hours <= 1000),
  status task_status not null default 'todo',
  completion_note text default '',
  completed_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;

create policy "tasks read" on public.tasks for select to authenticated
  using (assignee_id = auth.uid() or public.coordinates_project(project_id) or public.has_role(auth.uid(),'admin'));
create policy "tasks coordinator insert" on public.tasks for insert to authenticated
  with check (public.coordinates_project(project_id) and assignee_id <> auth.uid()
    and exists (select 1 from public.applications a where a.project_id = tasks.project_id and a.volunteer_id = tasks.assignee_id and a.status='accepted'));
create policy "tasks update" on public.tasks for update to authenticated
  using (assignee_id = auth.uid() or public.coordinates_project(project_id))
  with check (assignee_id = auth.uid() or public.coordinates_project(project_id));
create policy "tasks coordinator delete" on public.tasks for delete to authenticated using (public.coordinates_project(project_id));

create or replace function public.guard_task_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.coordinates_project(new.project_id) and new.assignee_id <> auth.uid() then
    if new.status = 'verified' and old.status <> 'verified' then new.verified_at := now(); end if;
    return new;
  end if;
  -- assignee path: only toggle todo <-> completed and add a note
  if new.status = 'verified' or old.status = 'verified' then
    raise exception 'Volunteers cannot verify their own work';
  end if;
  if new.title <> old.title or new.project_id <> old.project_id or new.assignee_id <> old.assignee_id or new.hours <> old.hours then
    raise exception 'Only the coordinator can edit task details';
  end if;
  new.completed_at := case when new.status = 'completed' then now() else null end;
  return new;
end $$;
create trigger trg_guard_task before update on public.tasks for each row execute function public.guard_task_update();

-- CERTIFICATES
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  verification_code text not null unique,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  issued_by uuid references public.profiles(id) on delete set null,
  volunteer_name text not null,
  project_title text not null,
  org_name text not null,
  role_title text not null default 'Volunteer',
  responsibilities text[] not null default '{}',
  skills text[] not null default '{}',
  total_hours numeric not null default 0,
  start_date date,
  end_date date,
  coordinator_statement text default '',
  status text not null default 'approved' check (status in ('approved','revoked')),
  issued_at timestamptz not null default now(),
  unique (volunteer_id, project_id)
);
grant select, update on public.certificates to authenticated;
grant all on public.certificates to service_role;
alter table public.certificates enable row level security;
create policy "certs read" on public.certificates for select to authenticated
  using (volunteer_id = auth.uid() or public.owns_org(org_id) or public.has_role(auth.uid(),'admin'));
create policy "certs revoke" on public.certificates for update to authenticated
  using (public.owns_org(org_id) or public.has_role(auth.uid(),'admin'))
  with check (public.owns_org(org_id) or public.has_role(auth.uid(),'admin'));

-- ENDORSEMENTS
create table public.endorsements (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  endorser_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  skill text not null default '',
  message text not null check (char_length(message) between 10 and 2000),
  relationship text default 'Project supervisor',
  created_at timestamptz not null default now(),
  check (volunteer_id <> endorser_id)
);
grant select on public.endorsements to anon;
grant select, insert, delete on public.endorsements to authenticated;
grant all on public.endorsements to service_role;
alter table public.endorsements enable row level security;
create policy "endorse read" on public.endorsements for select to anon, authenticated using (true);
create policy "endorse insert" on public.endorsements for insert to authenticated
  with check (endorser_id = auth.uid() and volunteer_id <> auth.uid() and project_id is not null
    and public.coordinates_project(project_id)
    and exists (select 1 from public.applications a where a.project_id = endorsements.project_id and a.volunteer_id = endorsements.volunteer_id and a.status='accepted'));
create policy "endorse delete" on public.endorsements for delete to authenticated
  using (endorser_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- RECOMMENDATION REQUESTS
create table public.recommendation_requests (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  supervisor_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 1000),
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
grant select, insert, update on public.recommendation_requests to authenticated;
grant all on public.recommendation_requests to service_role;
alter table public.recommendation_requests enable row level security;
create policy "rr read" on public.recommendation_requests for select to authenticated
  using (volunteer_id = auth.uid() or supervisor_id = auth.uid());
create policy "rr insert" on public.recommendation_requests for insert to authenticated
  with check (volunteer_id = auth.uid() and status='pending'
    and exists (select 1 from public.applications a where a.project_id = recommendation_requests.project_id and a.volunteer_id = auth.uid() and a.status='accepted'));
create policy "rr supervisor update" on public.recommendation_requests for update to authenticated
  using (supervisor_id = auth.uid()) with check (supervisor_id = auth.uid());

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text default '',
  link text default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif own update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notif own delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create or replace function public.notify(_user uuid, _title text, _body text, _link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id,title,body,link) values (_user,_title,_body,_link)
$$;
revoke execute on function public.notify(uuid,text,text,text) from public, anon, authenticated;

-- REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('project','organization','user')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 5 and 1000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports insert" on public.reports for insert to authenticated with check (reporter_id = auth.uid() and status='open');
create policy "reports read" on public.reports for select to authenticated using (reporter_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "reports admin update" on public.reports for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NOTIFICATION TRIGGERS
create or replace function public.on_application_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid; ptitle text;
begin
  select o.owner_id, p.title into owner, ptitle from public.projects p join public.organizations o on o.id=p.org_id where p.id = new.project_id;
  if tg_op = 'INSERT' then
    if owner is not null then perform public.notify(owner, 'New application', 'A volunteer applied to '||ptitle, '/manage/'||new.project_id); end if;
  elsif new.status <> old.status then
    perform public.notify(new.volunteer_id, 'Application '||new.status, 'Your application to '||ptitle||' was '||new.status, '/applications');
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger trg_app_insert after insert on public.applications for each row execute function public.on_application_change();
create or replace function public.on_application_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare ptitle text;
begin
  new.updated_at := now();
  if new.status <> old.status then
    select title into ptitle from public.projects where id = new.project_id;
    perform public.notify(new.volunteer_id, 'Application '||new.status, 'Your application to '||ptitle||' was '||new.status, '/applications');
  end if;
  return new;
end $$;
create trigger trg_app_update before update on public.applications for each row execute function public.on_application_update();

create or replace function public.on_task_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.assignee_id, 'New task assigned', new.title, '/passport');
  elsif new.status = 'completed' and old.status = 'todo' then
    select o.owner_id into owner from public.projects p join public.organizations o on o.id=p.org_id where p.id=new.project_id;
    if owner is not null then perform public.notify(owner, 'Task completed', new.title, '/manage/'||new.project_id); end if;
  elsif new.status = 'verified' and old.status <> 'verified' then
    perform public.notify(new.assignee_id, 'Task verified', new.title, '/passport');
  end if;
  return new;
end $$;
create trigger trg_task_event after insert or update on public.tasks for each row execute function public.on_task_event();

-- SIGNUP HANDLER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text; org text;
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  r := coalesce(new.raw_user_meta_data->>'role','volunteer');
  if r not in ('volunteer','coordinator') then r := 'volunteer'; end if;
  insert into public.user_roles(user_id, role) values (new.id, r::app_role);
  org := nullif(trim(new.raw_user_meta_data->>'org_name'),'');
  if r = 'coordinator' and org is not null then
    insert into public.organizations(owner_id, name, location) values (new.id, left(org,120), coalesce(new.raw_user_meta_data->>'location',''));
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ISSUE CERTIFICATE (only coordinator of project, never the volunteer themself)
create or replace function public.issue_certificate(_application uuid, _role_title text, _statement text)
returns text language plpgsql security definer set search_path = public as $$
declare a record; p record; o record; v record; code text; hrs numeric; resp text[]; sk text[];
begin
  select * into a from public.applications where id = _application;
  if a is null or a.status <> 'accepted' then raise exception 'Application not accepted'; end if;
  if not public.coordinates_project(a.project_id) then raise exception 'Only the project coordinator can issue certificates'; end if;
  if a.volunteer_id = auth.uid() then raise exception 'You cannot verify your own experience'; end if;
  if not exists (select 1 from public.tasks where project_id=a.project_id and assignee_id=a.volunteer_id and status='verified') then
    raise exception 'Verify at least one completed task first'; end if;
  if exists (select 1 from public.tasks where project_id=a.project_id and assignee_id=a.volunteer_id and status<>'verified') then
    raise exception 'All tasks must be verified before issuing a certificate'; end if;
  select * into p from public.projects where id=a.project_id;
  select * into o from public.organizations where id=p.org_id;
  select * into v from public.profiles where id=a.volunteer_id;
  select coalesce(sum(hours),0), array_agg(title order by created_at) into hrs, resp from public.tasks where project_id=a.project_id and assignee_id=a.volunteer_id;
  select coalesce(array_agg(s),'{}') into sk from (select unnest(p.required_skills) s intersect select unnest(v.skills)) x;
  if array_length(sk,1) is null then sk := p.required_skills; end if;
  code := 'JL-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,4)) || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,4));
  insert into public.certificates(verification_code, volunteer_id, project_id, org_id, issued_by, volunteer_name, project_title, org_name,
    role_title, responsibilities, skills, total_hours, start_date, end_date, coordinator_statement)
  values (code, a.volunteer_id, p.id, o.id, auth.uid(), coalesce(nullif(v.full_name,''),'Volunteer'), p.title, o.name,
    coalesce(nullif(_role_title,''),'Volunteer'), coalesce(resp,'{}'), sk, hrs, coalesce(p.start_date, a.created_at::date), coalesce(p.end_date, now()::date), coalesce(_statement,''))
  on conflict (volunteer_id, project_id) do update set status='approved', role_title=excluded.role_title,
    responsibilities=excluded.responsibilities, skills=excluded.skills, total_hours=excluded.total_hours,
    coordinator_statement=excluded.coordinator_statement, issued_at=now()
  returning verification_code into code;
  perform public.notify(a.volunteer_id, 'Certificate issued', 'Your verified experience certificate for '||p.title||' is ready', '/passport');
  return code;
end $$;
revoke execute on function public.issue_certificate(uuid,text,text) from public, anon;
grant execute on function public.issue_certificate(uuid,text,text) to authenticated;

-- PUBLIC VERIFY (approved only, limited fields)
create or replace function public.verify_certificate(_code text)
returns table(verification_code text, volunteer_name text, project_title text, org_name text, org_verified boolean,
  role_title text, responsibilities text[], skills text[], total_hours numeric, start_date date, end_date date,
  coordinator_statement text, issued_at timestamptz, volunteer_id uuid)
language sql stable security definer set search_path = public as $$
  select c.verification_code, c.volunteer_name, c.project_title, c.org_name, o.verified, c.role_title, c.responsibilities,
    c.skills, c.total_hours, c.start_date, c.end_date, c.coordinator_statement, c.issued_at, c.volunteer_id
  from public.certificates c join public.organizations o on o.id=c.org_id
  where c.verification_code = upper(trim(_code)) and c.status='approved'
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

create or replace function public.public_certificates(_volunteer uuid)
returns table(verification_code text, project_title text, org_name text, role_title text, total_hours numeric, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select verification_code, project_title, org_name, role_title, total_hours, issued_at from public.certificates
  where volunteer_id = _volunteer and status='approved' order by issued_at desc
$$;
grant execute on function public.public_certificates(uuid) to anon, authenticated;

-- PLATFORM STATS
create or replace function public.platform_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'volunteers', (select count(*) from public.user_roles where role='volunteer'),
    'organizations', (select count(*) from public.organizations where not is_sample),
    'active_projects', (select count(*) from public.projects where status in ('open','in_progress') and not is_sample),
    'completed_projects', (select count(*) from public.projects where status='completed' and not is_sample),
    'participations', (select count(*) from public.applications where status='accepted'),
    'certificates', (select count(*) from public.certificates where status='approved'),
    'verified_hours', (select coalesce(sum(hours),0) from public.tasks where status='verified'),
    'beneficiaries', (select coalesce(sum(beneficiaries_reached),0) from public.projects where status='completed' and not is_sample),
    'skills', (select coalesce(json_agg(json_build_object('skill',s,'count',c) order by c desc),'[]'::json) from (
        select s, count(*) c from public.certificates, unnest(skills) s where status='approved' group by s order by c desc limit 10) x),
    'sample_projects', (select count(*) from public.projects where is_sample)
  )
$$;
grant execute on function public.platform_stats() to anon, authenticated;

-- SAMPLE DATA (clearly labelled)
insert into public.organizations(id, name, description, location, verified, is_sample) values
 ('11111111-0000-0000-0000-000000000001','Sample: Kibera Youth Tech Hub','Sample organization for demonstration.','Nairobi, Kenya',true,true),
 ('11111111-0000-0000-0000-000000000002','Sample: Green Mombasa Initiative','Sample organization for demonstration.','Mombasa, Kenya',true,true),
 ('11111111-0000-0000-0000-000000000003','Sample: Kisumu Health Volunteers','Sample organization for demonstration.','Kisumu, Kenya',false,true);

insert into public.projects(org_id,title,summary,description,category,location,required_skills,volunteers_needed,duration_text,commitment,beneficiaries_target,status,is_sample) values
 ('11111111-0000-0000-0000-000000000001','Coding Club for Secondary Students','Teach basic web development to 40 secondary students.','Weekly after-school sessions introducing HTML, CSS and problem solving. Volunteers prepare lessons and mentor small groups.','Education','Nairobi, Kenya','{ICT,Teaching,Communication}',4,'6 weeks','weekends',40,'open',true),
 ('11111111-0000-0000-0000-000000000002','Beach Clean-up & Recycling Drive','Organize community clean-ups and a recycling awareness campaign.','Coordinate volunteers, log collected waste and run awareness sessions with local fishermen and traders.','Environment','Mombasa, Kenya','{Event Planning,Communication,Data Collection}',10,'3 weeks','weekends',300,'open',true),
 ('11111111-0000-0000-0000-000000000003','Community Health Data Survey','Collect and digitize household health data for a local clinic.','Volunteers conduct door-to-door surveys using mobile forms and help clean the data for the clinic.','Health','Kisumu, Kenya','{Data Collection,Data Analysis,Communication}',6,'4 weeks','full-time',500,'open',true),
 ('11111111-0000-0000-0000-000000000001','Small Business Digital Marketing Clinic','Help market traders set up social media and digital payments.','One-on-one support for 25 small businesses: social media pages, product photos and mobile money setup.','Entrepreneurship','Nairobi, Kenya','{Digital Marketing,Graphic Design,ICT}',5,'2 weeks','weekdays',25,'open',true),
 ('11111111-0000-0000-0000-000000000002','Mangrove Restoration Mapping','Map degraded mangrove areas and plan replanting.','Use GPS tools to map sites, photograph them and produce a short report for county officials.','Environment','Mombasa, Kenya','{GIS,Research,Writing}',3,'1 month','weekends',0,'open',true);
