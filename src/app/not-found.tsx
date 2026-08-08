"use client";

import { AppButton } from "@/components/ui/AppButton";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h2 className="mb-3">404 Not Found</h2>
      <div className="d-flex justify-content-center gap-3">
        <AppButton href="/" variant="secondary" outline={true}>
          トップへ戻る
        </AppButton>
      </div>
    </div>
  );
}
