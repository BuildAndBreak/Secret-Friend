import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ClipLoader } from "react-spinners";
import {
  Users,
  Vote,
  Gift,
  MessageSquare,
  Lock,
  Unlock,
  SendHorizonal,
} from "lucide-react";
import { API } from "../api/draws";
import "../styles/InvitePage.css";
import Footer from "../components/Footer";
import { capitalizeFirstLetter } from "../utils/capitalize";

export default function InvitePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [wishlistItem, setWishlistItem] = useState("");
  const [chatInput, setChatInput] = useState("");
  const chatBox = useRef(null);

  // Fetch member data
  async function loadMember() {
    try {
      const res = await fetch(`${API}/api/invites/${token}`);
      const data = await res.json();
      setData(data);

      // Auto-scroll chat
      setTimeout(() => {
        chatBox.current?.scrollTo({
          top: chatBox.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMember();
  }, [token]);

  // Poll every 3 seconds
  useEffect(() => {
    const id = setInterval(loadMember, 3000);
    return () => clearInterval(id);
  }, []);

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

  async function addWishlist() {
    if (!wishlistItem.trim()) return;
    if (data.member.wishlist.length >= 3) {
      setWishlistItem("");
      return;
    }
    try {
      await fetch(
        `${API}/api/groups/${data.groupCode}/wishlist/${data.member.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: wishlistItem }),
        }
      );
      setWishlistItem("");
      loadMember();
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMsg() {
    if (!chatInput.trim()) return;
    try {
      await fetch(`${API}/api/messages/${data.groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: data.member.id,
          text: chatInput,
        }),
      });
      setChatInput("");
      loadMember();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading)
    return (
      <div className="loader-center">
        <ClipLoader size={50} color="var(--color-red)" />
      </div>
    );

  if (!data) return <p className="error-text">Invalid or expired link.</p>;

  const canReveal = data.poll.allVoted;

  return (
    <div className="App">
      <div className="container invite-container">
        {/* HEADER */}
        <header className="invite-header">
          <h1>🎅 Welcome, {capitalizeFirstLetter(data.member.name)}!</h1>
        </header>

        {/* MEMBERS */}
        <section className="card">
          <h2 className="card-title">
            <Users size={20} /> Group Members
          </h2>

          <ul className="members-list">
            {data.participants?.map((m, i) => (
              <li key={i}>{capitalizeFirstLetter(m.name)}</li>
            ))}
          </ul>
        </section>

        {/* POLL */}
        <section className="card">
          <h2 className="card-title">
            <Vote size={20} /> Gift Price Vote
          </h2>
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
              <p className="feedback-waiting">
                ⏳ Waiting for everyone to finish voting…
              </p>

              <p className="feedback-info">
                The final gift price will appear here as soon as all members
                have voted.
              </p>
            </div>
          )}
        </section>

        {/* WISHLIST */}
        <section className="card">
          <h2 className="card-title">
            <Gift size={20} /> Wishlist
          </h2>

          <ol className="wishlist">
            {data.member?.wishlist?.length === 0 && (
              <p className="none">No items yet.</p>
            )}

            {data.member?.wishlist.map((w) => (
              <li key={w.id}>{w.text}</li>
            ))}
          </ol>
          <div className="gift-info">
            <small>*You can choose up to 3 gift ideas.</small>
            <small>
              *Think wisely, once added, there is no way to remove it!
            </small>
          </div>
          <div className="wishlist-input">
            <input
              type="text"
              placeholder="Gift idea…"
              value={wishlistItem}
              onChange={(e) => setWishlistItem(e.target.value)}
            />

            <button className="btn btn-green" onClick={addWishlist}>
              Add
            </button>
          </div>
        </section>

        {/* CHAT */}
        <section className="card">
          <h2 className="card-title">
            <MessageSquare size={20} /> Public Chat
          </h2>

          <div className="chat-box" ref={chatBox}>
            {data.messages.length === 0 ? (
              <p className="none">No messages yet.</p>
            ) : (
              data.messages.map((msg, i) => (
                <div className="chat-msg" key={i}>
                  <strong>{msg.nickname}: </strong> {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type message…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button className="btn btn-gold" onClick={sendMsg}>
              <SendHorizonal size={20} />
            </button>
          </div>
        </section>

        {/* REVEAL */}
        <section className="card reveal-card">
          <h2 className="card-title">🎁 Your Secret Friend</h2>

          <button
            className="btn btn-primary reveal-btn"
            disabled={!canReveal}
            onClick={() => setOpen(true)}>
            {!canReveal ? (
              <div className="btn-reveal-container">
                <Lock size={18} />
                <span>Waiting for everyone to vote…</span>
              </div>
            ) : (
              <div className="reveal-btn-cnt">
                {open ? <Unlock size={18} /> : <Lock size={18} />}
                <span>Reveal!</span>
              </div>
            )}
          </button>

          {open && (
            <p className="reveal-result">
              🎉 You got:
              <strong>{capitalizeFirstLetter(data.toName)}</strong>
            </p>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
