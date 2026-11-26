import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHeader, EmptyState } from "@/components/app/ui-bits";
import { ProjectForm } from "@/components/app/project-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/org/projects/new")({
  head: () => ({ meta: [{ title: "New project — JengaLink" }, { name: "description", content: "Publish a community project." }] }),
  component: () => {
    const { org } = useAuth();
    return (
      <Container className="max-w-3xl">
        <PageHeader title="Create a community project" subtitle={org?.name} />
        {org ? <ProjectForm orgId={org.id} /> : <EmptyState title="Organization accounts only" body="Register as an organization to publish projects." action={<Button asChild variant="outline"><Link to="/dashboard">Back</Link></Button>} />}
      </Container>
    );
  },
});
