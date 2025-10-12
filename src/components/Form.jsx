import { useState, useEffect } from "react";
import "../styles/Form.css";
import { CircleAlert, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function Form() {
  const [includeOrganizer, setIncludeOrganizer] = useState(true);
  const [email, setEmail] = useState("");
  const [nameOrganizer, setNameOrganizer] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState({ name: "", email: "" });
  const [step, setStep] = useState(1);

  function AddMember() {
    setMembers((prev) => [...prev, { id: uuidv4(), name: "" }]);
  }

  function RemoveMember(id) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function onChangeMember(e, id) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: e.target.value } : m))
    );
  }

  function Continue(e) {
    e.preventDefault();
    let isValid = true;
    if (!nameOrganizer) {
      setError((prev) => ({ ...prev, name: "This field is required" }));
      isValid = false;
    }

    if (!email) {
      setError((prev) => ({ ...prev, email: "Please introduce your email" }));
      isValid = false;
    }

    if (isValid) setStep(2);
  }

  useEffect(() => {
    const initialMembers = includeOrganizer ? 3 : 4;
    setMembers(
      Array.from({ length: initialMembers }, () => ({
        id: uuidv4(),
        name: "",
      }))
    );
  }, [includeOrganizer]);

  return (
    <>
      {step === 1 && (
        <form className="container">
          <p>Organizer</p>

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

          <label>
            <input
              type="checkbox"
              checked={includeOrganizer}
              onChange={(e) => setIncludeOrganizer(e.target.checked)}
            />
            I want to draw names with myself.
          </label>

          {!nameOrganizer && error.name && (
            <span className="error-container">
              <CircleAlert /> <small>{error.name}</small>
            </span>
          )}

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

          {!email && error.email && (
            <span className="error-container">
              <CircleAlert /> <small>{error.email}</small>
            </span>
          )}

          <button type="submit" onClick={(e) => Continue(e)}>
            Continue...
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="container">
          <div className="form-header">
            <ChevronLeft
              className="goBack"
              size={40}
              onClick={() => setStep(1)}
            />
            <p>Family members</p>
          </div>

          {nameOrganizer && includeOrganizer && (
            <>
              <label htmlFor="organizer">Organizer</label>
              <input
                id="organizer"
                type="text"
                value={nameOrganizer}
                disabled
              />
            </>
          )}

          {members.map((member, i) => {
            const MemberNum = nameOrganizer && includeOrganizer ? i + 2 : i + 1;
            const inputId = `member-name${i}`;

            return (
              <div className="members-list" key={member.id}>
                <label htmlFor={inputId}>Member {MemberNum}</label>
                <input
                  id={inputId}
                  type="text"
                  value={member.name}
                  onChange={(e) => onChangeMember(e, member.id)}
                />
                <span type="button" onClick={() => RemoveMember(member.id)}>
                  Remove
                </span>
              </div>
            );
          })}

          <button type="button" onClick={() => AddMember()}>
            Add member
          </button>

          <button type="submit">Continue...</button>
        </form>
      )}
    </>
  );
}
