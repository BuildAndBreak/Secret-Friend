import { ChevronLeft, CircleX, CircleAlert } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useState } from "react";

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

      const allHaveEmail = emails.every((e) => e.length > 0);
      if (!allHaveEmail) return "All members must have an email.";

      const allValid = emails.every((e) => emailRegex.test(e));
      if (!allValid) return "Some emails are invalid.";

      const unique = new Set(emails);
      if (unique.size !== emails.length) return "Member emails must be unique.";

      if (emails.includes(emailOrganizer.trim().toLowerCase()))
        return "Organizer email cannot be used for members.";

      return "";
    },
    [emailOrganizer]
  );

  function AddMember() {
    setSubmitted(false);
    setMembers((prev) => [...prev, { id: uuidv4(), name: "", email: "" }]);
  }

  function RemoveMember(id) {
    setSubmitted(false);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function onChangeMember(e, id) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: e.target.value } : m))
    );
  }

  function onChangeEmail(e, id) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, email: e.target.value } : m))
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

    // nº membros
    const organizerCount = includeOrganizer && nameOrganizer.trim() ? 1 : 0;
    if (organizerCount + memberNames.length >= 3) {
      setError((prev) => ({ ...prev, numMembers: "" }));
    }

    // emails — só mostra depois do primeiro submit
    if (submitted) {
      const emErr = emailError(members);
      setError((prev) => ({ ...prev, emails: emErr }));
    } else {
      // antes de submeter, não mostrar erro de emails
      setError((prev) => ({ ...prev, emails: "" }));
    }
  }, [
    members,
    nameOrganizer,
    includeOrganizer,
    submitted,
    setError,
    emailError,
  ]);

  // inicializa nº de inputs
  useEffect(() => {
    const initialMembers = includeOrganizer ? 2 : 3;
    setMembers(
      Array.from({ length: initialMembers }, () => ({
        id: uuidv4(),
        name: "",
        email: "",
      }))
    );
  }, [includeOrganizer, setMembers]);

  if (step !== 2) return null;

  return (
    <form className="container" onSubmit={Continue2} noValidate>
      <div className="form-header">
        <span type="button">
          <ChevronLeft
            style={{ marginRight: ".2rem" }}
            className="goBack"
            size={40}
            onClick={() => {
              setStep(1);
              setError({});
              setSubmitted(false);
            }}
          />
        </span>
        <h2>Family members</h2>
      </div>

      {nameOrganizer && includeOrganizer && (
        <>
          <label htmlFor="organizer">Organizer</label>
          <input id="organizer" type="text" value={nameOrganizer} disabled />
        </>
      )}

      {members.map((member, i) => {
        const MemberNum = nameOrganizer && includeOrganizer ? i + 2 : i + 1;
        const inputId = `member-name${i}`;
        return (
          <div className="members-list" key={member.id}>
            <div className="member-list-header">
              <label htmlFor={inputId}>Member {MemberNum}</label>
              <span type="button" onClick={() => RemoveMember(member.id)}>
                <CircleX color="#c0392b" />
              </span>
            </div>

            <div className="input-remove-container">
              <input
                id={inputId}
                type="text"
                value={member.name}
                onChange={(e) => onChangeMember(e, member.id)}
                required
              />
            </div>

            <label htmlFor={`member-email${i}`}>Email</label>
            <input
              id={`member-email${i}`}
              type="email"
              value={member.email}
              onChange={(e) => onChangeEmail(e, member.id)}
              required
            />
          </div>
        );
      })}

      {error.members && (
        <span className="error-container">
          <CircleAlert /> <small>{error.members}</small>
        </span>
      )}

      {error.numMembers && (
        <span className="error-container">
          <CircleAlert /> <small>{error.numMembers}</small>
        </span>
      )}

      {error.emails && (
        <span className="error-container">
          <CircleAlert /> <small>{error.emails}</small>
        </span>
      )}

      <button type="button" onClick={AddMember}>
        Add member
      </button>

      <button
        type="submit"
        disabled={
          !!error.members || !!error.numMembers || (submitted && !!error.emails)
        }>
        Continue...
      </button>
    </form>
  );
}
