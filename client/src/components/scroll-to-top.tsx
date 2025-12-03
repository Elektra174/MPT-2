import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const checkScroll = () => {
      setIsVisible(mainElement.scrollTop > 200);
    };

    mainElement.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      mainElement.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const scrollToTop = () => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-[9999] rounded-full w-14 h-14 shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center no-print border-2 border-white cursor-pointer"
      data-testid="button-scroll-to-top"
      aria-label="Наверх"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}
