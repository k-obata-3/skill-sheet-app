import { Form } from "react-bootstrap";

type Props = {
  checked: boolean;
  value: string;
  onChange: (next: boolean, value: string) => void;
  inline?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AppCheckbox({
  checked,
  value,
  onChange,
  inline,
  disabled,
  className,
}: Props) {
  const classes = [
    "app-check-box",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Form.Check
      id={value}
      checked={checked}
      value={value}
      onChange={() => onChange(!checked, value)}
      label={value}
      inline={inline ?? true}
      disabled={disabled ?? false}
    >
    </Form.Check>
  )
}
