import { ProcurementMark } from "./ProcurementMark";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ProcurementMark> = {
  title: "Alchm/Atoms/ProcurementMark",
  component: ProcurementMark,
  parameters: { layout: "centered" },
  argTypes: { size: { control: { type: "range", min: 12, max: 80, step: 2 } } },
};
export default meta;
type Story = StoryObj<typeof ProcurementMark>;

export const Default: Story = { args: { size: 28 } };
export const Large: Story = { args: { size: 64 } };
