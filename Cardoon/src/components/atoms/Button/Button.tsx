import React from "react";
import classnames from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  customClassName?: string;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "danger";
}

export default ({
  children,
  customClassName,
  disabled,
  onClick,
  variant,
}: ButtonProps) => {
  const className = classnames("Button", customClassName, {
    "Button--disabled": disabled,
    "Button--danger": variant === "danger",
  });
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type="submit"
    >
      {children}
    </button>
  );
};
