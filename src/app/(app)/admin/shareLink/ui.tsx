"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, InputGroup, Table } from "react-bootstrap";
import { BsCopy, BsShare, BsTrash } from "react-icons/bs";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppSelect } from "@/components/ui/AppSelect";
import { toYYYYMMDD } from "@/lib/date/monthOptions";

type UserRow = {
  id: string;
  name: string;
};

type SharedLink = {
  id: string,
  userId: string,
  token: string,
  expiresAt: string | null,
  comment: string | null,
  createdAt: Date,
}

type ShareLinkForm = {
  userId: string;
  expiryDate: string;
  comment: string;
};

const EMPTY_FORM: ShareLinkForm = { userId: "", expiryDate: "", comment: "" };

export default function ShareLinkAdminUI({ users, sharedLinks, baseUrl }: { users: UserRow[], sharedLinks: SharedLink[], baseUrl: string }) {
  const router = useRouter();
  const [showCreateShareLinkModal, setShowCreateShareLinkModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLinkForm, setShareLinkForm] = useState<ShareLinkForm>(EMPTY_FORM);
  const currentDate = new Date();

  useEffect(() => {
    if(showCreateShareLinkModal) {
      setShareLinkForm(EMPTY_FORM);
      setShareUrl(null);
    }
  }, [showCreateShareLinkModal]);

  async function createShareLinkUrl() {
    if(!shareLinkForm.userId) {
      return;
    }

    const res = await fetch(`/api/admin/shareLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: shareLinkForm.userId,
        expiryDate: shareLinkForm.expiryDate,
        comment: shareLinkForm.comment,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      alert(j?.message ?? "共有リンク作成に失敗しました");
      setShareUrl(null);
      return;
    }

    const data = await res.json();
    setShareUrl(data.shareLinkUrl);
  }

  async function deleteShareLink(id?: string) {
    const res = await fetch(`/api/admin/shareLink`, {
      method: "DELETE",
      body: JSON.stringify({
        id: id,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      alert(j?.message ?? "削除に失敗しました");
      return;
    }

    router.refresh();
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="d-flex align-items-end mb-3">
        <div className="ms-auto me-2">
          <AppButton variant="danger" size="sm" onClick={() => deleteShareLink()}>期限切れ削除</AppButton>
        </div>
        <div>
          <AppButton size="sm" onClick={() => setShowCreateShareLinkModal(true)}>共有リンク作成</AppButton>
        </div>
      </div>

      <AppCard className="shadow-sm">
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>ユーザ名</th>
              <th>有効期限</th>
              <th>作成日</th>
              <th>メモ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sharedLinks.map((s) => (
              <tr key={s.id} className="text-nowrap">
                <td>{users.find(u => u.id === s.userId)?.name}</td>
                <td>{s.expiresAt ? s.expiresAt.replaceAll("-", "/") : "無期限"}</td>
                <td>{s.createdAt.toLocaleDateString('sv-SE').replaceAll("-", "/")}</td>
                <td>{s.comment}</td>
                <td>
                  <AppButton variant="none" size="sm" className="me-2" href={`${baseUrl}/share/${s.token}`} target="_blank"><BsShare /></AppButton>
                  <AppButton variant="none" size="sm" onClick={() => deleteShareLink(s.id)}><BsTrash style={{color: "var(--danger-color)"}} /></AppButton>
                </td>
              </tr>
            ))}
            {!sharedLinks.length ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  共有リンクがありません
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </AppCard>

      <AppModal title="共有リンク作成"
        show={showCreateShareLinkModal}
        onClose={() => {
          setShowCreateShareLinkModal(false);
          if(shareUrl) {
            router.refresh();
          }
        }}
        fullscreen={"none"}
      >
        <>
          {!shareUrl && (
            <Form action={() => createShareLinkUrl()}>
              <Form.Group className="mb-3">
                <Form.Label>ユーザ</Form.Label>
                <AppSelect
                  value={shareLinkForm.userId}
                  onChange={(e) => setShareLinkForm({ ...shareLinkForm, userId: e.target.value })}
                  required={true}
                >
                  <option value=""></option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </AppSelect>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>有効期限</Form.Label>
                <Form.Control
                  type="date"
                  min={toYYYYMMDD(currentDate.getFullYear(), String(currentDate.getMonth() + 1), String(currentDate.getDate()))}
                  max={toYYYYMMDD(currentDate.getFullYear(), String(currentDate.getMonth() + 2), String(currentDate.getDate()))}
                  onChange={(e) => setShareLinkForm({ ...shareLinkForm, expiryDate: e.target.value })}
                />
                <p className="muted">※設定可能な最長期限は1ヶ月となります。</p>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>メモ</Form.Label>
                <AppInput
                  value={shareLinkForm.comment}
                  onChange={(e) => setShareLinkForm({ ...shareLinkForm, comment: e.target.value })}
                />
              </Form.Group>

              <div className="d-flex align-items-center mb-3">
                <div className="ms-auto">
                  <AppButton
                    outline={true}
                    size="sm"
                    type="submit"
                  >
                    作成
                  </AppButton>
                </div>
              </div>
            </Form>
          )}
          {shareUrl && (
            <>
              <h6 className="mb-0">スキルシート共有リンクを作成しました。</h6>
              <p className="muted">このリンクをユーザに共有してください。</p>
              <InputGroup>
                <AppInput
                  value={shareUrl ?? ""}
                  readOnly
                />
                  <AppButton variant="secondary" outline={true} onClick={() => copy(shareUrl!)}><BsCopy/></AppButton>
              </InputGroup >
            </>
          )}
        </>
      </AppModal>
    </div>
  );
}