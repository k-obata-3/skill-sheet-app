"use client";

import { useEffect, useMemo, useState } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "./ui/AppButton";
import { AppModal } from "./ui/AppModal";

type Props = {
  title: string;
  options: string[];
  selectedItems: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  show: boolean;
};

export function SkillPickerDesktop({
  title,
  options,
  selectedItems,
  onChange,
  onClose,
  show,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setOpen(show);
  }, [show]);

  const candidates = useMemo(() => {
    const base = options.filter(
      (o) => !selectedItems.includes(o)
    );

    if(q) {
      const t = q.trim().toLowerCase();
      if (!t) {
        return [];
      }

      return base.filter((o) => o.toLowerCase().includes(t));
    }

    return base;
  }, [q, options, selectedItems]);

  function add(skill: string) {
    onChange([...selectedItems, skill]);
    setQ("");
  }

  function remove(skill: string) {
    onChange(selectedItems.filter((v) => v !== skill));
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
      {/* 検索 */}
      <AppInput
        placeholder="検索して追加"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />

      {/* 選択済み */}
      <div className="mt-3 d-flex flex-wrap gap-2 mb-3">
        {selectedItems.length === 0 && (
          <span className="text-muted small">
            未選択
          </span>
        )}

        {selectedItems.map((v) => (
          <AppBadge
            key={v}
            tone="primary"
            onClick={() => remove(v)}
            style={{cursor: "pointer"}}
          >
            {v}
            <span className="badge-delete-btn ms-2">✕</span>
          </AppBadge>
        ))}
      </div>

      {/* 候補 */}
      {candidates?.length > 0 && (
        <div className="mt-2 modal-scroll">
          {candidates.map((c) => (
            <div
              key={c}
              className="skill-candidate mb-1"
              onClick={() => add(c)}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </AppModal>
  );
}
