import React, { useEffect } from "react";

export function ExhaustiveDepsComponent() {
  const value = "test";

  useEffect(() => {
    console.log(value);
  }, []); // Missing dependency - should be detected

  return <div>Exhaustive Deps Component</div>;
}
