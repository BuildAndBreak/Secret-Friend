import { ChevronDown, X } from "lucide-react";

export default function ExclusionsPanel({
  open,
  exclusions,
  participants,
  includeOrganizer,
  organizerName,
  members,
  dropdownMemberId,
  toggleDropdown,
  toggleExclusion,
  isExcluded,
  wouldBreakIfAdd,
  ORGANIZER,
}) {
  if (!open) return null;
  return (
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
                  wouldBreakIfAdd(exclusions, participants, ORGANIZER, m.id); // prevent impossible configuration
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

                {/* Other members as potential receivers */}
                {members
                  .filter((mem) => mem.id !== member.id) // no self-exclusion
                  .map((mem) => {
                    const checked = isExcluded(exclusions, member.id, mem.id); // member -> other-member excluded?
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
  );
}
