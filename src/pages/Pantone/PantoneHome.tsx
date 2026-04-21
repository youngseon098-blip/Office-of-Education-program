import { useEffect } from "react";

const TOPTRUMPS_MISSION_LOCAL_URL = "/toptrumps-mission/index.html";
const TOPTRUMPS_SKIP_INTRO_KEY = "toptrumps_skip_intro_overlay";

export default function PantoneHome() {
  useEffect(() => {
    const navEntries =
      typeof performance.getEntriesByType === "function"
        ? performance.getEntriesByType("navigation")
        : [];
    const navType = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming).type : "";
    if (navType === "reload") {
      window.location.replace("/");
      return;
    }

    try {
      localStorage.removeItem(TOPTRUMPS_SKIP_INTRO_KEY);
    } catch (_) {}
  }, []);

  return (
    <main style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" }}>
      <iframe
        title="Top Trumps Mission"
        src={TOPTRUMPS_MISSION_LOCAL_URL}
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </main>
  );
}
