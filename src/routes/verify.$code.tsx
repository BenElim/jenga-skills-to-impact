import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Container, Loading, EmptyState } from "@/components/app/ui-bits";
import { Certificate } from "@/components/app/certificate";

export const Route = createFileRoute("/verify/$code")({
  head: ({ params }) => ({ meta: [{ title: `Certificate ${params.code} — JengaLink` }, { name: "description", content: "Public verification of a JengaLink experience certificate." }, { property: "og:title", content: "Verified experience — JengaLink" }, { property: "og:description", content: "This certificate was verified by a project coordinator." }] }),
  component: VerifyCode,
});

function VerifyCode() {
  const { code } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["verify", code],
    queryFn: async () => (await supabase.rpc("verify_certificate", { _code: code })).data?.[0] ?? null,
  });
  if (isLoading) return <Loading label="Checking certificate…" />;
  if (!data) return <Container className="max-w-xl"><EmptyState icon={<ShieldX />} title="No valid certificate found" body={`The code ${code} doesn't match an approved JengaLink certificate.`} action={<Button asChild variant="outline"><Link to="/verify">Try another code</Link></Button>} /></Container>;
  return (
    <Container className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
        <div className="flex items-center gap-2 font-medium text-success"><ShieldCheck /> Authentic — verified by the project coordinator</div>
        <div className="flex gap-2 print:hidden">
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}><Copy />Copy link</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}><Printer />Print</Button>
        </div>
      </div>
      <Certificate c={data} />
      <p className="mt-4 text-center text-sm"><Link to="/u/$id" params={{ id: data.volunteer_id }} className="text-primary">View volunteer's public profile →</Link></p>
    </Container>
  );
}
