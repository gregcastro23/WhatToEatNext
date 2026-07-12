import { AvatarCircle, type AvatarPerson } from "./AvatarCircle";
import type { JSX } from "react";

export interface PresenceAvatarProps extends AvatarPerson {
  /** Diameter in px. */
  size?: number;
  /** Shows the violet bottom-right presence dot. */
  online?: boolean;
  /** Adds the animate-ping layer under the dot. */
  live?: boolean;
  className?: string;
}

/**
 * Avatar + bottom-right online dot (violet, glowing, void-ringed); a ping
 * layer pulses beneath it when live (tables-design-spec.md §2.6).
 */
export function PresenceAvatar({
  size = 48,
  online = false,
  live = false,
  className = "",
  ...person
}: PresenceAvatarProps): JSX.Element {
  const dotSize = Math.max(10, Math.round(size * 0.25));
  return (
    <span className={`relative inline-block ${className}`}>
      <AvatarCircle {...person} size={size} />
      {(online || live) && (
        <span
          className="absolute bottom-0 right-0 block"
          style={{ width: dotSize, height: dotSize }}
          role="status"
          aria-label={live ? `${person.name} is live` : `${person.name} is online`}
        >
          {live && (
            <span className="absolute inset-0 rounded-full bg-alchm-violet animate-ping" />
          )}
          <span className="absolute inset-0 rounded-full bg-alchm-violet border-2 border-alchm-bg shadow-[0_0_8px_rgba(181,126,224,0.8)]" />
        </span>
      )}
    </span>
  );
}

export default PresenceAvatar;
