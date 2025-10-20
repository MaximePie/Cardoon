import { Hint } from "../Hint/Hint";

interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  placeholder?: string;
  isRequired?: boolean;
  hint?: string;
}

export default function Input({
  label,
  type,
  value,
  onChange,
  className,
  name,
  placeholder,
  isRequired = false,
  hint,
}: InputProps) {
  const inputId = label; // Use label as ID for accessibility

  return (
    <div className={`${className || ""} Input`}>
      <label htmlFor={inputId}>
        {label}
        {isRequired && <span className="Input__required">*</span>}
        {hint && <Hint text={hint} customClassName="Input__hint" />}
      </label>
      <input
        id={inputId}
        placeholder={placeholder || label || ""}
        type={type}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
}
