import { FC, PropsWithChildren, ComponentProps } from 'react';

interface CustomProps {
  title: string;
  optional?: boolean
}

type ButtonProps = ComponentProps<'button'> & CustomProps;

export const _TypedComponent: FC<PropsWithChildren<CustomProps>> = ({
  title,
  optional = false,
  children
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {optional && <p>Optional content</p>}
      {children}
    </div>
  )
};

export const _TypedButton: FC<ButtonProps> = ({ title, ...buttonProps }) => {
  return <button {...buttonProps}>{title}</button>;
};
