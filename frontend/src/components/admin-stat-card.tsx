interface AdminStatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export function AdminStatCard({ label, value, subtitle, accent }: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <p className="text-sm text-brand-text-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${accent ? "text-brand-terracotta" : "text-brand-text"}`}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-brand-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
