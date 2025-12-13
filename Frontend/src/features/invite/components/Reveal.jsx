import { capitalizeFirstLetter } from "../../../utils/capitalize";
import { useState } from "react";
import { launchFireworks } from "../../../utils/fireworks";
import { Lock, Unlock } from "lucide-react";
import "./Reveal.css";

export default function Reveal({ data }) {
  const [open, setOpen] = useState(false);
  const canReveal = data?.poll?.allVoted;

  console.log("Reveal data:", data.toName);

  return (
    <section className="card reveal-card">
      <h3 className="card-title">🎁 Your Secret Friend</h3>

      {!open && (
        <button
          className="btn btn-primary reveal-btn"
          disabled={!canReveal}
          onClick={() => {
            setOpen(true);
            launchFireworks();
          }}>
          {!canReveal ? (
            <div className="btn-reveal-container">
              <Lock size={18} />
              <span>Waiting for everyone to vote…</span>
            </div>
          ) : (
            <div className="reveal-btn-cnt">
              <Unlock size={18} />
              <span>Reveal!</span>
            </div>
          )}
        </button>
      )}

      {open && (
        <p className="reveal-result animate-reveal">
          🎉 You got: &nbsp;
          <strong>{capitalizeFirstLetter(data?.toName)}</strong>
        </p>
      )}
    </section>
  );
}
