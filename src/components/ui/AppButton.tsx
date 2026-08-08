import { Button } from "react-bootstrap";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "light" | "none";
  outline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ComponentProps<typeof Button>;

export function AppButton({
  children,
  variant = "primary",
  outline = false,
  size = undefined,
  className,
  ...props
}: Props) {
  const classes = [
    "app-button",
    outline ? `app-button-${variant}-outline` : `app-button-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button {...props} size={size} className={classes}>
      {children}
    </Button>
  );
}
