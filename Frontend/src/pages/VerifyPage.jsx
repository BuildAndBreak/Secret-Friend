import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [status, setStatus] = useState("verifying...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const token = params.get("t");

    if (!code || !token) {
      setStatus("Invalid verification link");
      return;
    }

    fetch(`http://localhost:5000/api/groups/${code}/verify?t=${token}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.ok) setStatus("✅ Group verified and invites sent!");
        else setStatus("⚠️ " + (data.message || "Verification failed"));
      })
      .catch((err) => {
        setStatus("❌ Network error: " + err.message);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Verification</h2>
      <p>{status}</p>
    </div>
  );
}
