// Import React hooks and icons/styles you use in this step.
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

  /**
   * EXCLUSIONS (directional):
   * 'exclusions[giverId]' is a Set of receiverIds the giver CANNOT give to.
   * Example: exclusions["A"] = Set(["B"]) → A cannot give to B.
   */
  const [exclusions, setExclusions] = useState({}); // start with empty map

  const ORGANIZER = "organizer"; // special id used when organizer participates
  const organizerName = (nameOrganizer || "").trim(); // normalized organizer name (empty string if undefined/null)

  // Build the participants list of ids, in a stable order.
  const participants = useMemo(() => {
    // memoize so we don't rebuild on every render unless deps change
    const ids = [];
    if (includeOrganizer && organizerName) ids.push(ORGANIZER); // put organizer first if included and has a name
    for (const m of members) ids.push(m.id); // then push every member id
    return ids; // result like ["organizer", "a1", "a2", ...] or without organizer
  }, [includeOrganizer, organizerName, members]); // recompute when any of these change

  // Toggle which member's dropdown is open (click to open/close).
  function toggleDropdown(id) {
    setDropdownMemberId((prev) => (prev === id ? null : id)); // close if already open, otherwise open the clicked one
  }

  // Clone the exclusions object (plain object) and each inner Set to keep immutability.
  const cloneExclusions = (src) => {
    const out = {};
    for (const k in src) out[k] = new Set(src[k]); // copy each giver's Set so we don't mutate existing state
    return out;
  };

  // Utility to check if a specific directed exclusion exists.
  const isExcluded = (giverId, receiverId) =>
    !!exclusions[giverId]?.has(receiverId); // true if exclusions[giverId] exists and its Set has receiverId

  // ---------- MATCHING CHECK (CORE ALGORITHM) ----------
  /**
   * Returns true if there's at least one perfect assignment (permutation) meeting:
   *  - every participant gives to exactly one distinct receiver,
   *  - nobody gives to themselves,
   *  - all directed exclusions (giver -> receiver) are respected.
   * We use simple DFS backtracking; it's fast for typical Secret Santa sizes.
   */
  function hasPerfectMatching(participants, exclMap) {
    const n = participants.length; // number of people
    const givers = participants.slice(); // copy array for clarity (order matters for DFS)
    const receivers = participants.slice(); // possible receivers are the same set of ids
    const used = new Set(); // Set of receivers already taken in the current partial assignment

    function dfs(i) {
      // try to assign giver at index i
      if (i === n) return true; // base case: assigned all givers successfully
      const giver = givers[i]; // current giver id

      for (const rec of receivers) {
        // iterate over every potential receiver
        if (rec === giver) continue; // rule: no self-gifts
        if (used.has(rec)) continue; // can't use the same receiver twice
        if (exclMap[giver]?.has(rec)) continue; // respect directed exclusion giver -> rec

        used.add(rec); // tentatively assign giver -> rec
        if (dfs(i + 1)) return true; // if the rest can be assigned, we're done
        used.delete(rec); // backtrack: unassign and try next receiver
      }
      return false; // no valid receiver for this giver under current choices
    }

    return dfs(0); // start DFS from the first giver
  }

  /**
   * Simulate adding a new exclusion (ownerId -> targetId) to the map and test if it
   * would make a perfect matching impossible. Return true if it WOULD break (so we must refuse).
   */
  const wouldBreakIfAdd = (ownerId, targetId) => {
    const next = cloneExclusions(exclusions); // copy current exclusions immutably
    const A = next[ownerId] || new Set(); // get or create the Set for this giver
    A.add(targetId); // pretend we add the directed exclusion owner -> target
    next[ownerId] = A; // write it back into the cloned map
    return !hasPerfectMatching(participants, next); // if no perfect matching exists, adding this would break things
  };

  /**
   * Toggle a single exclusion checkbox for "ownerId gives to targetId".
   * - If currently ON, remove it.
   * - If OFF, only add it if feasibility remains true (else show error and refuse).
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
    if (wouldBreakIfAdd(ownerId, targetId)) {
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

  // ---------- SUBMISSION ----------
  async function submitData(e) {
    e?.preventDefault();

    const payload = {
      // build the payload the backend expects
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
        // 2) keep minimal context locally for step 4
        "secret-santa:lastGroup",
        JSON.stringify({ drawId: String(data.id), groupCode: data.groupCode })
      );

      const res = await fetch(
        // 3) ask server to send verification email
        `${API}/api/groups/${data.groupCode}/initiate-verification`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Could not send verification email."); // non-2xx → error

      setStep(4); // 4) advance to the verification screen
    } catch (err) {
      console.error(err); // log dev info
      setError((prev) => ({
        // show user-friendly message
        ...prev,
        submit: err.message || "Failed to create draw.",
      }));
    }
  }

  if (step !== 3) return null;

  return (
    <form className="container form-step3" onSubmit={submitData}>
      <div className="form-header">
        <span type="button">
          <ChevronLeft
            style={{ marginRight: ".2rem" }}
            className="goBack"
            size={40}
            onClick={() => {
              setStep(2); // go back to previous step
              setError?.({}); // clear errors if parent passed setError
            }}
          />
        </span>
        <h2>Exclusions</h2>
      </div>
      <div>
        <p>Do you want to set exclusions?</p>
        <aside>
          An exclusion is <strong>directional</strong>: the selected giver
          cannot give to that specific receiver.
        </aside>

        {/* Organizer as a potential GIVER (if included) */}
        {includeOrganizer && organizerName && (
          <>
            <div
              className={`${
                dropdownMemberId === ORGANIZER ? "open" : ""
              } list-members-container`}>
              <span type="button">{organizerName}</span>
              {dropdownMemberId !== ORGANIZER ? (
                <ChevronDown onClick={() => toggleDropdown(ORGANIZER)} /> // open organizer’s exclusion list
              ) : (
                <X onClick={() => toggleDropdown(null)} /> // close it
              )}
            </div>

            {dropdownMemberId === ORGANIZER && (
              <div className="exclusions-dropdown">
                {members.map((m) => {
                  // every member is a possible receiver
                  const checked = isExcluded(ORGANIZER, m.id); // is organizer→member currently excluded?
                  const disabled = !checked && wouldBreakIfAdd(ORGANIZER, m.id); // prevent impossible configuration
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
                <span type="button">{member.name}</span>
                {!open ? (
                  <ChevronDown onClick={() => toggleDropdown(member.id)} /> // open their exclusion list
                ) : (
                  <X onClick={() => toggleDropdown(null)} /> // close it
                )}
              </div>

              {open && (
                <div className="exclusions-dropdown">
                  {/* Option to exclude giving to organizer (if organizer exists) */}
                  {includeOrganizer && organizerName && (
                    <label>
                      {(() => {
                        const checked = isExcluded(member.id, ORGANIZER); // member -> organizer excluded?
                        const disabled =
                          !checked && wouldBreakIfAdd(member.id, ORGANIZER); // would break matching?
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
                    .filter((mem) => mem.id !== member.id) // no self-exclusion UI (self-gift is always disallowed)
                    .map((mem) => {
                      const checked = isExcluded(member.id, mem.id); // member -> other-member excluded?
                      const disabled =
                        !checked && wouldBreakIfAdd(member.id, mem.id); // would adding this break?
                      return (
                        <label key={mem.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleExclusion(mem.id, member.id)} // toggle member -> other-member
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
      <button type="submit">Create Secret Santa</button>
    </form>
  );
}
