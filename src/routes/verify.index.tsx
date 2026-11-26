import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/app/ui-bits";

export const Route = createFileRoute("/verify/")({
  head: () => ({ meta: [{ title: "Verify a certificate — JengaLink" }, { name: "description", content: "Check that a JengaLink experience certificate is genuine." }, { property: "og:title", content: "Verify a JengaLink certificate" }, { property: "og:description", content: "Enter a verification code to confirm experience." }] }),
  component: VerifyHome,
});

function VerifyHome() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  return (
    <Container className="max-w-xl py-16 text-center">
      <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-4 text-3xl font-semibold">Verify a certificate</h1>
      <p className="mt-2 text-muted-foreground">Employers and partners can confirm a volunteer's experience using the code on their certificate.</p>
      <form className="mt-8 flex gap-2" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (c) navigate({ to: "/verify/$code", params: { code: c } }); }}>
        <Input aria-label="Verification code" placeholder="JL-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} maxLength={20} className="font-mono" />
        <Button>Verify</Button>
      </form>
    </Container>
  );
}
