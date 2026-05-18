import { ProcureChip } from "./ProcureChip";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ProcureChip> = {
  title: "Alchm/Commerce/ProcureChip",
  component: ProcureChip,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ProcureChip>;

export const Default: Story = { args: { price: "9.80", supplier: "Cortas" } };

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <ProcureChip price="32.40" supplier="Whole Earth Mkt." />
      <ProcureChip price="12.50" supplier="Burlap & Barrel" />
      <ProcureChip price="6.50" supplier="Sourced Botanical" />
    </div>
  ),
};
