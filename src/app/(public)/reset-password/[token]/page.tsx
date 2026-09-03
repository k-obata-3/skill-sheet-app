import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/inviteToken";
import PageComponent from "@/components/layout/PageComponent";
import ResetPasswordUI from "./ui";

export default async function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const p = await params;
  const tokenHash = hashToken(p.token);

  const reset = await prisma.authToken.findUnique({
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
        }
      },
    },
  });

  const now = new Date();
  const isValid =
    reset &&
    reset.type === "RESET" &&
    !reset.usedAt &&
    reset.expiresAt > now;

  return (
    <PageComponent>
      <div className="py-5 ps-3 pe-3" style={{ maxWidth: 560, margin: "auto" }}>
        <ResetPasswordUI
          token={p.token}
          valid={Boolean(isValid)}
          user={isValid ? { id: reset!.user.id, name: reset!.user.name, email: reset!.user.email } : null}
        />
      </div>
    </PageComponent>
  );
}
