/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
interface Props {
  required: string;
  optional?: number;
  callback: (value: string) => void;
}

export function PropValidationComponent({ required, optional, callback }: Props) {
  const handleClick = () => {
    callback(required);
  };

  return (
    <div>
      <p>{required}</p>
      {optional && <p>{optional}</p>}
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
