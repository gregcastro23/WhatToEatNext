 
export function ListComponent() {
  const items = ['a', 'b', 'c'];

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
