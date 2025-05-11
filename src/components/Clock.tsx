'use client';

import { useState, useEffect } from 'react';

let Clock = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    let updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime(); // Initial call
    let interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-2 bg-gray-800 text-white font-mono text-xl">
      {time}
    </div>
  );
};

export default Clock; 