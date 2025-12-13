import { useState } from "react";
import { HandHeart } from "lucide-react";

export default function FriendsWishlist({ data }) {
  const [secretWishList, setSecretWishList] = useState([]);

  if (data?.secretWishlist?.length > 0) {
    setSecretWishList(data.secretWishlist);
  }
  return (
    <section className="card wishlist-card">
      <h3 className="card-title">
        <HandHeart size={20} />
        Friend's Wishlist
      </h3>

      {secretWishList >= 0 && (
        <>
          <small className="info-text">
            Your secret friend's wishlist will be shown here once the gift price
            vote is decided.
          </small>
          <small className="info-text">
            Of course, if they added any gift ideas!
          </small>
        </>
      )}
      <ul className="wishlist">
        {secretWishList.map((w) => {
          return data.poll?.allVoted && <li key={w.id}>{w.text}</li>;
        })}
      </ul>
    </section>
  );
}
