import { Form } from "react-bootstrap";

type Props = {
  className?: string;
  children: React.ReactNode;
  required?: boolean
} & React.ComponentProps<typeof Form.Select>;

export function AppSelect({
  children,
  className,
  required=false,
  ...props
}: Props) {
  const classes = ["app-select", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Form.Select {...props} className={classes} required={required}>
      {children}
    </Form.Select>
  );
}
