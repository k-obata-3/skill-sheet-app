type Props = {
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "success" | "danger" | "warning" | "light";
  className?: string;
  onClick?: () => void;        // ★ 追加
  style?: React.CSSProperties; // ★ 追加（任意）
};

export function AppBadge({
  children,
  tone = "primary",
  className,
  onClick,
  style,
}: Props) {
  const classes = [
    "app-badge",
    `app-badge-${tone}`,
    onClick ? "app-badge-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      onClick={onClick}
      style={style}
    >
      {children}
    </span>
  );
}
