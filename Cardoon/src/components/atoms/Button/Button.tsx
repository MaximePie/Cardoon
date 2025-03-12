interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default ({ children, className, disabled, onClick }: ButtonProps) => {
  return (
    <button
      className={`Button ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="submit"
    >
      {children}
    </button>
  );
};
