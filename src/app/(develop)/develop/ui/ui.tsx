"use client";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

export default function DevelopUI() {
  const colors = ["primary", "secondary", "success", "danger", "warning", "light"];
  return (
    <>
      <AppCard className="shadow-sm mb-3" title="AppButton">
        <div className="mb-2">
          {colors.map((color: any) => (
            <AppButton key={color} className="me-2" variant={color}>{color}</AppButton>
          ))}
        </div>
        <div className="mb-2">
          {colors.map((color: any) => (
            <AppButton key={color} className="me-2" variant={color} outline={true}>{color}</AppButton>
          ))}
        </div>
        <div className="mb-2">
          {colors.map((color: any) => (
            <AppButton key={color} className="me-2" variant={color} disabled>{color}</AppButton>
          ))}
        </div>
        <div>
          {colors.map((color: any) => (
            <AppButton key={color} className="me-2" variant={color} outline={true} disabled>{color}</AppButton>
          ))}
        </div>
      </AppCard>

      <AppCard className="shadow-sm mb-3" title="AppBadge">
        {colors.map((color: any) => (
          <AppBadge key={color} className="me-2" tone={color}>{color}</AppBadge>
        ))}
      </AppCard>
    </>
  );
}
