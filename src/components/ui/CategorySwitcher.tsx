"use client";

import { AppButton } from "@/components/ui/AppButton";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function CategorySwitcher<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="skill-summary-controls">
      <div className="select-row">
        {options.map((opt) => (
          <AppButton
            key={opt.value}
            outline={true}
            size="sm"
            className={opt.value === value ? "select-button active" : "select-button"}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </AppButton>
        ))}
      </div>
    </div>
  );
}
