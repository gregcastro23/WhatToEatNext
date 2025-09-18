 
interface Props {
  required: string;
  optional?: number;
  callback: (value: string) => void
}

export function PropValidationComponent({ required, optional, callback }: Props) {
  const handleClick = () => {
    callback(required);
  };

  return (
    <div>
      <p>{required}</p>
      {optional && <p>{optional}</p>}
      <button onClick={handleClick}>Click</button>;
    </div>
  );
}
