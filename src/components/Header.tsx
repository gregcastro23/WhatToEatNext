import React from 'react';

import { useState } from 'react';

interface HeaderProps {
  onServingsChange: (multiplier: number) => void;
}

export default function Header({ onServingsChange }: HeaderProps) {
  const [servings, setServings] = useState(1);

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setServings(value);
    onServingsChange(value);
  };

  return (
    // ... existing header JSX ...
    <div className="servings-control">
      <label htmlFor="servings">Servings:</label>
      <input
        type="number"
        id="servings"
        min="1"
        value={servings}
        onChange={handleServingsChange}
      />
    </div>
    // ... existing header JSX ...
  );
} 