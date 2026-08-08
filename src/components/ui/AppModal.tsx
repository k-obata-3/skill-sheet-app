import { Modal } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fullscreen?: "sm-down" | "md-down" | "lg-down" | "xl-down" | "xxl-down" | "none";
};

export function AppModal({
  show,
  onClose,
  title,
  className,
  children,
  footer,
  fullscreen="sm-down",
}: Props) {
  const classes = ["app-modal", className]
    .filter(Boolean)
    .join(" ");


  return (
    <Modal
      show={show}
      onHide={onClose}
      fullscreen={fullscreen === "none" ? undefined : fullscreen}
      centered
      contentClassName={classes}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && (
        <Modal.Footer>
          {footer}
        </Modal.Footer>
      )}
    </Modal>
  );
}
