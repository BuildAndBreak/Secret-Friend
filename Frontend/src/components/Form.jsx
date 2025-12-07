import { useState } from "react";
import "../styles/Form.css";
import { CircleAlert } from "lucide-react";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import VerifyPending from "./VerifyPending";

export default function Form() {
  const [includeOrganizer, setIncludeOrganizer] = useState(true);
  const [email, setEmail] = useState("");
  const [nameOrganizer, setNameOrganizer] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState({});
  const [step, setStep] = useState(1);
  const [requireInvites, setRequireInvites] = useState(false);

  function Continue(e) {
    e.preventDefault();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const errors = {};
    let step1 = true;

    if (!nameOrganizer) {
      errors.name = "This field is required!";
      step1 = false;
    }
    if (!email) {
      errors.email = "Please introduce your email!";
      step1 = false;
    }
    if (email && !regex.test(email)) {
      errors.email = "Please enter a valid email address!";
      step1 = false;
    }

    Object.keys(errors).length !== 0 &&
      setError((prev) => ({ ...prev, ...errors }));

    if (step1) {
      setStep(2);
    }
  }

  return (
    <>
      {/* FORM PART 1*/}
      {step === 1 && (
        <div className="container step-1 ">
          <h2>Organizer</h2>

          <label htmlFor="name">What's your name?</label>
          <input
            id="name"
            type="text"
            value={nameOrganizer}
            onChange={(e) => {
              setNameOrganizer(e.target.value);
              setError((prev) => ({ ...prev, name: "" }));
            }}
            required
          />

          {error.name && (
            <span className="error-container">
              <CircleAlert size={16} /> <small>{error.name}</small>
            </span>
          )}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeOrganizer}
              onChange={(e) => setIncludeOrganizer(e.target.checked)}
            />
            I want to participate in the group
          </label>

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError((prev) => ({ ...prev, email: "" }));
            }}
            required
          />

          {error.email && (
            <span className="error-container">
              <CircleAlert size={16} /> <small>{error.email}</small>
            </span>
          )}

          <button type="submit" onClick={(e) => Continue(e)}>
            Continue...
          </button>
        </div>
      )}

      {/* FORM PART 2*/}
      <FormStep2
        step={step}
        setStep={setStep}
        error={error}
        setError={setError}
        nameOrganizer={nameOrganizer}
        includeOrganizer={includeOrganizer}
        members={members}
        setMembers={setMembers}
        requireInvites={requireInvites}
        setRequireInvites={setRequireInvites}
        emailOrganizer={email}
      />

      {/* FORM PART 3*/}
      <FormStep3
        step={step}
        setStep={setStep}
        nameOrganizer={nameOrganizer}
        members={members}
        includeOrganizer={includeOrganizer}
        setError={setError}
        email={email}
        setRequireInvites={setRequireInvites}
      />

      {/* VERIFY PENDING */}
      <VerifyPending
        step={step}
        nameOrganizer={nameOrganizer}
        email={email}
        setError={setError}
        error={error}
      />
    </>
  );
}
