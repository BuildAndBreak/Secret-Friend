import { useState } from "react";
import { API } from "../../../api/draws";
import { Gift } from "lucide-react";
import "./Wishlist.css";

export default function Wishlist({ data, loadMember }) {
  const [wishlistItem, setWishlistItem] = useState("");
  const canReveal = data?.poll?.allVoted;

  async function addWishlist() {
    if (!wishlistItem.trim()) return;

    if (wishlistItem.length > 40) return;

    if (data?.member?.wishlist?.length >= 3) {
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

  return (
    <section className="card wishlist-card">
      <h3 className="card-title">
        <Gift aria-hidden="true" size={20} /> My Wishlist
      </h3>

      <ul className="wishlist">
        {data?.member?.wishlist?.length === 0 ? (
          <li className="none">No items yet.</li>
        ) : (
          data?.member?.wishlist?.map((w) => <li key={w.id}>{w.text}</li>)
        )}
      </ul>

      {data?.member?.wishlist?.length < 3 && (
        <div className="gift-info">
          <small className="info-text">
            You can add wishes after all members vote.
          </small>
          <small className="info-text">
            Think wisely, once added, there is no way to remove your wish!
          </small>
          <div className="wishlist-input">
            <label>
              <input
                type="text"
                maxLength={40}
                placeholder={`Your wish... (${
                  3 - data?.member?.wishlist?.length
                } left)`}
                value={wishlistItem}
                onChange={(e) => setWishlistItem(e.target.value)}
              />
            </label>
            <button
              className="btn btn-green"
              disabled={!canReveal}
              onClick={addWishlist}>
              Add
            </button>
          </div>
          <small className="info-text">
            {wishlistItem.length === 0
              ? "(Max. 40 characters per wish)"
              : `${Math.max(40 - wishlistItem.length, 0)} characters left`}
          </small>
        </div>
      )}
    </section>
  );
}
