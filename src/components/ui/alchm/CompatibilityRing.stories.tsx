import { CompatibilityRing } from "./CompatibilityRing";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof CompatibilityRing> = {
  title: "Alchm/Atoms/CompatibilityRing",
  component: CompatibilityRing,
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: { type: "range", min: 40, max: 240, step: 8 } },
  },
};
export default meta;
type Story = StoryObj<typeof CompatibilityRing>;

export const Default: Story = { args: { value: 0.87, size: 80, label: "MATCH" } };
export const Low: Story = { args: { value: 0.21, size: 80, label: "MATCH" } };
export const Hero: Story = { args: { value: 0.96, size: 200, label: "HARMONY" } };

export const Grid: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      <CompatibilityRing value={0.42} label="WEAK" />
      <CompatibilityRing value={0.66} label="OK" />
      <CompatibilityRing value={0.84} label="STRONG" />
      <CompatibilityRing value={0.96} size={120} label="PEAK" />
    </div>
  ),
};
