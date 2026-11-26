import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, Loading, EmptyState } from "@/components/app/ui-bits";
import { ProjectForm } from "@/components/app/project-form";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/org/projects/$id/edit")({
  head: () => ({ meta: [{ title: "Edit project — JengaLink" }, { name: "description", content: "Edit a community project." }] }),
  component: Edit,
});
function Edit() {
  const { id } = Route.useParams();
  const { org } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["project-edit", id], queryFn: async () => (await supabase.from("projects").select("*").eq("id", id).maybeSingle()).data });
  if (isLoading) return <Loading />;
  return (
    <Container className="max-w-3xl">
      <PageHeader title="Edit project" />
      {data && org && data.org_id === org.id ? <ProjectForm orgId={org.id} project={data} /> : <EmptyState title="You can't edit this project" />}
    </Container>
  );
}
