import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip } from "react-tooltip";
interface HintProps {
  text: string;
  customClassName?: string;
}
export const Hint = ({ text, customClassName }: HintProps) => {
  return (
    <div className={`Hint ${customClassName}`}>
      <Tooltip id="hint-tooltip" content={text} className="Hint__tooltip" />
      <HelpOutlineIcon
        className="Hint__icon"
        data-tooltip-id="hint-tooltip"
        data-tooltip-content={text}
      />
    </div>
  );
};
