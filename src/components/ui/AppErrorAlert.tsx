import { Alert } from "react-bootstrap";

type Props = {
  message: string | null;
};

export function AppErrorAlert({ message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>
      {message}
    </Alert>
  );
}
