import React from "react";
import type { ElementalCharacter, AlchemicalProperty } from "@/constants/planetaryElements";
import type { Modality } from "@/data/ingredients/types";

interface RecommendationFiltersProps {
  targetElement: ElementalCharacter | undefined;
  targetProperty: AlchemicalProperty | undefined;
  modalityFilter: Modality | "all";
  onTargetElementChange: (val: ElementalCharacter | undefined) => void;
  onTargetPropertyChange: (val: AlchemicalProperty | undefined) => void;
  onModalityFilterChange: (val: Modality | "all") => void;
}

const ElementSelect: React.FC<{
  value: ElementalCharacter | undefined;
  onChange: (val: ElementalCharacter | undefined) => void;
}> = ({ value, onChange }) => (
  <div className="filter-group">
    <label htmlFor="recommendation-element-filter">Element:</label>
    <select
      id="recommendation-element-filter"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? (e.target.value as ElementalCharacter) : undefined)}
    >
      <option value="">Any Element</option>
      <option value="Fire">Fire</option>
      <option value="Water">Water</option>
      <option value="Air">Air</option>
      <option value="Earth">Earth</option>
    </select>
  </div>
);

const PropertySelect: React.FC<{
  value: AlchemicalProperty | undefined;
  onChange: (val: AlchemicalProperty | undefined) => void;
}> = ({ value, onChange }) => (
  <div className="filter-group">
    <label htmlFor="recommendation-property-filter">Alchemical Property:</label>
    <select
      id="recommendation-property-filter"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? (e.target.value as AlchemicalProperty) : undefined)}
    >
      <option value="">Any Property</option>
      <option value="Spirit">Spirit</option>
      <option value="Essence">Essence</option>
      <option value="Matter">Matter</option>
      <option value="Substance">Substance</option>
    </select>
  </div>
);

const ModalitySelect: React.FC<{
  value: Modality | "all";
  onChange: (val: Modality | "all") => void;
}> = ({ value, onChange }) => (
  <div className="filter-group">
    <label htmlFor="modality-filter">Quality:</label>
    <select
      id="modality-filter"
      value={value}
      onChange={(e) => onChange(e.target.value as Modality | "all")}
    >
      <option value="all">All</option>
      <option value="Cardinal">Cardinal</option>
      <option value="Fixed">Fixed</option>
      <option value="Mutable">Mutable</option>
    </select>
  </div>
);

export const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  targetElement,
  targetProperty,
  modalityFilter,
  onTargetElementChange,
  onTargetPropertyChange,
  onModalityFilterChange,
}) => (
  <div className="recommendations-filters">
    <h3>Filter Recommendations</h3>
    <div className="filter-controls">
      <ElementSelect value={targetElement} onChange={onTargetElementChange} />
      <PropertySelect value={targetProperty} onChange={onTargetPropertyChange} />
      <ModalitySelect value={modalityFilter} onChange={onModalityFilterChange} />
    </div>
  </div>
);
