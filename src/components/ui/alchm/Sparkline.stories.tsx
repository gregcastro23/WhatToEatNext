import { Sparkline } from "./Sparkline";
import type { Meta, StoryObj } from "@storybook/nextjs";

const SEASONAL_YIELD = [12, 14, 18, 22, 28, 36, 44, 52, 48, 36, 22, 14];
const FORECAST = [42, 44, 41, 47, 53, 58, 61, 64, 66, 70, 68, 72, 74, 78, 80];
const VOLATILE = [10, 18, 8, 22, 12, 30, 16, 28, 14, 36, 18];

const meta: Meta<typeof Sparkline> = {
  title: "Alchm/Atoms/Sparkline",
  component: Sparkline,
  parameters: { layout: "centered" },
  argTypes: {
    width: { control: { type: "range", min: 80, max: 480, step: 10 } },
    height: { control: { type: "range", min: 20, max: 120, step: 4 } },
    filled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Default: Story = { args: { data: FORECAST, width: 220, height: 48, filled: true } };
export const SeasonalYield: Story = { args: { data: SEASONAL_YIELD, width: 320, height: 56, filled: true } };
export const Stroked: Story = { args: { data: VOLATILE, width: 220, height: 48, filled: false } };

export const Trio: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, color: "var(--fg)" }}>
      <div>
        <div className="t-tag">SEASONAL YIELD</div>
        <Sparkline data={SEASONAL_YIELD} width={200} height={48} />
      </div>
      <div>
        <div className="t-tag">30-DAY FORECAST</div>
        <Sparkline data={FORECAST} width={200} height={48} />
      </div>
      <div>
        <div className="t-tag">VOLATILE</div>
        <Sparkline data={VOLATILE} width={200} height={48} filled={false} />
      </div>
    </div>
  ),
};
