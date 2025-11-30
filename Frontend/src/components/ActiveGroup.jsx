import { useState } from "react";
import { CheckCircle2, Copy, Share2, MessageSquare } from "lucide-react";
import "../styles/ActiveGroup.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function ActiveGroup({
  groupCode,
  organizerInviteToken, // (optional) only if organizer is a participant
  onOpenPersonalPage, // optional callback instead of window.location
}) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Our Secret Santa group has been created. Everyone will receive their personal link via email shortly. 
It's mandatory that everyone votes on the gift pool price so all members can discover their Secret Friend.`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    shareMessage
  )}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleWhatsAppShare() {
    window.open(whatsappHref, "_blank");
  }

  function handleGoToPersonal() {
    const url = `${window.location.origin}/i/${organizerInviteToken}`;
    if (onOpenPersonalPage) onOpenPersonalPage(url);
    else window.location.href = url;
  }

  return (
    <div className="active-group">
      <div>
        <div className="verified-head">
          <h1>Congrats!</h1>
          <DotLottieReact
            src="/assets/animations/congrats.json"
            style={{
              width: "30%",
              height: "30%",
            }}
            loop
            autoplay
          />
        </div>
        <p className="subtitle">
          Your group has been verified! <br />
          All members will receive their personal links shortly.
        </p>
      </div>

      <div className="verified-body">
        <p>
          <strong>Important:</strong> It’s mandatory that everyone votes on the
          gift pool price so that all members can discover their Secret Friend.
        </p>

        <div className="share-block">
          <label className="share-label">
            Share this message with your group
          </label>
          <textarea
            readOnly
            aria-label="share message"
            className="share-text"
            value={shareMessage}
          />
          <div className="share-actions">
            <button
              className="btn btn-gold"
              onClick={handleWhatsAppShare}
              aria-label="Share on WhatsApp"
              title="Share via WhatsApp">
              <Share2 size={16} /> Share on WhatsApp
            </button>

            <button
              className="btn btn-outline"
              onClick={handleCopy}
              aria-label="Copy message"
              title="Copy message to clipboard">
              <Copy size={16} /> {copied ? "Copied!" : "Copy message"}
            </button>
          </div>
        </div>

        <div className="actions-row">
          {organizerInviteToken ? (
            <button
              className="btn btn-primary"
              onClick={handleGoToPersonal}
              aria-label="Go to organizer personal page">
              Go to my page →
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() =>
                (window.location.href = `/verified?code=${encodeURIComponent(
                  groupCode
                )}`)
              }>
              View group details
            </button>
          )}

          <a
            className="btn btn-link"
            href={`mailto:?subject=${encodeURIComponent(
              "Secret Santa — vote!"
            )}&body=${encodeURIComponent(shareMessage)}`}
            aria-label="Email share">
            <MessageSquare size={16} /> Email
          </a>
        </div>
      </div>

      <p className="footnote">
        <strong>Tip: </strong>you can also paste that message in a group chat.
        Make sure everyone votes so the reveal can happen.
      </p>
    </div>
  );
}
