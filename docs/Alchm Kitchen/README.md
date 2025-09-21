# Alchm Kitchen - Integration Guide

🍳 **Astrological Food Recommendation System with Alchemical Integration**

The Alchm Kitchen is a sophisticated food recommendation system that combines
astrological calculations, elemental matching, and alchemical principles
(Monica/Kalchm constants) to provide personalized cuisine and recipe
suggestions.

## 🌟 Features

- **Astrological Integration**: Real-time planetary positions and zodiac
  influences
- **Elemental Matching**: Fire, Water, Earth, Air compatibility with current
  cosmic state
- **Monica/Kalchm Constants**: Advanced alchemical calculations for optimal food
  harmony
- **Cuisine Recommendations**: Personalized cuisine suggestions based on
  celestial alignment
- **Recipe Suggestions**: Detailed recipes with elemental properties and cooking
  methods
- **Sauce Pairings**: Harmonious sauce recommendations with astrological
  compatibility
- **Seasonal Optimization**: Seasonal adjustments for optimal culinary
  experiences

## 🚀 Quick Integration

### Option 1: Iframe Integration (Recommended)

```tsx
import React from 'react';
import AlchmKitchenTab from './AlchmKitchenTab';

function YourApp() {
  return (
    <div>
      <h1>Your Application</h1>
      <AlchmKitchenTab
        title="Alchm Kitchen"
        allowFullscreen={true}
        onLoad={() => console.log('Kitchen loaded!')}
      />
    </div>
  );
}
```

### Option 2: Direct URL Integration

```tsx
function AlchmKitchenTab() {
  return (
    <iframe
      src="https://v0-alchm-kitchen.vercel.app/"
      width="100%"
      height="600px"
      style={{ border: 'none', borderRadius: '8px' }}
      title="Alchm Kitchen"
    />
  );
}
```

### Option 3: Tab System Integration

```tsx
import React, { useState } from 'react';
import AlchmKitchenTab from './AlchmKitchenTab';

function TabbedApp() {
  const [activeTab, setActiveTab] = useState('main');

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('main')}>Main App</button>
        <button onClick={() => setActiveTab('kitchen')}>🍳 Alchm Kitchen</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'main' && <div>Your main app content</div>}
      {activeTab === 'kitchen' && (
        <AlchmKitchenTab
          title="Alchm Kitchen"
          style={{ height: 'calc(100vh - 100px)' }}
        />
      )}
    </div>
  );
}
```

## 📋 Component Props

| Prop              | Type          | Default         | Description                        |
| ----------------- | ------------- | --------------- | ---------------------------------- |
| `title`           | string        | "Alchm Kitchen" | Title displayed in the header      |
| `className`       | string        | ""              | Additional CSS classes             |
| `style`           | CSSProperties | {}              | Inline styles for the container    |
| `showHeader`      | boolean       | true            | Whether to show the header bar     |
| `allowFullscreen` | boolean       | true            | Enable fullscreen toggle           |
| `onLoad`          | function      | undefined       | Callback when iframe loads         |
| `onError`         | function      | undefined       | Callback when iframe fails to load |

## 🔧 Development Setup

### Prerequisites

- Node.js >= 20.18.0
- Yarn >= 1.22.0

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd WhatToEatNext

# Install dependencies
yarn install

# Start development server
yarn dev

# The Alchm Kitchen will be available at http://localhost:3003
```

### Production Deployment

The Alchm Kitchen is deployed at: **https://v0-alchm-kitchen.vercel.app/**

## 🧪 API Endpoints

The Alchm Kitchen provides several API endpoints for integration:

- `GET /api/astrologize` - Get current astrological state
- `GET /api/nutrition` - Nutrition information
- `GET /api/planetary-positions` - Current planetary positions
- `GET /api/recipes` - Recipe data

## 🌙 Astrological Features

### Planetary Influences

- **Sun**: Active energy, heat, transformation
- **Moon**: Passive energy, cooling, preservation
- **Mercury**: Movement, change, volatility
- **Venus**: Harmony, balance, beauty
- **Mars**: Dynamic energy, passion, intensity
- **Jupiter**: Expansion, wisdom, abundance
- **Saturn**: Structure, discipline, grounding

### Elemental System

- **Fire**: Active energy, heat, transformation
- **Water**: Passive energy, cooling, preservation
- **Earth**: Stability, grounding, structure
- **Air**: Movement, change, volatility

### Alchemical Constants

- **Monica Constant**: Dynamic system constant relating energy to equilibrium
- **Kalchm (K_alchm)**: Alchemical equilibrium constant
- **Greg's Energy**: Overall energy balance calculation

## 🍽️ Cuisine Integration

The system includes comprehensive cuisine data with:

- Elemental properties for each cuisine
- Astrological influences and zodiac alignments
- Seasonal optimization factors
- Cultural synergy calculations
- Monica/Kalchm compatibility profiles

## 🔮 Recipe Recommendations

Recipes are enhanced with:

- Elemental matching scores
- Astrological alignment percentages
- Seasonal optimization factors
- Difficulty and preparation time
- Ingredient alchemical properties
- Cooking method elemental influences

## 🌿 Sauce Pairings

Sauce recommendations include:

- Cuisine-specific compatibility
- Current moment elemental alignment
- Planetary hour optimization
- Seasonal adjustments
- Cultural origin considerations

## 📱 Responsive Design

The Alchm Kitchen is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🔒 Security & Privacy

- All calculations are performed client-side
- No personal data is stored or transmitted
- Uses secure iframe sandboxing
- Respects user privacy and preferences

## 🛠️ Customization

### Styling

```tsx
<AlchmKitchenTab
  style={{
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e2e8f0'
  }}
/>
```

### Event Handling

```tsx
<AlchmKitchenTab
  onLoad={() => {
    console.log('Alchm Kitchen is ready!');
    // Your custom logic here
  }}
  onError={(error) => {
    console.error('Failed to load:', error);
    // Handle error gracefully
  }}
/>
```

## 📞 Support

For integration support or questions:

- Check the configuration in `integration-config.json`
- Review the example in `IntegrationExample.tsx`
- Ensure your environment meets the prerequisites

## 🎯 Use Cases

- **Personal Food Apps**: Add astrological food recommendations
- **Wellness Platforms**: Integrate cosmic culinary guidance
- **Recipe Websites**: Enhance with elemental matching
- **Lifestyle Apps**: Include seasonal food optimization
- **Educational Tools**: Teach astrological and alchemical principles

---

**Made with 🌟 by the Alchm Kitchen Team**
