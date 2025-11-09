import { ChevronLeft, CircleX, CircleAlert } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

export default function FormStep2({
  step,
  setStep,
  error,
  setError,
  nameOrganizer,
  includeOrganizer,
  members,
  setMembers,
}) {
  function AddMember() {
    setMembers((prev) => [...prev, { id: uuidv4(), name: "", email: "" }]);
  }

  function RemoveMember(id) {
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
    let step2 = true;
    const memberNames = members.map((m) => m.name.trim()).filter(Boolean);
    const organizerCount = includeOrganizer && nameOrganizer.trim() ? 1 : 0;
    if (organizerCount + memberNames.length < 4) {
      setError((prev) => ({
        ...prev,
        numMembers: "At least 4 participants are required!",
      }));
      step2 = false;
    }
    if (error.emails) step2 = false;

    if (step2) {
      setStep(3);
    }
  }

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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emails = members.map((m) => (m.email || "").trim().toLowerCase());
    const allHaveEmail = emails.every((e) => e.length > 0);
    const allValid = emails.every((e) => emailRegex.test(e));
    const uniqueEmails = new Set(emails);
    if (!allHaveEmail) {
      setError((prev) => ({
        ...prev,
        emails: "All members must have an email.",
      }));
    } else if (!allValid) {
      setError((prev) => ({ ...prev, emails: "Some emails are invalid." }));
    } else if (uniqueEmails.size !== emails.length) {
      setError((prev) => ({
        ...prev,
        emails: "Member emails must be unique.",
      }));
    } else {
      setError((prev) => ({ ...prev, emails: "" }));
    }

    const organizerCount = includeOrganizer && nameOrganizer.trim() ? 1 : 0;
    if (organizerCount + memberNames.length === 4) {
      setError((prev) => ({ ...prev, numMembers: "" }));
    }
  }, [members, nameOrganizer, setError, includeOrganizer]);

  useEffect(() => {
    const initialMembers = includeOrganizer ? 3 : 4;
    setMembers(
      Array.from({ length: initialMembers }, () => ({
        id: uuidv4(),
        name: "",
        email: "",
      }))
    );
  }, [includeOrganizer, setMembers]);

  return (
    <>
      {step === 2 && (
        <form className="container">
          <div className="form-header">
            <span type="button">
              <ChevronLeft
                style={{ marginRight: ".2rem" }}
                className="goBack"
                size={40}
                onClick={() => {
                  setStep(1);
                  setError({});
                }}
              />
            </span>
            <h2>Family members</h2>
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
                <div className="input-remove-container">
                  <input
                    id={inputId}
                    type="text"
                    value={member.name}
                    onChange={(e) => onChangeMember(e, member.id)}
                  />
                  <span type="button" onClick={() => RemoveMember(member.id)}>
                    <CircleX color="#c0392b" />
                  </span>
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

          <button type="button" onClick={() => AddMember()}>
            Add member
          </button>

          <button type="submit" onClick={(e) => Continue2(e)}>
            Continue...
          </button>
        </form>
      )}
    </>
  );
}
