"use client";

import { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { InputGroup } from "react-bootstrap";
import { BsCopy } from "react-icons/bs";

type Props = {
  title: string;
  userId: string;
  onClose: () => void;
  show: boolean;
};

export function InviteUrlModal({
  title,
  userId,
  onClose,
  show,
}: Props) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if(!inviteUrl && show) {
      issueInvite(userId);
    }
  }, [show]);

  async function issueInvite(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}/invite`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setInviteUrl(null);
      onClose();
      alert("招待リンク発行に失敗しました");
      return;
    }
    setInviteUrl(data.inviteUrl);
    setOpen(true);
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <AppModal
      title={title}
      show={open}
      onClose={() => {
        setInviteUrl(null);
        setOpen(false);
        onClose();
      }}
      className=""
      footer={
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => {
            setInviteUrl(null);
            setOpen(false);
            onClose();
          }}
        >
          閉じる
        </AppButton>
      }
      fullscreen="none"
    >

      <h6 className="mb-0">招待リンクを作成しました。</h6>
      <p className="muted">このリンクをユーザに共有して、パスワードを設定してください。</p>
      <InputGroup>
        <AppInput
          value={inviteUrl ?? ""}
          readOnly
        />
          <AppButton variant="secondary" outline={true} onClick={() => copy(inviteUrl!)}><BsCopy/></AppButton>
      </InputGroup >
      <p className="muted text-end">※リンクの有効期間は3日間です。</p>
    </AppModal>
  );
}
