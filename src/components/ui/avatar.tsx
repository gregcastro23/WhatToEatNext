export const Avatar = ({ children, className = "", ...p }: any) => <div className={`rounded-full overflow-hidden ${className}`} {...p}>{children}</div>;
export const AvatarImage = ({ ...p }: any) => <img {...p} alt="avatar" />;
export const AvatarFallback = ({ children, ...p }: any) => <div {...p}>{children}</div>;