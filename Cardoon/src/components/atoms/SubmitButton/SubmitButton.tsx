import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>({ width: 0, height: 48 });

  useEffect(() => {
    if (buttonRef.current && !initialSize) {
      const { width, height } = buttonRef.current.getBoundingClientRect();
      setInitialSize({ width, height });
    }
  }, [buttonRef, initialSize]);

  return (
    <motion.button
      className={`Button ${className || ""}`.trim()}
      disabled={disabled || isLoading}
      type="submit"
      initial={false}
      layout
      animate={{
        width: isLoading ? "48px" : initialSize?.width || "auto",
        height: isLoading ? "48px" : initialSize?.height || "auto",
      }}
    >
      {isLoading ? (
        <motion.div
          layout // ✅ Animer le contenu aussi
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader className="Button__loader" size="medium" />
        </motion.div>
      ) : (
        <motion.div
          layout // ✅ Animer le contenu aussi
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.button>
  );
}
