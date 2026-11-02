import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!finePointer.matches || reducedMotion.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      glow.style.setProperty("--cursor-x", `${event.clientX}px`);
      glow.style.setProperty("--cursor-y", `${event.clientY}px`);
      glow.classList.add("cursor-glow--visible");
    };

    const handlePointerLeave = () => {
      glow.classList.remove("cursor-glow--visible");
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}