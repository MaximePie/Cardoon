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

export default ({
  label,
  type,
  value,
  onChange,
  className,
  name,
  placeholder,
  isRequired = false,
}: InputProps) => {
  return (
    <div className={`${className || ""} Input`}>
      <label htmlFor={label}>
        {label}
        {isRequired && <span className="Input__required">*</span>}
      </label>
      <input
        placeholder={placeholder || label || ""}
        type={type}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
};
