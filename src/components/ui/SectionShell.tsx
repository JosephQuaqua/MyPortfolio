import { useEffect, useRef, type ReactNode } from "react";

interface SectionShellProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}

export function SectionShell({ id, number, title, children }: SectionShellProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      element?.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className="section reveal" aria-labelledby={`${id}-heading`}>
      <header className="section__header">
        <span className="section__number">{number}</span>
        <h2 id={`${id}-heading`} className="section__title">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}
