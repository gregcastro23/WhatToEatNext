import React, { useState } from "react";

export function ConditionalHooksComponent({ condition }) {
  if (condition) {
    const [state] = useState(""); // Hooks in conditional - should error
  }

  return <div>Conditional Hooks</div>;
}
