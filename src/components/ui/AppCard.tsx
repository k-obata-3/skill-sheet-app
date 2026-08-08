import { Card } from "react-bootstrap";
import { BsQuestionCircle } from "react-icons/bs";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onclick?: () => void;
};

export function AppCard({ children, className, title, onclick }: Props) {
  const classes = ["app-card", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={classes}>
      {title &&
        <h5 className="ms-3 mt-3">
          {title}
          {onclick && (
            <BsQuestionCircle size={16} className="ms-1" onClick={() => onclick()} style={{cursor: "pointer", marginTop: "-0.25rem"}} />
          )}
        </h5>
      }
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}
