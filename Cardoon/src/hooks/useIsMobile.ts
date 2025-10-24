import { useEffect, useState } from "react";
/**
 * Based on window width, determines if the device is mobile.
 */
function useIsMobile() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { isMobile: isMobileDevice };
}

export default useIsMobile;
