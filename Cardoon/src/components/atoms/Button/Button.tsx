import classnames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

interface ButtonProps {
  children: React.ReactNode;
  customClassName?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "danger" | "secondary";
  icon?: React.ReactNode;
  tooltip?: string;
  tooltipId?: string;
  isLoading?: boolean;
  to?: string;
}

const makeTooltipIdFromContent = (content: string) => {
  if (!content) return undefined;
  return content
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString();
};

export default function Button({
  children,
  customClassName,
  disabled,
  onClick,
  variant,
  icon,
  tooltip,
  isLoading,
  to,
}: ButtonProps) {
  const className = classnames("Button", customClassName, {
    "Button--disabled": disabled,
    "Button--danger": variant === "danger",
    "Button--secondary": variant === "secondary",
    "Button--loading": isLoading,
    "Button--to": Boolean(to),
  });
  return (
    <>
      <button
        data-tooltip-content={tooltip}
        data-tooltip-id={
          tooltip ? makeTooltipIdFromContent(tooltip as string) : undefined
        }
        className={className}
        disabled={disabled}
        onClick={onClick}
        type="submit"
      >
        {to ? (
          <Link to={to} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ) : (
          children
        )}
        {isLoading && <span className="Button__loader" />}
        {icon && <span className="Button__icon">{icon}</span>}
      </button>
      <Tooltip
        id={tooltip ? makeTooltipIdFromContent(tooltip as string) : undefined}
      />
    </>
  );
}
