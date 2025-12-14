import { ChevronLeft, CircleX, CircleAlert } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useState } from "react";
import "./FormStep2.css";

export default function FormStep2({
  step,
  setStep,
  error,
  emailOrganizer,
  setError,
  nameOrganizer,
  includeOrganizer,
  members,
  setMembers,
}) {
  const [submitted, setSubmitted] = useState(false);

  const emailError = useCallback(
    (list) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const emails = list.map((m) => (m.email || "").trim().toLowerCase());

      if (!emails.every(Boolean)) return "All members must have an email.";
      if (!emails.every((e) => emailRegex.test(e)))
        return "Some emails are invalid.";
      if (new Set(emails).size !== emails.length)
        return "Member emails must be unique.";
      if (emails.includes(emailOrganizer.trim().toLowerCase()))
        return "Organizer email cannot be used for members.";
      return "";
    },
    [emailOrganizer]
  );

  function addMember() {
    setSubmitted(false);
    setMembers((prev) => [...prev, { id: uuidv4(), name: "", email: "" }]);
  }

  function removeMember(id) {
    setSubmitted(false);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function onChangeMember(e, id) {
    const v = e.target.value;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: v } : m))
    );
  }

  function onChangeEmail(e, id) {
    const v = e.target.value;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, email: v } : m))
    );
  }

  function Continue2(e) {
    e.preventDefault();
    setSubmitted(true);

    let ok = true;
    const memberNames = members.map((m) => m.name.trim()).filter(Boolean);
    const organizerCount = includeOrganizer && nameOrganizer.trim() ? 1 : 0;

    if (organizerCount + memberNames.length < 3) {
      setError((prev) => ({
        ...prev,
        numMembers: "At least 3 participants are required!",
      }));
      ok = false;
    } else {
      setError((prev) => ({ ...prev, numMembers: "" }));
    }

    const emErr = emailError(members);
    setError((prev) => ({ ...prev, emails: emErr }));
    if (emErr) ok = false;

    const uniqueNames = new Set(memberNames);
    if (
      memberNames.length !== uniqueNames.size ||
      (memberNames.includes(nameOrganizer.trim()) && includeOrganizer)
    ) {
      setError((prev) => ({
        ...prev,
        members: "Member names must be unique!",
      }));
      ok = false;
    } else {
      setError((prev) => ({ ...prev, members: "" }));
    }

    if (ok) setStep(3);
  }

  // Validation live updates
  useEffect(() => {
    const memberNames = members.map((m) => m.name.trim()).filter(Boolean);
    const uniqueNames = new Set(memberNames);

    if (
      memberNames.length !== uniqueNames.size ||
      (memberNames.includes(nameOrganizer.trim()) && includeOrganizer)
    ) {
      setError((prev) => ({
        ...prev,
        members: "Member names must be unique!",
      }));
    } else {
      setError((prev) => ({ ...prev, members: "" }));
    }

    const organizerCount = includeOrganizer && nameOrganizer.trim() ? 1 : 0;
    if (organizerCount + memberNames.length >= 3) {
      setError((prev) => ({ ...prev, numMembers: "" }));
    }

    if (submitted) {
      const emErr = emailError(members);
      setError((prev) => ({ ...prev, emails: emErr }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, nameOrganizer, includeOrganizer, submitted]);

  // initialize members only if empty (avoid wiping user input)
  useEffect(() => {
    if (members && members.length > 0) return;
    const initialMembers = includeOrganizer ? 2 : 3;
    setMembers(
      Array.from({ length: initialMembers }, () => ({
        id: uuidv4(),
        name: "",
        email: "",
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step !== 2) return null;

  const isSubmitDisabled =
    !!error.members || !!error.numMembers || (submitted && !!error.emails);

  return (
    <form className="container step-2" onSubmit={Continue2} noValidate>
      <div className="form-header">
        <button
          type="button"
          aria-label="Back to organizer step"
          className="icon-button"
          onClick={() => {
            setStep(1);
            setError({});
            setSubmitted(false);
          }}>
          <ChevronLeft size={28} />
        </button>
        <h2>Family members</h2>
      </div>

      {nameOrganizer && includeOrganizer && (
        <>
          <label htmlFor="organizer">Organizer</label>
          <input id="organizer" type="text" value={nameOrganizer} disabled />
        </>
      )}
      <div className="scrollbar members-scroll">
        {members.map((member, i) => {
          const MemberNum = nameOrganizer && includeOrganizer ? i + 2 : i + 1;
          const inputId = `member-name${i}`;
          const minMembers = 2; // min besides organizer
          const canRemove = members.length > minMembers;

          return (
            <div className="members-list" key={member.id}>
              <div className="member-list-header">
                <label htmlFor={inputId}>Member {MemberNum}</label>
                <button
                  type="button"
                  className="remove-mem-btn"
                  onClick={() => removeMember(member.id)}
                  disabled={!canRemove}
                  aria-label={`Remove member ${MemberNum}`}
                  title={
                    !canRemove
                      ? "Cannot remove below minimum members"
                      : "Remove member"
                  }>
                  <CircleX />
                </button>
              </div>

              <div className="input-remove-container">
                <input
                  id={inputId}
                  type="text"
                  value={member.name}
                  onChange={(e) => onChangeMember(e, member.id)}
                  required
                  aria-invalid={submitted && !member.name.trim()}
                  aria-describedby={error.members ? "members-error" : undefined}
                />
              </div>

              <label htmlFor={`member-email${i}`}>Email</label>
              <input
                id={`member-email${i}`}
                type="email"
                value={member.email}
                onChange={(e) => onChangeEmail(e, member.id)}
                required
                aria-invalid={submitted && !member.email.trim()}
                aria-describedby={error.emails ? "emails-error" : undefined}
              />
            </div>
          );
        })}
      </div>

      <div aria-live="polite" className="errors">
        {error.members && (
          <span className="error-container" id="members-error" role="alert">
            <CircleAlert aria-hidden="true" /> <small>{error.members}</small>
          </span>
        )}

        {error.numMembers && (
          <span className="error-container" id="num-error" role="alert">
            <CircleAlert aria-hidden="true" /> <small>{error.numMembers}</small>
          </span>
        )}

        {error.emails && (
          <span className="error-container" id="emails-error" role="alert">
            <CircleAlert aria-hidden="true" /> <small>{error.emails}</small>
          </span>
        )}
      </div>

      <button type="button" className="add-member-btn" onClick={addMember}>
        Add member
      </button>

      <button type="submit" disabled={isSubmitDisabled} className="submit-btn">
        Continue...
      </button>
    </form>
  );
}
