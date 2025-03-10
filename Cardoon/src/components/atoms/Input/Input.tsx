interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
}

export default ({
  label,
  type,
  value,
  onChange,
  className,
  name,
}: InputProps) => {
  return (
    <div className={`${className} Input`}>
      <label htmlFor={label}>{label}</label>
      <input
        placeholder={label}
        type={type}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
};
