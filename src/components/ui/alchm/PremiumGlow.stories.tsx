import { PremiumMockProvider } from "./__stories/PremiumMockProvider";
import { PremiumGlow } from "./PremiumGlow";
import { Sparkline } from "./Sparkline";
import type { Meta, StoryObj } from "@storybook/nextjs";

const SAMPLE_FORECAST = [42, 44, 41, 47, 53, 58, 61, 64, 66, 70, 68, 72, 74, 78, 80];

const ForecastContent = () => (
  <div style={{ padding: 24, minHeight: 280, color: "var(--fg)" }}>
    <div className="t-tag">30-DAY FORECAST</div>
    <div className="t-display" style={{ fontSize: 28, marginTop: 6 }}>
      Carrot · Spirit alignment trend
    </div>
    <div style={{ marginTop: 18 }}>
      <Sparkline data={SAMPLE_FORECAST} width={420} height={80} />
    </div>
    <ul style={{ marginTop: 18, lineHeight: 1.6, color: "var(--fg-dim)", fontSize: 13 }}>
      <li>Match score peaks +18.4% over Mars hour stretches</li>
      <li>Companion uplift strongest with cumin (+9.1%)</li>
      <li>Forecast confidence band: ±4.2%</li>
    </ul>
  </div>
);

const meta: Meta<typeof PremiumGlow> = {
  title: "Alchm/Commerce/PremiumGlow",
  component: PremiumGlow,
  parameters: { layout: "centered" },
  argTypes: {
    revealAmount: { control: { type: "range", min: 0.1, max: 0.9, step: 0.05 } },
  },
};
export default meta;
type Story = StoryObj<typeof PremiumGlow>;

export const LockedFreeUser: Story = {
  decorators: [
    (Story) => (
      <PremiumMockProvider premium={false}>
        <div style={{ width: 560 }}>
          <Story />
        </div>
      </PremiumMockProvider>
    ),
  ],
  args: { revealAmount: 0.4 },
  render: (args) => (
    <PremiumGlow {...args}>
      <ForecastContent />
    </PremiumGlow>
  ),
};

export const UnlockedPremiumUser: Story = {
  decorators: [
    (Story) => (
      <PremiumMockProvider premium>
        <div style={{ width: 560 }}>
          <Story />
        </div>
      </PremiumMockProvider>
    ),
  ],
  render: () => (
    <PremiumGlow>
      <ForecastContent />
    </PremiumGlow>
  ),
};

export const ForcedLocked: Story = {
  args: { force: "locked", revealAmount: 0.55 },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
  render: (args) => (
    <PremiumGlow {...args}>
      <ForecastContent />
    </PremiumGlow>
  ),
};
