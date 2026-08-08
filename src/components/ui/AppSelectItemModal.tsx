"use client";

import { useEffect, useMemo, useState } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { BsCheck2 } from "react-icons/bs";

type Props = {
  title: string;
  options: string[];
  selectedItems: string[];
  onChange: (next: string) => void;
  onClose: () => void;
  show: boolean;
  search?: boolean;
};

export function AppSelectItemModal({
  title,
  options,
  selectedItems,
  onChange,
  onClose,
  show,
  search,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setOpen(show);
  }, [show]);

  const candidates = useMemo(() => {
    if(q) {
      const t = q.toLowerCase();
      return options.filter((o) =>
        o.toLowerCase().includes(t)
      );
    }

    return options;
  }, [q, options, selectedItems]);

  function add(value: string) {
    onChange(value);
  }

  return (
    <AppModal
      title={title}
      show={open}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
      className="select-item-modal"
      footer={
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => {
            setOpen(false);
            onClose();
          }}
        >
          閉じる
        </AppButton>
      }
      >

      {/* フルスクリーン選択 */}
      {search ? (
        <>
          <AppInput
            placeholder="検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-3 mb-3 modal-scroll">
            {candidates.map((val) => (
              <div className="d-flex item-row" key={val} onClick={() => add(val)}>
                <div className="me-auto">{val}</div>
                <div className="text-end">
                  {selectedItems.includes(val) ? (
                    <BsCheck2 className="item-selected-icon" />
                  ) : <></> }
                  </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mb-3 modal-scroll">
          {options.map((val) => (
            <div className="d-flex item-row" key={val} onClick={() => add(val)}>
              <div className="me-auto">{val}</div>
              <div className="text-end">
                {selectedItems.includes(val) ? (
                  <BsCheck2 className="item-selected-icon" />
                ) : <></> }
                </div>
            </div>
          ))}
        </div>
      )}

    </AppModal>
  );
}
