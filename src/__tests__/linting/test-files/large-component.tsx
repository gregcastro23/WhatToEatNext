import { memo, useCallback, useMemo } from 'react';

interface ItemProps {
  id: number;
  name: string;
  onClick: (id: number) => void;
}

const MemoizedItem = memo(({ id, name, onClick }: ItemProps) => {
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return <div onClick={handleClick}>{name}</div>;
});

export function LargeComponentTree() {
  const items = useMemo(
    () =>
      Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      })),
    [],
  );

  const handleItemClick = useCallback((id: number) => {
    console.log('Clicked item:', id);
  }, []);

  return (
    <div>
      {items.map(item => (
        <MemoizedItem key={item.id} id={item.id} name={item.name} onClick={handleItemClick} />
      ))}
    </div>
  );
}
