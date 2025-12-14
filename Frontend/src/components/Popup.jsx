import { useEffect } from "react";
import "./Popup.css";

export default function Popup({ recoverDraft, discardDraft }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") discardDraft();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [discardDraft]);

  return (
    <div className="popup-overlay">
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title">
        <h2>Do you want to continue where you left off?</h2>

        <div className="popup-actions">
          <button type="button" className="btn restore" onClick={recoverDraft}>
            Yes, restore
          </button>

          <button type="button" className="btn discard" onClick={discardDraft}>
            No, start over
          </button>
        </div>
      </div>
    </div>
  );
}
