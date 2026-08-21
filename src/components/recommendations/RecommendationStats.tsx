import React from "react";
import type { ElementalCharacter, AlchemicalProperty } from "@/constants/planetaryElements";
import type { AlchemicalRecommendations } from "@/services/AlchemicalTransformationService";
import type { LunarPhaseWithSpaces, ZodiacSign } from "@/types/alchemy";

interface EnergeticProfileProps {
  dominantElement: ElementalCharacter;
  dominantProperty: AlchemicalProperty;
  elementalBalance: Record<ElementalCharacter, number>;
  alchemicalProperties: Record<AlchemicalProperty, number>;
}

interface RecommendationStatsProps {
  recommendations: AlchemicalRecommendations;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  energeticProfile?: EnergeticProfileProps;
}

const DominantInfluences: React.FC<{
  recommendations: AlchemicalRecommendations;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
}> = ({ recommendations, currentZodiac, lunarPhase }) => (
  <>
    <h3>Dominant Influences</h3>
    <div className="stat-grid">
      <div className="stat">
        <span className="label">Dominant Element:</span>
        <span className="value">{recommendations.dominantElement}</span>
      </div>
      <div className="stat">
        <span className="label">Dominant Alchemical Property:</span>
        <span className="value">{recommendations.dominantAlchemicalProperty}</span>
      </div>
      {currentZodiac && (
        <div className="stat">
          <span className="label">Current Zodiac:</span>
          <span className="value">{currentZodiac}</span>
        </div>
      )}
      {lunarPhase && (
        <div className="stat">
          <span className="label">Lunar Phase:</span>
          <span className="value">{lunarPhase}</span>
        </div>
      )}
    </div>
  </>
);

const EnergeticGrid: React.FC<{ recommendations: AlchemicalRecommendations }> = ({ recommendations }) => (
  <>
    <h3>Energetic Profile</h3>
    <div className="stat-grid">
      <div className="stat">
        <span className="label">Heat:</span>
        <span className="value">{recommendations.heat.toFixed(2)}</span>
      </div>
      <div className="stat">
        <span className="label">Entropy:</span>
        <span className="value">{recommendations.entropy.toFixed(2)}</span>
      </div>
      <div className="stat">
        <span className="label">Reactivity:</span>
        <span className="value">{recommendations.reactivity.toFixed(2)}</span>
      </div>
      <div className="stat">
        <span className="label">Greg&apos;s Energy:</span>
        <span className="value">{recommendations.gregsEnergy.toFixed(2)}</span>
      </div>
    </div>
  </>
);

const BalanceBarsSection: React.FC<{
  title: string;
  items: Record<string, number>;
}> = ({ title, items }) => (
  <>
    <h3>{title}</h3>
    <div className="balance-bars">
      {Object.entries(items).map(([label, value]) => (
        <div key={label} className="balance-bar">
          <span className="element-label">{label}</span>
          <div className="bar-container">
            <div
              className={`bar-fill ${label.toLowerCase()}`}
              style={{ width: `${Math.min(100, value * 100)}%` }}
            />
          </div>
          <span className="percentage">{(value * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  </>
);

export const RecommendationStats: React.FC<RecommendationStatsProps> = ({
  recommendations,
  currentZodiac,
  lunarPhase,
  energeticProfile,
}) => (
  <div className="alchemical-stats">
    <DominantInfluences
      recommendations={recommendations}
      currentZodiac={currentZodiac}
      lunarPhase={lunarPhase}
    />
    <EnergeticGrid recommendations={recommendations} />
    {energeticProfile && (
      <div className="elemental-balance">
        <BalanceBarsSection title="Elemental Balance" items={energeticProfile.elementalBalance} />
        <BalanceBarsSection title="Alchemical Properties" items={energeticProfile.alchemicalProperties} />
      </div>
    )}
  </div>
);
