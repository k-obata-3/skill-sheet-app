"use client";

import { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { InputGroup } from "react-bootstrap";
import { BsCopy } from "react-icons/bs";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useApiRequest, HttpMethod } from "@/lib/hooks/useApiRequest";

const MODE_CONFIG = {
  invite: {
    endpoint: (userId: string) => `/api/admin/users/${userId}/invite`,
    urlField: "inviteUrl",
    heading: "招待リンクを作成しました。",
    description: "このリンクをユーザに共有して、パスワードを設定してください。",
    validity: "※リンクの有効期間は3日間です。",
    errorMessage: "招待リンク発行に失敗しました",
  },
  reset: {
    endpoint: (userId: string) => `/api/admin/users/${userId}/reset-password`,
    urlField: "resetUrl",
    heading: "パスワード再設定リンクを作成しました。",
    description: "このリンクをユーザに共有して、パスワードを再設定してください。",
    validity: "※リンクの有効期間は3時間です。",
    errorMessage: "パスワード再設定リンクの発行に失敗しました",
  },
} as const;

type Props = {
  title: string;
  userId: string;
  onClose: () => void;
  show: boolean;
  mode?: keyof typeof MODE_CONFIG;
};

export function InviteUrlModal({
  title,
  userId,
  onClose,
  show,
  mode = "invite",
}: Props) {
  const config = MODE_CONFIG[mode];
  const { request, error, setError } = useApiRequest();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if(!inviteUrl && !error && show) {
      issueInvite(userId);
    }
  }, [show]);

  async function issueInvite(userId: string) {
    const result = await request(config.endpoint(userId), { method: HttpMethod.POST }, config.errorMessage);
    if (!result.ok) {
      setInviteUrl(null);
      setOpen(true);
      return;
    }
    setInviteUrl(result.data[config.urlField]);
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
        setError(null);
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
            setError(null);
            setOpen(false);
            onClose();
          }}
        >
          閉じる
        </AppButton>
      }
      fullscreen="none"
    >
      {error ? (
        <AppErrorAlert message={error} />
      ) : (
        <>
          <h6 className="mb-0">{config.heading}</h6>
          <p className="muted">{config.description}</p>
          <InputGroup>
            <AppInput
              value={inviteUrl ?? ""}
              readOnly
            />
              <AppButton variant="secondary" outline={true} onClick={() => copy(inviteUrl!)}><BsCopy/></AppButton>
          </InputGroup >
          <p className="muted text-end">{config.validity}</p>
        </>
      )}
    </AppModal>
  );
}
