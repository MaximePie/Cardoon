interface SubmitButtonProp {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default ({ children, className, disabled }: SubmitButtonProp) => {
  return (
    <button className={`Button ${className}`} disabled={disabled} type="submit">
      {children}
    </button>
  );
};
