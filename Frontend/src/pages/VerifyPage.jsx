import { useEffect, useState } from "react";
import { API } from "../api/draws";
import "./VerifyPage.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function VerifyPage() {
  const [status, setStatus] = useState("Verification in progress…");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const token = params.get("t");

    if (!code || !token) {
      setStatus("Invalid verification link.");
      setIsDone(true);
      return;
    }

    fetch(`${API}/api/groups/${code}/verify?t=${encodeURIComponent(token)}`)
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch (err) {
          console.error("Failed to parse JSON:", err);
        }

        if (res.status === 404) {
          setStatus("❌ Group not found or link expired.");
          setIsDone(true);
          return;
        }

        if (res.status === 400 && data.message?.includes("active")) {
          setStatus("🎉 This group has already been verified.");
          setIsDone(true);
          return;
        }

        if (!res.ok) {
          setStatus("⚠️ Verification failed.");
          setIsDone(true);
          return;
        }

        if (data.ok) {
          setStatus("🎉 Group verified and invites sent!");
          setIsDone(true);

          // Notify the original tab
          const channel = new BroadcastChannel("secret-santa-status");
          channel.postMessage({ verified: true });
          channel.close();

          // Attempt to close tab
          setTimeout(() => {
            window.close();
          }, 5000);
        }
      })
      .catch((err) => {
        setStatus("Network error: " + err.message);
        setIsDone(true);
      });
  }, []);

  return (
    <div className="App">
      <main>
        <Header />
        <div className="container verify-card">
          <h2>Group Verification</h2>
          <p className="verify-status" role="status" aria-live="polite">
            {status}
          </p>

          {isDone && (
            <p className="verify-hint">
              This window may close automatically. If it doesn’t, you can close
              it and return to the previous tab.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
