import { PremiumMark } from "./PremiumMark";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof PremiumMark> = {
  title: "Alchm/Atoms/PremiumMark",
  component: PremiumMark,
  parameters: { layout: "centered" },
  argTypes: { size: { control: { type: "range", min: 10, max: 64, step: 2 } } },
};
export default meta;
type Story = StoryObj<typeof PremiumMark>;

export const Default: Story = { args: { size: 16 } };
export const Large: Story = { args: { size: 48 } };
