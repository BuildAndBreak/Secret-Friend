import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ClipLoader } from "react-spinners";
import {
  Users,
  Vote,
  Gift,
  MessageSquare,
  Lock,
  HandHeart,
  Unlock,
  SendHorizonal,
} from "lucide-react";
import { API } from "../api/draws";
import "../styles/InvitePage.css";
import Footer from "../components/Footer";
import { capitalizeFirstLetter } from "../utils/capitalize";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { launchFireworks } from "../utils/fireworks";

export default function InvitePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [wishlistItem, setWishlistItem] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [secretWishList, setSecretWishList] = useState([]);
  const chatBox = useRef(null);

  const navigate = useNavigate();

  // Fetch member data
  async function loadMember() {
    try {
      const res = await fetch(`${API}/api/invites/${token}`);

      if (res.status === 404) {
        return navigate("/404");
      }

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setData(data);

      if (data?.secretWishlist?.length > 0) {
        setSecretWishList(data.secretWishlist);
      }

      // Auto-scroll chat
      setTimeout(() => {
        chatBox.current?.scrollTo({
          top: chatBox.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error(err);
      navigate("/404");
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

  const canReveal = data.poll?.allVoted;

  return (
    <div className="App">
      <header>
        <Header />
      </header>
      <div className="container invite-container">
        <h2>🎅 Welcome, {capitalizeFirstLetter(data.member?.name)}!</h2>

        {/* MEMBERS */}
        <section className="card members-card">
          <h3 className="card-title">
            <Users size={20} /> Group Members
          </h3>

          <ol className="members-list">
            {data.participants?.map((m, i) => (
              <li key={i}>{capitalizeFirstLetter(m.name)}</li>
            ))}
          </ol>
        </section>

        {/* POLL */}
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

              <p className="feedback-info">
                The final gift price will appear here as soon as all members
                have voted.
              </p>
            </div>
          )}
        </section>

        {/* WISHLIST */}
        <div className="wishlist-container">
          <section className="card">
            <h3 className="card-title">
              <Gift size={20} /> My Wishlist
            </h3>

            <ul className="wishlist">
              {data.member?.wishlist?.length === 0 && (
                <p className="none">No items yet.</p>
              )}

              {data.member?.wishlist.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
            {data.member?.wishlist?.length < 3 && (
              <div className="gift-info">
                <small>*You can choose up to 3 gift ideas.</small>
                <small>
                  *Think wisely, once added, there is no way to remove it!
                </small>

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
              </div>
            )}
          </section>
          <section className="card">
            <h3 className="card-title">
              <HandHeart size={20} />
              Friend's Wishlist
            </h3>
            {secretWishList >= 0 && (
              <small className="gift-info">
                Your secret friends wishlist will be shown here once the gift
                price vote is finished.
              </small>
            )}
            <ul className="wishlist">
              {secretWishList.map((el) => {
                return data.poll?.allVoted && <li key={el.id}>{el.text}</li>;
              })}
            </ul>
          </section>
        </div>

        {/* CHAT */}
        <section className="card">
          <h3 className="card-title">
            <MessageSquare size={20} /> Public Chat
          </h3>

          <div className="chat-box" ref={chatBox}>
            {data.messages?.length === 0 ? (
              <p className="none">No messages yet.</p>
            ) : (
              data.messages.map((msg, i) => (
                <small className="chat-msg" key={i}>
                  <strong>{msg.nickname}: &nbsp; </strong> {msg.text}
                </small>
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
                  <Lock size={18} />
                  <span>Reveal!</span>
                </div>
              )}
            </button>
          )}

          {open && (
            <p className="reveal-result animate-reveal">
              🎉 You got: &nbsp;
              <strong>{capitalizeFirstLetter(data.toName)}</strong>
            </p>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
