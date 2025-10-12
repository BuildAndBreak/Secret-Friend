import { useState } from "react";
import "../styles/Form.css";

export default function Form() {
  const [includeOrganizer, setIncludeOrganizer] = useState(true);
  const [email, setEmail] = useState("");
  const [nameOrganizer, setNameOrganizer] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  function AddMember() {
    setMembers((prev) => [...prev, ""]);
  }

  function Continue(e) {
    e.preventDefault();
    if (!e.target.value) {
      setError("This field is required");
      return;
    }
    if (!email) {
      setError("This field is required");
      return;
    }
  }

  console.log(members);
  return (
    <>
      <form className="container">
        <p>Organizer</p>
        <label htmlFor="name">What's your name?</label>
        <input
          id="name"
          type="text"
          value={nameOrganizer}
          onChange={(e) => {
            setNameOrganizer(e.target.value);
            setError("");
          }}
          required
        />
        <small>{error}</small>
        <label>
          <input
            type="checkbox"
            checked={includeOrganizer}
            onChange={(e) => setIncludeOrganizer(e.target.checked)}
          />
          I want to draw names with myself.
        </label>

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          required
        />
        <small>{error}</small>

        <button type="submit" onClick={(e) => Continue(e)}>
          Continue...
        </button>
      </form>

      <form className="container">
        <p>Family members</p>
        {nameOrganizer && includeOrganizer && (
          <>
            <label htmlFor="organizer">Organizer</label>
            <input id="organizer" type="text" value={nameOrganizer} disabled />
          </>
        )}

        {members.map((member, i) => {
          const labelNumber = nameOrganizer && includeOrganizer ? i + 2 : i + 1;
          const inputId = `member-name${i}`;

          return (
            <div className="members-list" key={i}>
              <label htmlFor={inputId}>Member {labelNumber}</label>
              <input
                id={inputId}
                type="text"
                value={member}
                onChange={(e) =>
                  setMembers((prev) =>
                    prev.map((m, idx) => (idx === i ? e.target.value : m))
                  )
                }
              />
              <button
                onClick={() =>
                  setMembers((prev) => prev.filter((_, idx) => idx === i))
                }>
                Remove
              </button>
            </div>
          );
        })}

        <button type="button" onClick={() => AddMember()}>
          Add member
        </button>

        <button type="submit">Continue...</button>
      </form>
    </>
  );
}
