"use client";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export default function PageComponent({ children, className, title }: Props) {
  const classes = ["page", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
