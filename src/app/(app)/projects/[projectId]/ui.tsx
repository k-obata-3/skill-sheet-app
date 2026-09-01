"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Row, Col, ListGroup, } from "react-bootstrap";
import { SkillPicker } from "@/components/SkillPicker";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { Category, Phase, ProjectJsonKey, ProjectFormData, CATEGORY_LABEL, PHASE_LABEL } from "@/types/project";
import { AppMonthSelect } from "@/components/ui/AppMonthSelect";
import { AppSelectItemModal } from "@/components/ui/AppSelectItemModal";

export type SkillMasters = Record<Category, string[]>;

type Props = {
  initialProject: ProjectFormData;
  masters: SkillMasters;
};

/* ========= util ========= */

function isValidRange(from?: string, to?: string) {
  if (!from || !to) return true;
  return from <= to; // YYYY-MM-DD
}

/* ========= UI ========= */

export default function ProjectEditUI({
  initialProject,
  masters,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [form, setForm] = useState<ProjectFormData>(initialProject);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用技術：編集中カテゴリ
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const isEdit = Boolean(form.id);
  const rangeOk = isValidRange(form.periodFrom, form.periodTo ?? "");

  const [showEditingItemModal, setShowEditingItemModal] = useState<boolean>(false);
  const addProjectJson = (key: ProjectJsonKey, val: string) => {
    switch(key) {
      case "description":
        return {
          description: val,
          role: form.projectJson.role,
          phases: form.projectJson.phases,
        }
      case "role":
        return {
          description: form.projectJson.description,
          role: val,
          phases: form.projectJson.phases,
        }
      case "phases":
        return {
          description: form.projectJson.description,
          role: form.projectJson.role,
          phases: form.projectJson.phases?.includes(val) ? form.projectJson.phases?.filter((el) => el !== val) : [...form.projectJson.phases, val],
        }
    }
  }

  /* ===== 保存 ===== */
  async function save() {
    setError(null);

    if (!rangeOk) {
      setError("期間の指定が不正です（開始 > 終了）。");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      if(j?.message && j.errors?.fieldErrors) {
        setError(`${j?.message}\n${Object.values(j.errors.fieldErrors).flat().join("\n")}`);
      } else {
        setError(j?.message ?? "保存に失敗しました");
      }
      return;
    }

    showToast(isEdit ? "案件を更新しました" : "案件を登録しました");
    router.push("/projects");
  }


  /* ===== 削除 ===== */
  async function deleteProject() {
    const ok = await confirm({ title: "案件の削除", message: "この案件を削除しますか？" });
    if (!ok) {
      return;
    }
    setError(null);

    const res = await fetch(`/api/projects/${form.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.message ?? "削除に失敗しました");
      return;
    }

    showToast("案件を削除しました");
    router.push("/projects");
  }

  return (
    <div>
      {/* ===== ヘッダ ===== */}
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto">
          <AppButton
            variant="secondary"
            outline={true}
            size="sm"
            onClick={() => router.back()}
          >
            キャンセル
          </AppButton>
        </div>
      </div>

      <div>
      {/* <AppCard className="shadow-sm"> */}
        <AppErrorAlert message={error} />

        <Row>
          <Col xl={7}>
            <AppCard className="shadow-sm mb-3" title="基本情報">
              {/* ===== 案件名 ===== */}
              <Form.Group className="mb-3">
                <Form.Label>案件名</Form.Label>
                <AppInput
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="案件名"
                />
              </Form.Group>

              {/* ===== 期間 ===== */}
              <Row className="g-3 mb-2">
                <Col md={6}>
                  <>
                  <AppMonthSelect
                    label="開始日"
                    value={form.periodFrom}
                    onChange={(v) =>
                      setForm({ ...form, periodFrom: v })
                    }
                  />
                  </>
                </Col>
                <Col md={6}>
                  <AppMonthSelect
                    label="終了日"
                    value={form.periodTo ?? ""}
                    allowEmpty={true}
                    onChange={(v) =>
                      setForm({ ...form, periodTo: v })
                    }
                  />
                </Col>
              </Row>

              {!rangeOk && (
                <div className="text-danger small mb-2">
                  開始月は終了月以前で指定してください
                </div>
              )}

              {/* ===== 役割 ===== */}
              <Form.Group className="mb-3">
                <Form.Label>役割</Form.Label>
                <AppSelect
                  value={form.projectJson?.role}
                  onChange={(e) => setForm({ ...form, projectJson: addProjectJson("role", e.target.value) })}
                >
                  <option value="">未選択</option>
                  <option value="Webデザイナー">Webデザイナー</option>
                  <option value="アプリケーション">アプリケーション</option>
                  <option value="フロントエンド">フロントエンド</option>
                  <option value="サーバーサイド">サーバーサイド</option>
                  <option value="フロントエンド/サーバーサイド">フロントエンド/サーバーサイド</option>
                  <option value="プロジェクトリーダー">プロジェクトリーダー</option>
                  <option value="プロジェクトマネージャー">プロジェクトマネージャー</option>
                </AppSelect>
              </Form.Group>

              {/* ===== 担当工程 ===== */}
              <Form.Group className="mb-3">
                <Form.Label>担当工程</Form.Label>
                <AppButton
                  variant="none"
                  outline={true}
                  size="lg"
                  onClick={() => setShowEditingItemModal(true)}
                  className="w-100"
                >
                  <div style={{color: "var(--text)", fontSize: "1rem", fontWeight: "400", padding: "2px"}}>
                    {form.projectJson.phases.length ? form.projectJson.phases.map((ph, index) => (
                      <AppBadge tone="secondary" key={index} className="me-1 mt-1">{ph}</AppBadge>
                    )) : <span>未選択</span>}
                  </div>
                </AppButton>
              </Form.Group>

              {/* ===== 内容 ===== */}
              <Form.Group className="mb-4">
                <Form.Label>内容</Form.Label>
                <AppInput
                  as="textarea"
                  rows={4}
                  value={form.projectJson.description}
                  onChange={(e) =>
                    setForm({ ...form, projectJson: addProjectJson("description", e.target.value) })
                  }
                  placeholder="内容"
                />
              </Form.Group>

            </AppCard>
          </Col>
          <Col>
            {/* ===== 使用技術 ===== */}
            <AppCard className="shadow-sm mb-3" title="使用技術">
              <ListGroup className="mb-3">
                {(Object.keys(CATEGORY_LABEL) as Category[]).map(
                  (cat) => (
                    <AppButton
                      variant="none"
                      outline={true}
                      key={cat}
                      onClick={() => setEditingCategory(cat)}
                      className="w-100 mb-3"
                    >
                      <div>
                        <strong>{CATEGORY_LABEL[cat]}</strong>
                        <div style={{color: "var(--text)", fontSize: "1rem", fontWeight: "400", padding: "2px"}}>
                          {form.skillsJson[cat].length ? form.skillsJson[cat].map((skill, index) => (
                            <AppBadge tone="secondary" key={index} className="me-1 mt-1">{skill}</AppBadge>
                          )) : <span>未選択</span>}
                        </div>
                      </div>
                    </AppButton>
                  )
                )}
              </ListGroup>

            </AppCard>
          </Col>
        </Row>

        <div className={`d-flex ${isEdit ? "justify-content-between" : "justify-content-end"}`}>
          {isEdit && (
            <AppButton variant="danger" outline={true} size="sm" onClick={deleteProject}>削除</AppButton>
          )}
            {/* ===== 保存 ===== */}
            <AppButton
              size="sm"
              onClick={save}
              disabled={saving || !rangeOk}
            >
              {saving ? "保存中..." : "保存"}
            </AppButton>
        </div>

      {/* </AppCard> */}
      </div>

      {/* ===== 担当工程 選択モーダル ===== */}
      <AppSelectItemModal
        title="担当工程"
        options={Object.values(PHASE_LABEL) as Phase[]}
        selectedItems={form.projectJson.phases}
        onChange={(v: string) =>
          setForm({ ...form, projectJson: addProjectJson("phases", v) })
        }
        onClose={() => setShowEditingItemModal(false)}
        show={showEditingItemModal}
        ></AppSelectItemModal>

      {/* ===== 使用技術 カテゴリ別モーダル ===== */}
      <SkillPicker
        title={`${CATEGORY_LABEL[editingCategory!]}`}
        options={masters[editingCategory!] ?? []}
        selectedItems={form.skillsJson[editingCategory!] ?? []}
        onClose={() => setEditingCategory(null)}
        onChange={(v) =>
          setForm({
            ...form,
            skillsJson: {
              ...form.skillsJson,
              [editingCategory!]: v,
            },
          })
        }
        show={Boolean(editingCategory)}
      />
    </div>
  );
}
