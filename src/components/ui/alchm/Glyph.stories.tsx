import { Glyph, type GlyphName } from "./Glyph";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof Glyph> = {
  title: "Alchm/Atoms/Glyph",
  component: Glyph,
  parameters: { layout: "centered" },
  argTypes: {
    name: { control: "select", options: ["orbital", "atom", "flask", "mortar", "spiral", "ring", "diamond", "triangle-up", "triangle-down", "triangle-up-bar", "triangle-down-bar", "crosshair", "wave", "search", "bookmark", "arrow", "chevron", "plus", "minus", "x", "check", "google", "settings"] satisfies GlyphName[] },
    size: { control: { type: "range", min: 12, max: 96, step: 2 } },
    stroke: { control: { type: "range", min: 0.4, max: 3, step: 0.1 } },
  },
};
export default meta;
type Story = StoryObj<typeof Glyph>;

export const Default: Story = {
  args: { name: "orbital", size: 32, stroke: 1.2 },
};

const ALL_NAMES: GlyphName[] = ["orbital", "atom", "flask", "mortar", "spiral", "ring", "diamond", "triangle-up", "triangle-down", "triangle-up-bar", "triangle-down-bar", "crosshair", "wave", "search", "bookmark", "arrow", "chevron", "plus", "minus", "x", "check", "google", "settings"];

export const AllGlyphs: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 24, color: "var(--fg)", maxWidth: 560 }}>
      {ALL_NAMES.map((n) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Glyph name={n} size={28} />
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};

export const Accented: Story = {
  args: { name: "atom", size: 48 },
  decorators: [(Story) => <span style={{ color: "var(--accent)" }}><Story /></span>],
};
