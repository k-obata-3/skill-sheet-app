"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Table } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { SkillCategory } from "@prisma/client";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppSelect } from "@/components/ui/AppSelect";
import { CategorySwitcher } from "@/components/ui/CategorySwitcher";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useToast } from "@/components/ui/ToastProvider";
import { SKILL_CATEGORY_LABEL, SKILL_CATEGORY_ORDER } from "@/lib/skill/skillCategoryLabel";

type SkillMasterRow = {
  id: string;
  category: SkillCategory;
  name: string;
  isActive: boolean;
};

type CreateForm = {
  category: SkillCategory;
  name: string;
};

export default function SkillMasterAdminUI({ skillMasters }: { skillMasters: SkillMasterRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [category, setCategory] = useState<SkillCategory>(SKILL_CATEGORY_ORDER[0]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>({ category: SKILL_CATEGORY_ORDER[0], name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = skillMasters
    .filter((row) => row.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  function openCreateModal() {
    setForm({ category, name: "" });
    setError(null);
    setShowModal(true);
  }

  async function submit() {
    if (!form.name.trim()) {
      return;
    }
    setError(null);
    setSaving(true);

    const res = await fetch(`/api/admin/skill-master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.message ?? "作成に失敗しました");
      return;
    }

    setShowModal(false);
    showToast("スキルを登録しました");
    router.refresh();
  }

  async function toggleActive(row: SkillMasterRow) {
    setError(null);

    const res = await fetch(`/api/admin/skill-master/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.message ?? "更新に失敗しました");
      return;
    }

    showToast("スキルを更新しました");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("このスキルを削除しますか？")) {
      return;
    }
    setError(null);

    const res = await fetch(`/api/admin/skill-master/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.message ?? "削除に失敗しました");
      return;
    }

    showToast("スキルを削除しました");
    router.refresh();
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto">
          <AppButton size="sm" onClick={openCreateModal}>新規作成</AppButton>
        </div>
      </div>

      {!showModal && <AppErrorAlert message={error} />}

      <CategorySwitcher
        options={SKILL_CATEGORY_ORDER.map((cat) => ({ value: cat, label: SKILL_CATEGORY_LABEL[cat] }))}
        value={category}
        onChange={setCategory}
      />

      <AppCard className="shadow-sm mt-3">
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>スキル名</th>
              <th style={{ width: "1%" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="text-nowrap">
                <td>{row.name}</td>
                <td className="text-end" style={{ width: "1%" }}>
                  <div className="d-flex align-items-center justify-content-end gap-3">
                    <Form.Check
                      type="switch"
                      id={`skill-master-active-${row.id}`}
                      checked={row.isActive}
                      onChange={() => toggleActive(row)}
                    />
                    <AppButton variant="none" size="sm" onClick={() => remove(row.id)}>
                      <BsTrash style={{ color: "var(--danger-color)" }} />
                    </AppButton>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={2} className="text-center text-muted py-4">
                  スキルが登録されていません
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </AppCard>

      <AppModal
        title="スキル追加"
        show={showModal}
        onClose={() => setShowModal(false)}
        fullscreen={"none"}
      >
        <Form action={submit}>
          <AppErrorAlert message={error} />
          <Form.Group className="mb-3">
            <Form.Label>カテゴリ</Form.Label>
            <AppSelect
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}
              required
            >
              {SKILL_CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>{SKILL_CATEGORY_LABEL[cat]}</option>
              ))}
            </AppSelect>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>スキル名</Form.Label>
            <AppInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Form.Group>

          <div className="d-flex align-items-center">
            <div className="ms-auto">
              <AppButton outline={true} size="sm" type="submit" disabled={saving}>
                作成
              </AppButton>
            </div>
          </div>
        </Form>
      </AppModal>
    </div>
  );
}
