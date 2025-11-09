import { useState, useMemo } from "react";
import { ChevronLeft, ChevronDown, X } from "lucide-react";
import "../styles/FormStep3.css";
import { createDraw, serializeExclusions } from "../api/draws";
import { API } from "../api/draws";
export default function FormStep3({
  step,
  setStep,
  nameOrganizer,
  members,
  includeOrganizer,
  setError,
  email,
}) {
  const [dropdownMemberId, setDropdownMemberId] = useState(null);
  const [exclusions, setExclusions] = useState({});

  const ORGANIZER = "organizer";
  const organizerName = (nameOrganizer || "").trim();

  const participants = useMemo(() => {
    const ids = [];
    if (includeOrganizer && organizerName) ids.push(ORGANIZER);
    for (const m of members) ids.push(m.id);
    return ids;
  }, [includeOrganizer, organizerName, members]);

  function toggleDropdown(id) {
    setDropdownMemberId((prev) => (prev === id ? null : id));
  }

  const cloneExclusions = (src) => {
    const out = {};
    for (const k in src) out[k] = new Set(src[k]);
    return out;
  };

  const allowedCount = (id, map) => {
    const banned = map[id] || new Set();
    let c = 0;
    for (const other of participants) {
      if (other !== id && !banned.has(other)) c++;
    }
    return c;
  };
  const wouldBreakIfAdd = (ownerId, targetId) => {
    const next = cloneExclusions(exclusions);
    const A = next[ownerId] || new Set();
    const B = next[targetId] || new Set();
    A.add(targetId);
    B.add(ownerId);
    next[ownerId] = A;
    next[targetId] = B;
    for (const pid of participants)
      if (allowedCount(pid, next) === 0) return true;
    return false;
  };

  function toggleExclusion(targetId, ownerId) {
    if (!ownerId || !targetId || ownerId === targetId) return;

    const next = cloneExclusions(exclusions);
    const A = next[ownerId] || new Set();
    const B = next[targetId] || new Set();
    const isOn = A.has(targetId) && B.has(ownerId);

    if (isOn) {
      // remover A↔B
      A.delete(targetId);
      B.delete(ownerId);
      next[ownerId] = A;
      next[targetId] = B;
      setError?.((p) => ({ ...p, exclusions: "" }));
      setExclusions(next);
      return;
    }

    // tentar adicionar A↔B
    if (wouldBreakIfAdd(ownerId, targetId)) {
      setError?.((p) => ({
        ...p,
        exclusions: "Essa exclusão deixaria alguém sem opções.",
      }));
      return;
    }

    A.add(targetId);
    B.add(ownerId);
    next[ownerId] = A;
    next[targetId] = B;
    setError?.((p) => ({ ...p, exclusions: "" }));
    setExclusions(next);
  }

  const isExcluded = (ownerId, targetId) =>
    !!exclusions[ownerId]?.has(targetId);

  async function submitData(e) {
    e?.preventDefault();
    const payload = {
      organizer: (nameOrganizer || "").trim(),
      email,
      includeOrganizer,
      members: members.map((m) => ({
        id: m.id,
        name: m.name.trim(),
        email: m.email.trim().toLowerCase(),
      })),
      exclusions: serializeExclusions(exclusions),
    };

    try {
      const data = await createDraw(payload);
      localStorage.setItem(
        "secret-santa:lastGroup",
        JSON.stringify({ drawId: String(data.id), groupCode: data.groupCode })
      );

      const res = await fetch(
        `${API}/api/groups/${data.groupCode}/initiate-verification`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Could not send verification email.");
      alert(
        "Group created! Check your email to verify. After that, members get their private links."
      );
    } catch (err) {
      console.error(err);
      setError?.((p) => ({
        ...p,
        submit: err.message || "Failed to create draw.",
      }));
    }
  }

  if (step !== 3) return null;

  return (
    <form className="container form-step3">
      <div className="form-header">
        <span type="button">
          <ChevronLeft
            style={{ marginRight: ".2rem" }}
            className="goBack"
            size={40}
            onClick={() => {
              setStep(2);
              setError?.({});
            }}
          />
        </span>
        <h2>Exclusions</h2>
      </div>

      <div>
        <p>Do you want to set exclusions?</p>
        <aside>
          An exclusion marks pairs that are not permitted in the draw.
        </aside>

        {/* Organizer */}
        {includeOrganizer && organizerName && (
          <>
            <div
              className={`${
                dropdownMemberId === ORGANIZER ? "open" : ""
              } list-members-container`}>
              <span type="button">{organizerName}</span>
              {dropdownMemberId !== ORGANIZER ? (
                <ChevronDown onClick={() => toggleDropdown(ORGANIZER)} />
              ) : (
                <X onClick={() => toggleDropdown(null)} />
              )}
            </div>

            {dropdownMemberId === ORGANIZER && (
              <div className="exclusions-dropdown">
                {members.map((m) => {
                  const checked = isExcluded(ORGANIZER, m.id);
                  const disabled = !checked && wouldBreakIfAdd(ORGANIZER, m.id);
                  return (
                    <label key={m.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleExclusion(m.id, ORGANIZER)}
                      />
                      {m.name}
                    </label>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Members */}
        {members.map((member) => {
          const open = dropdownMemberId === member.id;
          return (
            <div key={member.id}>
              <div className={`${open ? "open" : ""} list-members-container`}>
                <span type="button">{member.name}</span>
                {!open ? (
                  <ChevronDown onClick={() => toggleDropdown(member.id)} />
                ) : (
                  <X onClick={() => toggleDropdown(null)} />
                )}
              </div>

              {open && (
                <div className="exclusions-dropdown">
                  {/* Organizer */}
                  {includeOrganizer && organizerName && (
                    <label>
                      {(() => {
                        const checked = isExcluded(member.id, ORGANIZER);
                        const disabled =
                          !checked && wouldBreakIfAdd(member.id, ORGANIZER);
                        return (
                          <>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() =>
                                toggleExclusion(ORGANIZER, member.id)
                              }
                            />
                            {organizerName}
                          </>
                        );
                      })()}
                    </label>
                  )}

                  {/* Other members */}
                  {members
                    .filter((mem) => mem.id !== member.id)
                    .map((mem) => {
                      const checked = isExcluded(member.id, mem.id);
                      const disabled =
                        !checked && wouldBreakIfAdd(member.id, mem.id);
                      return (
                        <label key={mem.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleExclusion(mem.id, member.id)}
                          />
                          {mem.name}
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" onClick={submitData}>
        Create Secret Santa
      </button>
    </form>
  );
}
