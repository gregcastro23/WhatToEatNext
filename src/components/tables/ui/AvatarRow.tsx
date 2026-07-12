import { AvatarCircle, type AvatarPerson } from "./AvatarCircle";
import type { JSX } from "react";

export interface AvatarRowProps {
  people: AvatarPerson[];
  /** How many avatars render before collapsing into the +N cell. */
  max?: number;
  /** Avatar diameter in px. */
  size?: number;
  className?: string;
}

/**
 * Overlapping guest avatars with a "+N" overflow cell
 * (tables-design-spec.md §2.5).
 */
export function AvatarRow({
  people,
  max = 3,
  size = 28,
  className = "",
}: AvatarRowProps): JSX.Element {
  const visible = people.length > max ? people.slice(0, max) : people;
  const overflow = people.length - visible.length;
  return (
    <div
      className={`flex items-center -space-x-2 ${className}`}
      aria-label={`${people.length} guest${people.length === 1 ? "" : "s"}`}
    >
      {visible.map((person) => (
        <AvatarCircle
          key={person.name}
          {...person}
          size={size}
          className="border-2 border-alchm-bg-elev/80"
        />
      ))}
      {overflow > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-white/10 border-2 border-alchm-bg-elev/80 text-[10px] font-mono font-bold text-alchm-fg-dim"
          style={{ width: size, height: size }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export default AvatarRow;
