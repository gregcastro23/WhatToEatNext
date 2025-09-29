interface Props {
  title: string;
  children: React.ReactNode;
}

export function JSXComponent({ title, children }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
