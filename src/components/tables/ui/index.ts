/**
 * Tables shared component kit (docs/design/tables-design-spec.md §2).
 * The six Tables screens compose these; screens live in a later PR.
 */

export {
  ELEMENT_COLORS,
  ELEMENT_GLYPHS,
  ELEMENT_ICONS,
  ELEMENTS,
  type Element,
  type ElementColor,
} from "./elements";
export { GlassPanel, type GlassPanelProps } from "./GlassPanel";
export { GradientText, type GradientTextProps } from "./GradientText";
export { GradientButton, type GradientButtonProps } from "./GradientButton";
export { LabelXS, type LabelXSProps } from "./LabelXS";
export type { AvatarPerson } from "./AvatarCircle";
export {
  AvatarClusterRing,
  type AvatarClusterRingProps,
  type AvatarClusterRingVariant,
} from "./AvatarClusterRing";
export { AvatarRow, type AvatarRowProps } from "./AvatarRow";
export { PresenceAvatar, type PresenceAvatarProps } from "./PresenceAvatar";
export {
  CompositeRadialBadge,
  computeElementArcs,
  type CompositeRadialBadgeProps,
  type CompositeRadialBadgeVariant,
  type ElementArc,
} from "./CompositeRadialBadge";
export { ElementChip, type ElementChipProps } from "./ElementChip";
export {
  ElementBars,
  elementPercentages,
  type ElementBarsProps,
} from "./ElementBars";
export {
  REACTION_KINDS,
  ReactionBar,
  type ReactionBarProps,
  type ReactionKind,
} from "./ReactionBar";
export {
  ChatBubble,
  type ChatBubbleProps,
  type ChatBubbleReaction,
} from "./ChatBubble";
export { ChatComposer, type ChatComposerProps } from "./ChatComposer";
export { RsvpChip, type RsvpChipProps, type RsvpStatus } from "./RsvpChip";
