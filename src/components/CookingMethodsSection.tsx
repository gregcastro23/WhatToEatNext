import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain } from 'lucide-react'; // Added elemental icons

// Define proper types for the methods
interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
}

interface Props {
  methods: CookingMethod[];
  onSelectMethod?: (method: CookingMethod) => void;
  selectedMethodId?: string;
  initiallyExpanded?: boolean;
}

const CookingMethodsSection: React.FC<Props> = ({ 
  methods, 
  onSelectMethod,
  selectedMethodId,
  initiallyExpanded = false
}) => {
  // Initialize expanded state based on method count (always expanded for ≤5 methods)
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded || methods.length <= 5);
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  
  // Auto-expand the section if we have methods and a pre-selected method
  useEffect(() => {
    if (methods.length > 0) {
      // Always keep expanded if ≤5 methods
      if (methods.length <= 5) {
        setIsExpanded(true);
      }
      
      // Also expand if there's a selected method
      if (selectedMethodId) {
        setIsExpanded(true);
        
        // Find the selected method
        const selectedMethod = methods.find(m => m.id === selectedMethodId);
        
        if (selectedMethod) {
          // If the selected method has variations, expand it
          if (selectedMethod.variations?.length) {
            setExpandedMethods(prev => ({
              ...prev,
              [selectedMethodId]: true
            }));
          }
          
          // If this is a variation, find and expand its parent method
          const parentMethod = methods.find(m => 
            m.variations?.some(v => v.id === selectedMethodId)
          );
          
          if (parentMethod) {
            setExpandedMethods(prev => ({
              ...prev,
              [parentMethod.id]: true
            }));
          }
        }
      }
    }
  }, [methods, selectedMethodId]);
  
  const toggleExpanded = () => {
    // Only allow toggling if there are more than 5 methods
    if (methods.length > 5) {
      setIsExpanded(prev => !prev);
    }
  };
  
  const toggleMethodExpanded = (methodId: string, e: React.MouseEvent) => {
    // Prevent the click from selecting the method
    e.stopPropagation();
    setExpandedMethods(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };
  
  // Get the top method from the list
  const topMethod = methods.length > 0 ? methods[0] : null;
  
  // Determine if the toggle button should be shown (only for >5 methods)
  const showToggle = methods.length > 5;
  
  return (
    <div className="cooking-methods-container">
      <div 
        className={`cooking-methods-header ${!showToggle ? 'no-toggle' : ''}`} 
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3>Cooking Methods</h3>
        {topMethod && (
          <div className="top-recommendation">
            Top: <span>{topMethod.name}</span>
          </div>
        )}
        {showToggle && (
          <button className="toggle-button">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="cooking-methods-content">
          {methods.map((method) => (
            <div 
              key={method.id} 
              className={`cooking-method-item ${selectedMethodId === method.id ? 'selected' : ''}`}
              onClick={() => onSelectMethod && onSelectMethod(method)}
            >
              <div className="method-header">
                <h4>{method.name}</h4>
                {method.score !== undefined && (
                  <div className="method-score">
                    <div 
                      className="score-bar"
                      style={{ width: `${Math.round(method.score * 100)}%` }}
                    />
                    <span>{Math.round(method.score * 100)}%</span>
                  </div>
                )}
                {method.variations && method.variations.length > 0 && (
                  <button 
                    className="toggle-variations"
                    onClick={(e) => toggleMethodExpanded(method.id, e)}
                  >
                    {expandedMethods[method.id] ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                    }
                  </button>
                )}
              </div>
              
              <p className="method-description">{method.description}</p>
              
              {/* Show elemental balance */}
              {method.elementalEffect && (
                <div className="elemental-balance">
                  {method.elementalEffect.Fire > 0.2 && (
                    <div className="element fire" title={`Fire: ${Math.round(method.elementalEffect.Fire * 100)}%`}>
                      <Flame size={14} />
                      <span>{Math.round(method.elementalEffect.Fire * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Water > 0.2 && (
                    <div className="element water" title={`Water: ${Math.round(method.elementalEffect.Water * 100)}%`}>
                      <Droplets size={14} />
                      <span>{Math.round(method.elementalEffect.Water * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Air > 0.2 && (
                    <div className="element air" title={`Air: ${Math.round(method.elementalEffect.Air * 100)}%`}>
                      <Wind size={14} />
                      <span>{Math.round(method.elementalEffect.Air * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Earth > 0.2 && (
                    <div className="element earth" title={`Earth: ${Math.round(method.elementalEffect.Earth * 100)}%`}>
                      <Mountain size={14} />
                      <span>{Math.round(method.elementalEffect.Earth * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show duration and suitable ingredients */}
              <div className="method-details">
                {method.duration && (
                  <div className="duration">
                    <span className="detail-label">Duration:</span> 
                    {method.duration.min}-{method.duration.max} min
                  </div>
                )}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div className="suitable-for">
                    <span className="detail-label">Ideal for:</span> 
                    {method.suitable_for.slice(0, 3).join(', ')}
                    {method.suitable_for.length > 3 && '...'}
                  </div>
                )}
              </div>
              
              {/* Show cultural variations if expanded */}
              {method.variations && method.variations.length > 0 && expandedMethods[method.id] && (
                <div className="variations-container">
                  <h5 className="variations-header">
                    Variations & Subcategories ({method.variations.length})
                  </h5>
                  <div className="variations-list">
                    {method.variations.map((variation) => (
                      <div 
                        key={variation.id} 
                        className={`variation-item ${selectedMethodId === variation.id ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent click
                          onSelectMethod && onSelectMethod(variation);
                        }}
                      >
                        <div className="variation-header">
                          <Globe size={14} className="culture-icon" />
                          <span className="variation-name">{variation.name}</span>
                          {variation.culturalOrigin && (
                            <span className="cultural-origin">{variation.culturalOrigin}</span>
                          )}
                          {variation.score !== undefined && (
                            <div className="variation-score">
                              <div 
                                className="score-bar"
                                style={{ width: `${Math.round(variation.score * 100)}%` }}
                              />
                              <span>{Math.round(variation.score * 100)}%</span>
                            </div>
                          )}
                        </div>
                        <p className="variation-description">{variation.description}</p>
                        
                        {/* Show elemental balance for variations too */}
                        {variation.elementalEffect && (
                          <div className="elemental-balance small">
                            {variation.elementalEffect.Fire > 0.2 && (
                              <div className="element fire" title={`Fire: ${Math.round(variation.elementalEffect.Fire * 100)}%`}>
                                <Flame size={12} />
                                <span>{Math.round(variation.elementalEffect.Fire * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Water > 0.2 && (
                              <div className="element water" title={`Water: ${Math.round(variation.elementalEffect.Water * 100)}%`}>
                                <Droplets size={12} />
                                <span>{Math.round(variation.elementalEffect.Water * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Air > 0.2 && (
                              <div className="element air" title={`Air: ${Math.round(variation.elementalEffect.Air * 100)}%`}>
                                <Wind size={12} />
                                <span>{Math.round(variation.elementalEffect.Air * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Earth > 0.2 && (
                              <div className="element earth" title={`Earth: ${Math.round(variation.elementalEffect.Earth * 100)}%`}>
                                <Mountain size={12} />
                                <span>{Math.round(variation.elementalEffect.Earth * 100)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .cooking-methods-container {
          border: 1px solid #eaeaea;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .cooking-methods-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          background-color: #f9f9f9;
        }
        
        .cooking-methods-header.no-toggle {
          cursor: default;
        }
        
        .top-recommendation {
          font-size: 0.8rem;
          color: #666;
          margin-left: auto;
          margin-right: 1rem;
        }
        
        .top-recommendation span {
          color: #333;
          font-weight: 500;
        }
        
        .cooking-methods-content {
          padding: 1rem;
        }
        
        .toggle-button, .toggle-variations {
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .cooking-method-item {
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .cooking-method-item:hover {
          background-color: #f9f9f9;
        }
        
        .cooking-method-item.selected {
          background-color: #f0f7ff;
          border-left: 3px solid #3b82f6;
        }
        
        .method-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .method-header h4 {
          font-size: 1rem;
          margin: 0;
          flex-grow: 1;
        }
        
        .method-score {
          display: flex;
          align-items: center;
          margin-left: 1rem;
          margin-right: 0.5rem;
        }
        
        .score-bar {
          height: 8px;
          background-color: #3b82f6;
          border-radius: 4px;
          width: 50px;
          margin-right: 0.25rem;
        }
        
        .method-description {
          font-size: 0.9rem;
          margin: 0 0 0.75rem;
          color: #555;
        }
        
        .method-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
        }
        
        .detail-label {
          color: #888;
          margin-right: 0.25rem;
        }
        
        .elemental-balance {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .elemental-balance.small {
          margin-top: 0.25rem;
          gap: 0.35rem;
        }
        
        .element {
          display: flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        
        .element span {
          margin-left: 0.25rem;
        }
        
        .element.fire {
          background-color: rgba(252, 88, 51, 0.1);
          color: #e73c0e;
        }
        
        .element.water {
          background-color: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }
        
        .element.air {
          background-color: rgba(99, 102, 241, 0.1);
          color: #4f46e5;
        }
        
        .element.earth {
          background-color: rgba(75, 85, 99, 0.1);
          color: #4b5563;
        }
        
        .variations-container {
          margin-top: 1rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #eaeaea;
        }
        
        .variations-header {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 0.75rem;
          font-weight: 500;
        }
        
        .variations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .variation-item {
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 0.75rem;
          border-left: 2px solid #ddd;
          transition: all 0.2s ease;
        }
        
        .variation-item:hover {
          background-color: #f0f7ff;
          border-left-color: #3b82f6;
        }
        
        .variation-item.selected {
          background-color: #f0f7ff;
          border-left-color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .variation-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.4rem;
          flex-wrap: wrap;
        }
        
        .culture-icon {
          color: #666;
          margin-right: 0.4rem;
        }
        
        .variation-name {
          font-weight: 500;
          font-size: 0.9rem;
          margin-right: 0.5rem;
        }
        
        .cultural-origin {
          font-size: 0.75rem;
          color: #666;
          background-color: rgba(99, 102, 241, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          margin-right: auto;
        }
        
        .variation-score {
          display: flex;
          align-items: center;
          margin-left: auto;
        }
        
        .variation-score .score-bar {
          height: 6px;
          width: 30px;
        }
        
        .variation-score span {
          font-size: 0.75rem;
        }
        
        .variation-description {
          font-size: 0.85rem;
          margin: 0 0 0.4rem;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default CookingMethodsSection; 