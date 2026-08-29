"use client";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

type Project = {
  id: string;
  name: string;
  periodFrom: string;
  periodTo: string | null;
};

type Sheet = {
  projects: Project[];
};

export default function ProjectListUI({ sheet }: { sheet: Sheet | null }) {
  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto">
          <AppButton size="sm" href="/projects/new">案件登録</AppButton>
        </div>
      </div>

      {sheet?.projects.map((p: Project) => (
        <AppCard key={p.id} className="shadow-sm mb-3" title={p.name}>
          <div className="text-muted">
            {p.periodFrom?.replaceAll("-", "/")} - {p.periodTo?.replaceAll("-", "/") || "現在"}
          </div>
          <div className="d-flex justify-content-end">
            <AppButton size="sm" href={`/projects/${p.id}`}>編集</AppButton>
          </div>
        </AppCard>
      ))}
    </>
  );
}