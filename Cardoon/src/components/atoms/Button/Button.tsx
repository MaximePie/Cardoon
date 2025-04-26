import React from "react";
import classnames from "classnames";
import { Tooltip } from "react-tooltip";

interface ButtonProps {
  children: React.ReactNode;
  customClassName?: string;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "danger" | "secondary";
  icon?: React.ReactNode;
  tooltip?: string;
  tooltipId?: string;
}

const makeTooltipIdFromContent = (content: string) => {
  if (!content) return undefined;
  console.log("content", content);
  return content
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString();
};

export default ({
  children,
  customClassName,
  disabled,
  onClick,
  variant,
  icon,
  tooltip,
}: ButtonProps) => {
  const className = classnames("Button", customClassName, {
    "Button--disabled": disabled,
    "Button--danger": variant === "danger",
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
        {icon && <span className="Button__icon">{icon}</span>}
        {children}
      </button>
      <Tooltip
        id={tooltip ? makeTooltipIdFromContent(tooltip as string) : undefined}
      />
    </>
  );
};
