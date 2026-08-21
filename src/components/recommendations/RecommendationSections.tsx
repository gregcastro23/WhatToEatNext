import React from "react";
import type { AlchemicalItem } from "@/calculations/alchemicalTransformation";
import type { AlchemicalRecommendations } from "@/services/AlchemicalTransformationService";

interface RecommendationSectionsProps {
  recommendations: AlchemicalRecommendations;
}

const RecommendationCardItem: React.FC<{ item: AlchemicalItem }> = ({ item }) => (
  <li key={item.id} className="recommendation-item">
    <h4>{item.name}</h4>
    <div className="item-details">
      <div className="detail">
        <span className="label">Dominant Element:</span>
        <span className="value">{item.dominantElement}</span>
      </div>
      <div className="detail">
        <span className="label">Alchemical Property:</span>
        <span className="value">{item.dominantAlchemicalProperty}</span>
      </div>
      {"gregsEnergy" in item && typeof item.gregsEnergy === "number" && (
        <div className="detail">
          <span className="label">Greg&apos;s Energy:</span>
          <span className="value">{item.gregsEnergy.toFixed(2)}</span>
        </div>
      )}
    </div>
    {"modality" in item && typeof item.modality === "string" && (
      <div className="item-modality">
        <span className={`modality-badge ${item.modality.toLowerCase()}`}>
          {item.modality}
        </span>
      </div>
    )}
  </li>
);

const RecommendationCategorySection: React.FC<{
  title: string;
  items: AlchemicalItem[];
  emptyMessage: string;
}> = ({ title, items, emptyMessage }) => (
  <div className="recommendation-section">
    <h3>{title}</h3>
    {items.length > 0 ? (
      <ul className="recommendation-list">
        {items.map((item) => (
          <RecommendationCardItem key={item.id} item={item} />
        ))}
      </ul>
    ) : (
      <p>{emptyMessage}</p>
    )}
  </div>
);

export const RecommendationSections: React.FC<RecommendationSectionsProps> = ({ recommendations }) => (
  <div className="recommendation-sections">
    <RecommendationCategorySection
      title="Recommended Ingredients"
      items={recommendations.topIngredients}
      emptyMessage="No ingredient recommendations available."
    />
    <RecommendationCategorySection
      title="Recommended Cooking Methods"
      items={recommendations.topMethods}
      emptyMessage="No cooking method recommendations available."
    />
    <RecommendationCategorySection
      title="Recommended Cuisines"
      items={recommendations.topCuisines}
      emptyMessage="No cuisine recommendations available."
    />
  </div>
);
