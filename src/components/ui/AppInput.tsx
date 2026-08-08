import { Form } from "react-bootstrap";

type Props = {
  as?: "input" | "textarea";
  rows?: number;
  className?: string;
  minLength?: Number;
  maxLength?: Number
} & React.ComponentProps<typeof Form.Control>;

export function AppInput({
  as = "input",
  rows,
  className,
  minLength,
  maxLength,
  ...props
}: Props) {
  const classes = ["app-input", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Form.Control
      {...props}
      as={as}
      rows={rows}
      className={classes}
      minLength={minLength}
      maxLength={maxLength}
    />
  );
}
