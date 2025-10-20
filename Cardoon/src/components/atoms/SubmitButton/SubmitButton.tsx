import Loader from "../../atoms/Loader/Loader";
interface SubmitButtonProp {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function SubmitButton({
  children,
  className,
  disabled,
  isLoading,
}: SubmitButtonProp) {
  return (
    <button
      className={`Button ${className}`}
      disabled={disabled || isLoading}
      type="submit"
    >
      {children}
      {isLoading && <Loader className="Button__loader" />}
    </button>
  );
}
