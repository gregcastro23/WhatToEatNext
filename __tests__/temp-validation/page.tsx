import React from "react";

export default function Page() {
  return (
    <main>
      <h1>App Router Page</h1>
    </main>
  );
}

export function generateMetadata() {
  return {
    title: "Test Page",
  };
}
