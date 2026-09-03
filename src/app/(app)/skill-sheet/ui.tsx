"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useToast } from "@/components/ui/ToastProvider";
import { CategorySwitcher } from "@/components/ui/CategorySwitcher";

type Project = {
  id: string;
  name: string;
  periodFrom: string;
  periodTo: string | null;
};

type Sheet = {
  summary: string | null;
  remarks: string | null;
  projects: Project[];
};

const SUMMARY_MAX_LENGTH = 500;
const REMARKS_MAX_LENGTH = 300;

type TabKey = "summary" | "projects";

function isTabKey(value: string | null): value is TabKey {
  return value === "summary" || value === "projects";
}

export default function ProjectListUI({ sheet }: { sheet: Sheet | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const tabParam = searchParams.get("tab");
  const tab: TabKey = isTabKey(tabParam) ? tabParam : "summary";
  const [summary, setSummary] = useState(sheet?.summary ?? "");
  const [remarks, setRemarks] = useState(sheet?.remarks ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveSummary() {
    setError(null);
    setSaving(true);

    const res = await fetch("/api/skill-sheet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, remarks }),
    });

    setSaving(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.message ?? "保存に失敗しました");
      return;
    }

    showToast("保存しました");
  }

  function changeTab(next: TabKey) {
    router.replace(`/skill-sheet?tab=${next}`, { scroll: false });
  }

  return (
    <>
      <CategorySwitcher
        options={[
          { value: "summary", label: "自己PR・備考" },
          { value: "projects", label: "案件一覧" },
        ]}
        value={tab}
        onChange={changeTab}
      />

      {tab === "summary" && (
        <AppCard className="shadow-sm mb-3 mt-3">
          <AppErrorAlert message={error} />
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <div className="text-muted small mb-1">自己PR</div>
              <div className="text-muted small">{summary.length} / {SUMMARY_MAX_LENGTH}</div>
            </div>
            <AppInput
              as="textarea"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="自己PRを入力してください"
              maxLength={SUMMARY_MAX_LENGTH}
            />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <div className="text-muted small mb-1">備考</div>
              <div className="text-muted small">{remarks.length} / {REMARKS_MAX_LENGTH}</div>
            </div>
            <AppInput
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="備考を入力してください"
              maxLength={REMARKS_MAX_LENGTH}
            />
          </div>
          <div className="d-flex justify-content-end">
            <AppButton size="sm" onClick={saveSummary} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </AppButton>
          </div>
        </AppCard>
      )}

      {tab === "projects" && (
        <div className="mt-3">
          <div className="d-flex align-items-center mb-3">
            <div className="ms-auto">
              <AppButton size="sm" href="/skill-sheet/new">案件登録</AppButton>
            </div>
          </div>

          {sheet?.projects.map((p: Project) => (
            <AppCard key={p.id} className="shadow-sm mb-3" title={p.name}>
              <div className="text-muted">
                {p.periodFrom?.replaceAll("-", "/")} - {p.periodTo?.replaceAll("-", "/") || "現在"}
              </div>
              <div className="d-flex justify-content-end">
                <AppButton size="sm" href={`/skill-sheet/${p.id}`}>編集</AppButton>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </>
  );
}