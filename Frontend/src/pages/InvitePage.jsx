import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { RingLoader } from "react-spinners";
import { API } from "../api/draws";
import { capitalizeFirstLetter } from "../utils/capitalize";
import { useNavigate } from "react-router-dom";
import "./InvitePage.css";

import Header from "../components/Header";
import Members from "../features/invite/components/Members";
import Poll from "../features/invite/components/Poll";
import Wishlist from "../features/invite/components/Wishlist";
import Chat from "../features/invite/components/Chat";
import FriendsWishlist from "../features/invite/components/FriendsWishlist";
import Reveal from "../features/invite/components/Reveal";
import Footer from "../components/Footer";

export default function InvitePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatBox = useRef(null);

  const navigate = useNavigate();

  // Fetch member data
  const loadMember = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/invites/${token}`);

      if (res.status === 404) {
        return navigate("/404");
      }

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setData(data);

      // Auto-scroll chat
      setTimeout(() => {
        chatBox.current?.scrollTo({
          top: chatBox.current.scrollHeight,
          behavior: "smooth",
        });
      }, 10000);
    } catch (err) {
      console.error(err);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  // Poll every 5 seconds
  useEffect(() => {
    const id = setInterval(loadMember, 5000);
    return () => clearInterval(id);
  }, [loadMember]);

  if (loading)
    return (
      <div
        className="loader-center"
        role="status"
        aria-live="polite"
        aria-atomic="true">
        <RingLoader size={100} color="var(--color-red)" />
        <p className="loading-message">Loading your Secret Santa page</p>
        <p>This can take a while if the server is waking up… </p>
      </div>
    );

  return (
    <div className="App">
      <header>
        <Header />
      </header>
      <main className="container invite-container">
        <h2>🎅 Welcome, {capitalizeFirstLetter(data.member?.name)}!</h2>

        <Members data={data} />

        <Poll data={data} loadMember={loadMember} />

        <Wishlist data={data} loadMember={loadMember} />

        <FriendsWishlist data={data} />

        <Chat data={data} chatBox={chatBox} loadMember={loadMember} />

        <Reveal data={data} />
      </main>
      <Footer />
    </div>
  );
}
