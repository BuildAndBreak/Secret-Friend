import { useEffect, useState } from "react";
import { API } from "../../../api/draws";
import { CircleAlert, CheckCircle2 } from "lucide-react";
import "./VerifyPending.css";
import { ClipLoader } from "react-spinners";
import ActiveGroup from "./ActiveGroup";

export default function VerifyPending({
  step,
  nameOrganizer,
  includeOrganizer,
  email,
  error,
  setError,
  cooldownSecs = 30,
}) {
  // BroadcastChannel listener for instant update
  useEffect(() => {
    const channel = new BroadcastChannel("secret-santa-status");
    channel.onmessage = (e) => {
      if (e.data?.verified) {
        localStorage.removeItem("secret-santa:LastGroup");
        setGroupStatus("active");
      }
    };

    return () => channel.close();
  }, []);

  let lastGroup = null;

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("secret-santa:lastGroup");
    try {
      lastGroup = raw ? JSON.parse(raw) : null;
    } catch {
      lastGroup = null;
    }
  }

  const groupCode = lastGroup?.groupCode ?? null;

  const [groupStatus, setGroupStatus] = useState("checking");

  // Polling for group status, every 3s (fallback)
  useEffect(() => {
    if (!groupCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/groups/${groupCode}/status`);

        if (res.status === 404) {
          console.warn("Group code no longer exists, clearing localStorage");
          localStorage.removeItem("secret-santa:lastGroup");
          setGroupStatus("error");
          clearInterval(interval);
          return;
        }

        if (!res.ok) {
          console.error("Server error:", res.status);
          return;
        }

        const data = await res.json();

        if (data.status === "active") {
          clearInterval(interval);
          localStorage.removeItem("secret-santa:lastGroup");
          setGroupStatus("active");
          return;
        } else {
          setGroupStatus("awaiting");
        }
      } catch (err) {
        console.error("Error checking group status:", err);
        setGroupStatus("error");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [groupCode]);

  const [isSending, setIsSending] = useState(false);
  const [resendOk, setResendOk] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const until = Number(localStorage.getItem("secret-santa:resendUntil") || 0);
    const now = Date.now();
    return until > now ? Math.ceil((until - now) / 1000) : 0;
  });

  // cooldown ticker resend email
  useEffect(() => {
    if (secondsLeft <= 0) {
      setResendOk(false);
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 1 ? s - 1 : 0));
      if (secondsLeft === 1) {
        localStorage.removeItem("secret-santa:resendUntil");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft, setError]);

  async function resendEmail() {
    if (!groupCode) {
      setError((prev) => ({
        ...prev,
        resend: "Missing group information. Please restart the setup.",
      }));
      return;
    }
    setResendOk(false);
    setError((prev) => ({ ...prev, resend: null }));
    setIsSending(true);

    try {
      const res = await fetch(
        `${API}/api/groups/${groupCode}/initiate-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        // try to parse server message if any
        let details = "";
        try {
          const j = await res.json();
          details = j?.message ? `: ${j.message}` : "";
        } catch {
          // ignore json parse errors
        }
        throw new Error(`Server responded ${res.status}${details}`);
      }

      // success → set cooldown
      const until = Date.now() + cooldownSecs * 1000;
      localStorage.setItem("secret-santa:resendUntil", String(until));
      setSecondsLeft(cooldownSecs);
      setResendOk(true);
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError((prev) => ({
        ...prev,
        resend:
          "We couldn't resend the verification email. Please try again in a moment or check your network connection.",
      }));
    } finally {
      setIsSending(false);
    }
  }

  if (step !== 4) return null;

  return (
    <div className="container verify-pending">
      {/* AWAITING STATE */}
      {groupStatus !== "active" && (
        <>
          <h2>Almost there, {nameOrganizer}!</h2>

          <h3>
            We've sent a verification email to <strong>{email}</strong>.
          </h3>

          {groupStatus === "checking" && (
            <span className="status-message">
              Checking status...
              <ClipLoader size={30} color={"var(--color-red)"} loading />
            </span>
          )}

          {groupStatus === "awaiting" && (
            <span className="status-message">
              Verification in progress...
              <ClipLoader size={30} color={"var(--color-red)"} loading />
            </span>
          )}

          <p>
            Please check your inbox and click the verification link to complete
            the setup of your Secret Santa group.
          </p>

          <p className="info-spam">
            If you don't see the email, check your <strong>Spam</strong>/
            <strong>Junk</strong> folder and search for “Confirm
            Secret&nbsp;Santa Group”.
          </p>

          <button
            type="button"
            onClick={resendEmail}
            disabled={isSending || secondsLeft > 0}
            aria-disabled={isSending || secondsLeft > 0}>
            {isSending
              ? "Resending…"
              : secondsLeft > 0
              ? `Resend Email (${secondsLeft}s)`
              : "Resend Email"}
          </button>

          {resendOk && (
            <span className="info-resend" role="status" aria-live="polite">
              <CheckCircle2 stroke="var(--color-green)" />
              <small>Verification email sent. Please check your inbox.</small>
            </span>
          )}

          {error.resend && (
            <span className="error-resend" role="alert">
              <CircleAlert stroke="var(--color-red)" />{" "}
              <small>{error.resend}</small>
            </span>
          )}

          {groupStatus === "error" && (
            <div className="error-resend" role="alert">
              <CircleAlert size={26} stroke="var(--color-red)" />
              <span style={{ color: "var(--color-red)" }}>
                Could not verify this group.
              </span>
              <small>Please create a new group.</small>
              <button onClick={() => window.Location.reload()}>
                Create Group
              </button>
            </div>
          )}
        </>
      )}

      {/* ACTIVE STATE */}

      {groupStatus === "active" && (
        <ActiveGroup
          includeOrganizer={includeOrganizer}
          groupCode={groupCode}
        />
      )}
    </div>
  );
}
