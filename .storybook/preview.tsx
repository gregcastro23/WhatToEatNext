import type { Preview } from "@storybook/nextjs";
import React from "react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        obsidian: { name: "alchm-obsidian", value: "#07060B" },
        paper: { name: "alchm-paper", value: "#F2EDFF" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "obsidian" },
  },
  decorators: [
    (Story) => (
      <div className="lab alchm-root" style={{ padding: 24, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
