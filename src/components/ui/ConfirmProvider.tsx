"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AppModal } from "./AppModal";
import { AppButton } from "./AppButton";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function close(result: boolean) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AppModal
        title={options?.title ?? "確認"}
        show={options !== null}
        onClose={() => close(false)}
        fullscreen="none"
        footer={
          <>
            <AppButton variant="secondary" outline={true} size="sm" onClick={() => close(false)}>
              {options?.cancelLabel ?? "キャンセル"}
            </AppButton>
            <AppButton variant={options?.variant ?? "danger"} size="sm" onClick={() => close(true)}>
              {options?.confirmLabel ?? "削除"}
            </AppButton>
          </>
        }
      >
        {options?.message}
      </AppModal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
