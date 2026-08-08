import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/inviteToken";
import PageComponent from "@/components/layout/PageComponent";
import InviteSetPasswordUI from "./ui";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const p = await params;
  const tokenHash = hashToken(p.token);

  const invite = await prisma.authToken.findUnique({
    where: {
      tokenHash
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          companyId: true,
          passwordHash: true
        }
      },
    },
  });

  const now = new Date();
  const isValid =
    invite &&
    invite.type === "INVITE" &&
    !invite.usedAt &&
    invite.expiresAt > now &&
    invite.user.passwordHash == null;

  return (
    <PageComponent>
      <div className="py-5 ps-3 pe-3" style={{ maxWidth: 560, margin: "auto" }}>
        <InviteSetPasswordUI
          token={p.token}
          valid={Boolean(isValid)}
          user={isValid ? { id: invite!.user.id, name: invite!.user.name, email: invite!.user.email } : null}
        />
      </div>
    </PageComponent>
  );
}
