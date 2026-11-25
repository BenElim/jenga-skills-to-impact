import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TagInput({ value, onChange, suggestions = [], placeholder, id }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string; id?: string }) {
  const [text, setText] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (!v || v.length > 40 || value.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
    setText("");
  };
  const remaining = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <Badge key={t} className="gap-1">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
          </Badge>
        ))}
      </div>
      <Input id={id} value={text} placeholder={placeholder ?? "Type and press Enter"} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); } }} onBlur={() => add(text)} />
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.slice(0, 10).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
