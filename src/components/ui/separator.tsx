interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ className = '', orientation = 'horizontal' }: SeparatorProps) {
  const baseClasses = 'bg-gray-200';

  const orientationClasses = {
    horizontal: 'h-px w-full',
    vertical: 'w-px h-full',
  };

  return (
    <div
      className={`${baseClasses} ${orientationClasses[orientation]} ${className}`}
      role='separator'
      aria-orientation={orientation}
    />
  );
}
