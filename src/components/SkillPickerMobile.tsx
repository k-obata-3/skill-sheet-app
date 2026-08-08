"use client";

import { useEffect, useMemo, useState } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";

type Props = {
  title: string;
  options: string[];
  selectedItems: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  show: boolean;
};

export function SkillPickerMobile({
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
      (o) => !selectedItems?.includes(o)
    );

    if (q) {
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

      <AppInput
        placeholder="検索"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* 要約表示 */}
      <div className="mt-3 d-flex flex-wrap gap-2 mb-3">
        {selectedItems.length === 0 ? (
          <span className="text-muted small">
            未選択
          </span>
        ) : (
          selectedItems.map((v) => (
            <AppBadge
              key={v}
              tone="primary"
              onClick={() => remove(v)}
              style={{cursor: "pointer"}}
            >
              {v} ✕
            </AppBadge>
          ))
        )}
      </div>

      <div className="mt-3 mb-3">
        {candidates.map((c) => (
          <div
            key={c}
            className="skill-mobile-item"
            onClick={() => add(c)}
          >
            {c}
          </div>
        ))}
      </div>
    </AppModal>
  );
}
