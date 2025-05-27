import { useState, useEffect, createContext } from "react";
import Confetti from "react-confetti";

export const ConfettiContext = createContext({
  isConfettiVisible: false,
  showConfetti: () => {},
});
export const ConfettiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConfettiVisible, setConfettiVisibility] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isConfettiVisible) {
      const timeout = setTimeout(() => setConfettiVisibility(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [isConfettiVisible]);

  const showConfetti = () => {
    setConfettiVisibility(true);
  };

  return (
    <ConfettiContext.Provider value={{ isConfettiVisible, showConfetti }}>
      {children}
      {isConfettiVisible && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={100}
          recycle={false}
        />
      )}
    </ConfettiContext.Provider>
  );
};
