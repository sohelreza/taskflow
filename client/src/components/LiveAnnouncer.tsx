import { useEffect, useRef } from "react";

type LiveAnnouncerProps = {
  message: string;
  priority?: "polite" | "assertive";
};

export function LiveAnnouncer({
  message,
  priority = "polite",
}: Readonly<LiveAnnouncerProps>) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !regionRef.current) return;
    // Clear and reset to force re-announcement if the same message fires twice
    regionRef.current.textContent = "";
    const timer = setTimeout(() => {
      if (regionRef.current) regionRef.current.textContent = message;
    }, 50);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
