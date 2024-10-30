// /hooks/useKeyboardShortcuts.ts
import { useEffect } from "react";

const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Define your shortcut logic here
      if (event.key === "Enter") {
        console.log("Enter key pressed");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
};

export default useKeyboardShortcuts;
