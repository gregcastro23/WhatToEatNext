import React, { useState } from "react";
import AlchmKitchenTab from "./AlchmKitchenTab";

// Example of how to integrate Alchm Kitchen into another project
const IntegrationExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"main" | "alchm-kitchen">("main");
  const [kitchenLoaded, setKitchenLoaded] = useState(false);

  const handleKitchenLoad = () => {
    console.log("Alchm Kitchen loaded successfully!");
    setKitchenLoaded(true);
  };

  const handleKitchenError = (error: Error) => {
    console.error("Alchm Kitchen failed to load:", error);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("main")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab === "main" ? "#1e293b" : "#f8fafc",
            color: activeTab === "main" ? "#fff" : "#64748b",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            marginRight: "4px",
          }}
        >
          Main App
        </button>
        <button
          onClick={() => setActiveTab("alchm-kitchen")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab === "alchm-kitchen" ? "#1e293b" : "#f8fafc",
            color: activeTab === "alchm-kitchen" ? "#fff" : "#64748b",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🍳 Alchm Kitchen
          {kitchenLoaded && (
            <span
              style={{
                fontSize: "12px",
                backgroundColor: "#10b981",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "10px",
              }}
            >
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "main" && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
          }}
        >
          <h1>Your Main Application</h1>
          <p>
            This is your main application content. Click on the "Alchm Kitchen"
            tab to access the astrological food recommendation system.
          </p>

          <div
            style={{
              backgroundColor: "#e0f2fe",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <h3>Integration Features:</h3>
            <ul>
              <li>🍳 Astrological cuisine recommendations</li>
              <li>⭐ Elemental matching with current planetary positions</li>
              <li>🧪 Monica/Kalchm constant integration</li>
              <li>🥘 Recipe suggestions with alchemical properties</li>
              <li>🌙 Lunar phase and zodiac sign influences</li>
              <li>🌿 Sauce pairings and culinary harmony</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "alchm-kitchen" && (
        <div style={{ height: "calc(100vh - 120px)" }}>
          <AlchmKitchenTab
            title="Alchm Kitchen - Astrological Food Recommendations"
            onLoad={handleKitchenLoad}
            onError={handleKitchenError}
            allowFullscreen={true}
            style={{ height: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default IntegrationExample;
