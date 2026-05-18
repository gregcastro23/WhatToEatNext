import { ScanLine } from "./ScanLine";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ScanLine> = {
  title: "Alchm/Atoms/ScanLine",
  component: ScanLine,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ScanLine>;

export const OverlayingAPanel: Story = {
  render: () => (
    <div style={{ position: "relative", width: 360, height: 200, border: "1px solid var(--line-hi)", borderRadius: 12, background: "var(--bg-elev)", overflow: "hidden" }}>
      <ScanLine />
      <div style={{ padding: 18, color: "var(--fg)" }}>
        <div className="t-tag">PANEL · SCAN</div>
        <div className="t-display" style={{ fontSize: 22 }}>Surface in observation</div>
      </div>
    </div>
  ),
};
