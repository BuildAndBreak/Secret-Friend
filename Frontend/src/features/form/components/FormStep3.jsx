import { useState, useMemo } from "react";
import { ChevronLeft, ChevronDown, X } from "lucide-react";
import "./FormStep3.css";
import { createDraw, serializeExclusions } from "../../../api/draws";
import { API } from "../../../api/draws";
import { ClipLoader } from "react-spinners";
import {
  cloneExclusions,
  isExcluded,
  wouldBreakIfAdd,
} from "../../../utils/exclusions";
import { useExclusionsDraft } from "../hooks/useExclusionsDraft";

export default function FormStep3({
  step,
  setStep,
  nameOrganizer,
  members,
  includeOrganizer,
  setError,
  email,
  setDraftData,
}) {
  const [dropdownMemberId, setDropdownMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exclusions, setExclusions] = useState({});
  const [open, setOpen] = useState(false);
  const ORGANIZER = "organizer";
  const organizerName = (nameOrganizer || "").trim();

  useExclusionsDraft({ exclusions, setExclusions, setDraftData });

  // memoize so we only rebuild when inputs change
  const participants = useMemo(() => {
    const ids = [];
    if (includeOrganizer && organizerName) ids.push(ORGANIZER);
    for (const m of members) ids.push(m.id);
    return ids;
  }, [includeOrganizer, organizerName, members]);

  function toggleDropdown(id) {
    setDropdownMemberId((prev) => (prev === id ? null : id));
  }

  /*
    Toggle a single exclusion checkbox for "ownerId gives to targetId".
    - If currently ON, remove it.
    - If OFF, only add it if feasibility remains true (else show error and refuse).
  */

  function toggleExclusion(targetId, ownerId) {
    if (!ownerId || !targetId || ownerId === targetId) return; // guard: ignore invalid or self pair

    const next = cloneExclusions(exclusions); // immutably clone current exclusions
    const A = next[ownerId] || new Set(); // Set for this giver
    const isOn = A.has(targetId); // is the exclusion already set?

    if (isOn) {
      // CASE 1: turning OFF → remove the directed exclusion
      A.delete(targetId); // remove target from giver's Set
      next[ownerId] = A; // write back the Set
      setError((prev) => ({ ...prev, exclusions: "" })); // clear any prior exclusion error
      setExclusions(next); // commit new exclusions map to state
      return; // done
    }

    // CASE 2: turning ON → check if this addition preserves feasibility first
    if (wouldBreakIfAdd(exclusions, participants, ownerId, targetId)) {
      // would this make a valid draw impossible?
      setError((prev) => ({
        ...prev,
        exclusions: "That exclusion would make the draw impossible.", // show message; do not toggle
      }));
      return;
    }

    A.add(targetId); // it's safe; add the exclusion
    next[ownerId] = A; // write back
    setError((prev) => ({ ...prev, exclusions: "" })); // clear error
    setExclusions(next); // commit state
  }

  async function submitData(e) {
    e?.preventDefault();
    setLoading(true);
    // payload backend
    const payload = {
      organizer: organizerName,
      email,
      includeOrganizer,
      members: members.map((m) => ({
        // serialize members cleanly
        id: m.id,
        name: m.name.trim(),
        email: m.email.trim().toLowerCase(),
      })),
      exclusions: serializeExclusions(exclusions), // convert {giverId: Set(...)} → e.g., [{ from, to }, ...]
    };

    try {
      const data = await createDraw(payload); // 1) create draw on the server (saves members/exclusions)

      localStorage.setItem(
        "secret-santa:lastGroup",
        JSON.stringify({ drawId: String(data.id), groupCode: data.groupCode })
      );

      const res = await fetch(
        `${API}/api/groups/${data.groupCode}/initiate-verification`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Could not send verification email."); // non-2xx → error

      setStep(4);
    } catch (err) {
      console.error(err);
      setError((prev) => ({
        ...prev,
        submit: err.message || "Failed to create draw.",
      }));
    }
  }

  if (step !== 3) return null;

  return (
    <form className="container step-3" onSubmit={submitData}>
      <div className="form-header">
        <button
          type="button"
          aria-label="Back to member step"
          className="icon-button"
          onClick={() => {
            setStep(2);
            setError?.({}); // clear errors if parent passed setError
          }}>
          <ChevronLeft size={28} />
        </button>
        <h2>Exclusions</h2>
      </div>

      <div>
        <p>Do you want to set exclusions?</p>
        <aside>
          An exclusion means the selected giver <strong>cannot</strong> give a
          gift to that specific receiver.
        </aside>

        <button
          type="button"
          className="btn-exclusions"
          aria-expanded={open}
          aria-controls="exclusions-panel"
          onClick={() => setOpen(!open)}>
          {!open ? "Set exclusions" : "Close list"}
        </button>
      </div>

      {/* Organizer as a potential GIVER (if included) */}
      {open && (
        <div id="exclusions-panel" className="scrollbar exclusions-scroll">
          {includeOrganizer && organizerName && (
            <>
              <div
                className={`${
                  dropdownMemberId === ORGANIZER ? "open" : ""
                } list-members-container`}>
                <span>{organizerName}</span>
                {dropdownMemberId !== ORGANIZER ? (
                  <button
                    type="button"
                    className="dropdown-btn"
                    aria-label={`Open exclusions for ${organizerName}`}
                    onClick={() => toggleDropdown(ORGANIZER)}>
                    <ChevronDown aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="dropdown-btn"
                    onClick={() => toggleDropdown(null)}
                    aria-label={`Close exclusions for ${organizerName}`}>
                    <X aria-hidden="true" />
                  </button>
                )}
              </div>

              {dropdownMemberId === ORGANIZER && (
                <div className="exclusions-dropdown">
                  {members.map((m) => {
                    // every member is a possible receiver
                    const checked = isExcluded(exclusions, ORGANIZER, m.id); // is organizer member currently excluded?
                    const disabled =
                      !checked &&
                      wouldBreakIfAdd(
                        exclusions,
                        participants,
                        ORGANIZER,
                        m.id
                      ); // prevent impossible configuration
                    return (
                      <label key={m.id}>
                        <input
                          type="checkbox"
                          checked={checked} // reflect state
                          disabled={disabled} // disallow toggling to impossible state
                          onChange={() => toggleExclusion(m.id, ORGANIZER)} // toggle organizer -> member
                        />
                        {m.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Each member as a GIVER */}
          {members.map((member) => {
            const open = dropdownMemberId === member.id; // is this member’s dropdown open?
            return (
              <div key={member.id}>
                <div className={`${open ? "open" : ""} list-members-container`}>
                  <span>{member.name}</span>
                  {!open ? (
                    <button
                      type="button"
                      className="dropdown-btn"
                      aria-label={`Open exclusions for ${member.name}`}
                      onClick={() => toggleDropdown(member.id)}>
                      <ChevronDown aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dropdown-btn"
                      onClick={() => toggleDropdown(null)}
                      aria-label={`Close exclusions for ${member.name}`}>
                      <X aria-hidden="true" />
                    </button>
                  )}
                </div>

                {open && (
                  <div className="exclusions-dropdown">
                    {/* Option to exclude giving to organizer (if organizer exists) */}
                    {includeOrganizer && organizerName && (
                      <label>
                        {(() => {
                          const checked = isExcluded(
                            exclusions,
                            member.id,
                            ORGANIZER
                          ); // member -> organizer excluded?
                          const disabled =
                            !checked &&
                            wouldBreakIfAdd(
                              exclusions,
                              participants,
                              member.id,
                              ORGANIZER
                            ); // would break matching?
                          return (
                            <>
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() =>
                                  toggleExclusion(ORGANIZER, member.id)
                                } // toggle member -> organizer
                              />
                              {organizerName}
                            </>
                          );
                        })()}
                      </label>
                    )}

                    {/* Other members as potential receivers (exclude self) */}
                    {members
                      .filter((mem) => mem.id !== member.id) // no self-exclusion
                      .map((mem) => {
                        const checked = isExcluded(
                          exclusions,
                          member.id,
                          mem.id
                        ); // member -> other-member excluded?
                        const disabled =
                          !checked &&
                          wouldBreakIfAdd(
                            exclusions,
                            participants,
                            member.id,
                            mem.id
                          ); // would adding this break?
                        return (
                          <label key={mem.id}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() =>
                                toggleExclusion(mem.id, member.id)
                              }
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
      )}

      <button className="submit-btn" type="submit" disabled={loading}>
        Create Secret Santa{" "}
        {loading && (
          <ClipLoader size={30} color={"var(--color-white)"} loading />
        )}
      </button>
    </form>
  );
}
