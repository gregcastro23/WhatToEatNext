import { ProcurementKit, type ProcurementItem } from "./ProcurementKit";
import type { Meta, StoryObj } from "@storybook/nextjs";

const SAMPLE_ITEMS: ProcurementItem[] = [
  { sym: "BCK", n: "Grass-fed beef cheek, 1.2 kg", src: "Whole Earth Mkt.", px: "32.40", qty: 1 },
  { sym: "PMG", n: "Pomegranate molasses, 250 ml", src: "Cortas", px: "9.80", qty: 1 },
  { sym: "SUM", n: "Sumac, fresh-milled, 60 g", src: "Burlap & Barrel", px: "12.50", qty: 1 },
  { sym: "BGL", n: "Aged black garlic, 8 cloves", src: "Black Garlic Co.", px: "14.00", qty: 2 },
  { sym: "BAY", n: "California bay laurel, dried", src: "Sourced Botanical", px: "6.50", qty: 1 },
  { sym: "LBN", n: "Labneh, hand-strained, 200 g", src: "Karoun", px: "9.00", qty: 1 },
];

const meta: Meta<typeof ProcurementKit> = {
  title: "Alchm/Commerce/ProcurementKit",
  component: ProcurementKit,
  parameters: { layout: "centered" },
  argTypes: { compact: { control: "boolean" } },
};
export default meta;
type Story = StoryObj<typeof ProcurementKit>;

export const FullKit: Story = {
  args: { compact: false },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
};

export const Compact: Story = {
  args: { compact: true },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
};

export const WithExplicitItems: Story = {
  args: { items: SAMPLE_ITEMS, compact: false },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
};
