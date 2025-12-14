import Form from "../features/form/components/Form.jsx";
import Footer from "../components/Footer.jsx";
import { useState, useEffect } from "react";
import "./HomePage.css";
import Header from "../components/Header.jsx";
import Popup from "../components/Popup.jsx";

export default function HomePage() {
  const [create, setCreate] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [draftData, setDraftData] = useState(null);

  useEffect(() => {
    const draft = localStorage.getItem("secret-santa-draft");
    if (!draft) return;

    setShowPopup(true);
    setDraftData(JSON.parse(draft));
  }, []);

  function recoverDraft() {
    setShowPopup(false);
    setCreate(true);
  }

  function discardDraft() {
    localStorage.removeItem("secret-santa-draft");
    setDraftData(null);
    setShowPopup(false);
  }

  return (
    <div className="App homepage">
      {showPopup && (
        <Popup recoverDraft={recoverDraft} discardDraft={discardDraft} />
      )}

      <main>
        <Header />

        {!create && (
          <section>
            <picture>
              <source
                media="(orientation: portrait)"
                srcSet="/assets/images/santaclaus-mobile.png"
              />

              <source
                media="(orientation: landscape)"
                srcSet="/assets/images/santaclaus-laptop.png"
              />

              <img
                className="santa-img"
                src="assets/images/santaclaus-laptop.png"
                alt="santa claus with a gift in the hand shushing"
              />
            </picture>

            <div className="intro-text">
              <h2 className="highlight">
                Organize your Secret Santa quickly and magically!
              </h2>

              <p>
                Create your group, add participants, set exclusions, and let our
                system handle the draw. Stress-free and full of Christmas
                spirit.
              </p>

              <p>Once the group is ready, members can:</p>
              <ul>
                <li>View all participants</li>
                <li>Vote on the gift budget</li>
                <li>Share 3 gift ideas</li>
                <li>Join the group chat</li>
                <li>See who they’ll be gifting</li>
              </ul>
              <button
                className="btn"
                type="button"
                onClick={() => setCreate(true)}>
                Create Group
              </button>
            </div>
          </section>
        )}

        {create && (
          <Form
            draftData={draftData}
            setDraftData={setDraftData}
            setCreate={setCreate}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
