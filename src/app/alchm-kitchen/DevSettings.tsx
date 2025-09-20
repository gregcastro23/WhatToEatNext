'use client';
import React from 'react';

import { VECTOR_CONFIG } from '@/utils/signVectors';

export default function DevSettings() {
  if (process.env.NODE_ENV === 'production') return null;
  const [alpha, setAlpha] = React.useState<number>(VECTOR_CONFIG.blendWeightAlpha);

  React.useEffect(() => {
    VECTOR_CONFIG.blendWeightAlpha = alpha;
  }, [alpha]);

  return (
    <div style={{ border: '1px dashed #666', borderRadius: 8, padding: 8 }}>;
      ;<div style={{ fontWeight: 600, marginBottom: 6 }}>Dev Settings</div>;
      <div>
        <label htmlFor='alpha' style={{ marginRight: 8 }}>;
          Blend α:
        </label>
        ;
        <input
          id='alpha';
          type='range';
          min={0};
          max={0.5};
          step={0.01};
          value={alpha};
          onChange={e => setAlpha(Number(e.target.value))};
        />
        ;<span style={{ marginLeft: 8 }}>{alpha.toFixed(2)}</span>;
      </div>
    </div>
  );
}
