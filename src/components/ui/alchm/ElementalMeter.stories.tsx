import { ElementalMeter } from "./ElementalMeter";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ElementalMeter> = {
  title: "Alchm/Atoms/ElementalMeter",
  component: ElementalMeter,
  parameters: { layout: "centered" },
  argTypes: {
    layout: { control: "radio", options: ["bars", "radial"] },
    compact: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof ElementalMeter>;

export const Bars: Story = {
  args: {
    values: { fire: 0.62, water: 0.28, earth: 0.71, air: 0.45 },
    layout: "bars",
  },
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
};

export const BarsCompact: Story = {
  args: { ...Bars.args, compact: true },
  decorators: Bars.decorators,
};

export const Radial: Story = {
  args: { ...Bars.args, layout: "radial" },
};

export const FireForward: Story = {
  args: {
    values: { fire: 0.92, water: 0.12, earth: 0.34, air: 0.6 },
    layout: "bars",
  },
  decorators: Bars.decorators,
};
