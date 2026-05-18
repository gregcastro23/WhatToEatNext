import { PremiumLockBadge } from "./PremiumLockBadge";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof PremiumLockBadge> = {
  title: "Alchm/Atoms/PremiumLockBadge",
  component: PremiumLockBadge,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof PremiumLockBadge>;

export const Default: Story = { render: () => <PremiumLockBadge /> };
