import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip } from "react-tooltip";
import { useId } from "react";
interface HintProps {
  text: string;
  customClassName?: string;
}
export const Hint = ({ text, customClassName }: HintProps) => {
  const id = useId();

  return (
    <span className={`Hint ${customClassName || ""}`}>
      <Tooltip id={id} content={text} className="Hint__tooltip" />
      <HelpOutlineIcon
        className="Hint__icon"
        data-tooltip-id={id}
        data-tooltip-content={text}
      />
    </span>
  );
};
