import Image from 'next/image'
import type { ComponentProps, HTMLAttributes, ReactElement } from 'react'

export const Avatar = ({
  children,
  className = "",
  ...p
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div className={`rounded-full overflow-hidden ${className}`} {...p}>
    {children}
  </div>
);

type AvatarImageProps = Omit<
  ComponentProps<typeof Image>,
  "src" | "alt" | "width" | "height"
> & {
  src?: ComponentProps<typeof Image>["src"] | null;
  alt?: string;
  width?: number;
  height?: number;
};

export const AvatarImage = ({
  src,
  alt = "avatar",
  width = 40,
  height = 40,
  ...p
}: AvatarImageProps): ReactElement | null =>
  src ? <Image src={src} alt={alt} width={width} height={height} {...p} /> : null;

export const AvatarFallback = ({
  children,
  ...p
}: HTMLAttributes<HTMLDivElement>): ReactElement => <div {...p}>{children}</div>;
