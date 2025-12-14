import { useState } from "react";
import { MessageSquare, SendHorizonal } from "lucide-react";
import { API } from "../../../api/draws";
import "./Chat.css";

export default function Chat({ data, chatBox, loadMember }) {
  const [chatInput, setChatInput] = useState("");

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

  return (
    <section className="card chat-card">
      <h3 className="card-title">
        <MessageSquare size={20} /> Public Chat
      </h3>

      <div className="chat-box" ref={chatBox}>
        {data.messages?.length === 0 ? (
          <p className="none">No messages yet.</p>
        ) : (
          data.messages.map((msg, i) => (
            <ul className="chat-msg" key={i}>
              <li className="chat-sender">
                <strong>{msg.nickname}:</strong>
              </li>
              {msg.text}
            </ul>
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
        <button
          className="btn btn-gold"
          aria-label="Send message"
          onClick={sendMsg}>
          <SendHorizonal size={20} />
        </button>
      </div>
    </section>
  );
}
