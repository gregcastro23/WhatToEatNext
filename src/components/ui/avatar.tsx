import Image from 'next/image'

export const Avatar = ({ children, className = "", ...p }: any) => <div className={`rounded-full overflow-hidden ${className}`} {...p}>{children}</div>;
export const AvatarImage = ({ src, alt = "avatar", width = 40, height = 40, ...p }: any) =>
  src ? <Image src={src as string} alt={alt as string} width={width as number} height={height as number} {...p} /> : null;
export const AvatarFallback = ({ children, ...p }: any) => <div {...p}>{children}</div>;
