import { LiveTimecode } from "./LiveTimecode";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof LiveTimecode> = {
  title: "Alchm/Atoms/LiveTimecode",
  component: LiveTimecode,
  parameters: { layout: "centered" },
  argTypes: {
    format: { control: "radio", options: ["JD", "UTC"] },
  },
};
export default meta;
type Story = StoryObj<typeof LiveTimecode>;

export const JulianDay: Story = { args: { format: "JD" } };
export const UTC: Story = { args: { format: "UTC" } };
