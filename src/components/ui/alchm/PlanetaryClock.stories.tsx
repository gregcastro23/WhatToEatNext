import { PlanetaryClock } from "./PlanetaryClock";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof PlanetaryClock> = {
  title: "Alchm/Atoms/PlanetaryClock",
  component: PlanetaryClock,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: { type: "range", min: 200, max: 640, step: 20 } },
    rotation: { control: { type: "range", min: 0, max: 360, step: 1 } },
    style: { control: "select", options: ["orbital", "radial", "constellation"] },
    activeId: { control: "select", options: ["Sol", "Mercury", "Venus", "Luna", "Mars", "Jupiter", "Saturn"] },
    motion: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof PlanetaryClock>;

export const Orbital: Story = {
  args: { size: 360, rotation: 42, style: "orbital", activeId: "Mars", motion: true },
};

export const Constellation: Story = {
  args: { ...Orbital.args, style: "constellation" },
};

export const Large: Story = {
  args: { size: 560, rotation: 120, style: "orbital", activeId: "Jupiter" },
};

export const StaticDial: Story = {
  args: { size: 360, rotation: 0, motion: false, activeId: "Sol" },
};
