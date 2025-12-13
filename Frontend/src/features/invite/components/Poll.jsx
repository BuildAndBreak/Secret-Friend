import { capitalizeFirstLetter } from "../../../utils/capitalize";
import { API } from "../../../api/draws";
import { useState } from "react";
import { WhatsappIcon } from "react-share";
import { Vote } from "lucide-react";
import "./Poll.css";

export default function Poll({ data, loadMember }) {
  const [selectedPrice, setSelectedPrice] = useState(null);

  async function vote(option) {
    try {
      await fetch(`${API}/api/groups/${data.groupCode}/poll/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: data.member.id, option }),
      });

      loadMember();
    } catch (err) {
      console.error(err);
    }
  }

  const names = data?.notVoted
    ?.map((m) => capitalizeFirstLetter(m.name))
    .join(", ");
  const shareMessage = `Reminder for ${names} \nPlease vote on the gift budget to unlock your Secret Santa.`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    shareMessage
  )}`;

  function handleWhatsAppShare() {
    window.open(whatsappHref, "_blank");
  }

  return (
    <section className="card poll-card">
      <h3 className="card-title">
        <Vote size={20} /> Gift Price Vote
      </h3>
      {data.poll?.allVoted && data.poll?.memberVote?.option && (
        <p className="final-price">
          🎁 Final chosen price: <strong>{data.poll.finalPrice}€</strong>
        </p>
      )}

      {!data.poll?.memberVote?.option && (
        <>
          <div className="poll-options">
            {data.poll.options.map((price) => (
              <button
                key={price}
                className={`poll-btn ${
                  selectedPrice === price ? "selected" : ""
                }`}
                onClick={() => setSelectedPrice(price)}>
                {price} €
              </button>
            ))}
          </div>
          <label>
            Other:{" "}
            <input
              type="number"
              min={1}
              value={typeof selectedPrice === "string" ? selectedPrice : ""}
              onChange={(e) => {
                const val = e.target.value;
                val > 0 ? setSelectedPrice(val) : setSelectedPrice(null);
              }}
            />{" "}
            €
          </label>
          <button
            className="poll-btn-confirm"
            disabled={selectedPrice === null}
            onClick={() => vote(selectedPrice)}>
            Confirm {!selectedPrice ? null : selectedPrice + "€"}
          </button>
        </>
      )}

      {!data.poll?.finalPrice && data.poll?.memberVote?.option && (
        <div className="vote-feedback">
          <p className="feedback-success">
            🎉 Thank you! Your vote has been registered.
          </p>
          <div className="feedback-waiting-container">
            <span>⏳</span>

            <p className="feedback-waiting">
              Waiting for everyone to finish voting…
            </p>
          </div>
          <div>
            {data.notVoted?.length > 0 && data.notVoted?.length <= 3 && (
              <>
                <ul className="not-voted-list">
                  <small className="not-voted-info">
                    <strong>Members who haven't voted yet:</strong>
                  </small>

                  {data.notVoted?.map((m) => (
                    <li key={m.id}>{capitalizeFirstLetter(m.name)}</li>
                  ))}
                </ul>
                <button
                  className="share-whatsapp"
                  type="button"
                  onClick={handleWhatsAppShare}
                  aria-label="Share on WhatsApp"
                  title="Share via Whatsapp">
                  <WhatsappIcon size={24} round />
                  Send reminder
                </button>
              </>
            )}
          </div>

          <p className="feedback-info">
            The final gift price will appear here as soon as all members have
            voted.
          </p>
        </div>
      )}
    </section>
  );
}
