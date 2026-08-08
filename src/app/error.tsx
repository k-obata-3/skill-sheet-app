"use client";

import { AppButton } from "@/components/ui/AppButton";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="container py-5 text-center">
      <h2 className="mb-3">500 Internal Server Error</h2>
      <div className="d-flex justify-content-center gap-3">
        <AppButton variant="primary" onClick={() => reset()}>
          再試行
        </AppButton>
        <AppButton href="/" variant="secondary" outline={true}>
          トップへ戻る
        </AppButton>
      </div>
    </div>
  );
}
