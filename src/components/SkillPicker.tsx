"use client";

import { useEffect, useState } from "react";
import { SkillPickerDesktop } from "./SkillPickerDesktop";
import { SkillPickerMobile } from "./SkillPickerMobile";

type Props = {
  title: string;
  options: string[];
  selectedItems: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  show: boolean;
};

export function SkillPicker({
  title,
  options,
  selectedItems,
  onChange,
  onClose,
  show,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 576);
    check();
    window.addEventListener("resize", check);
    return () =>
      window.removeEventListener("resize", check);
  }, []);

  return isMobile ? (
    <SkillPickerMobile title={title} options={options} selectedItems={selectedItems} onChange={onChange} onClose={onClose} show={show} />
  ) : (
    <SkillPickerDesktop title={title} options={options} selectedItems={selectedItems} onChange={onChange} onClose={onClose} show={show} />
  );
}
