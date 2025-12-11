import "../styles/Popup.css";

export default function Popup({ recoverDraft, discardDraft }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Do you want to continue where you left off?</h3>

        <div className="popup-actions">
          <button className="btn restore" onClick={recoverDraft}>
            Yes, restore
          </button>

          <button className="btn discard" onClick={discardDraft}>
            No, start over
          </button>
        </div>
      </div>
    </div>
  );
}
