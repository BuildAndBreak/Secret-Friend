import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function InvitePage() {
  const { token } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        const res = await fetch(`http://localhost:5000/api/invites/${token}`);
        const data = await res.json();
        setMember(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [token]);

  if (loading) return <ClipLoader />;
  if (!member) return <p>Invalid or expired link.</p>;
  console.log(member);

  return (
    <div style={{ padding: 20 }}>
      <h2>Hi {member.name}!</h2>
      <p>Your Secret Santa draw is ready 🎁</p>
      <p>
        You'll be giving a gift to: <strong>{member.toName}</strong>
      </p>

      <h3>Your wishlist</h3>
      <p>Tell your Secret Santa what you think you deserve</p>
    </div>
  );
}
