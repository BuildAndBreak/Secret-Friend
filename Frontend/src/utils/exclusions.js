// copy each giver's Set so we don't mutate existing state
export const cloneExclusions = (src) => {
  const out = {};
  for (const k in src) out[k] = new Set(src[k]);
  return out;
};

// utility to check if a specific directed exclusion exists.
export const isExcluded = (exclusions, giverId, receiverId) =>
  !!exclusions[giverId]?.has(receiverId);

/*
    Returns true if there's at least one perfect assignment meeting:
     - every participant gives to exactly one distinct receiver,
     - nobody gives to themselves,
     - all directed exclusions (giver -> receiver) are respected.
    Simple DFS backtracking;
  */

export const hasPerfectMatching = (participants, exclMap) => {
  const n = participants.length;
  const givers = participants.slice();
  const receivers = participants.slice();
  const used = new Set(); // Set of receivers already taken in the current partial assignment

  function dfs(i) {
    // try to assign giver at index i
    if (i === n) return true; // assigned all givers successfully
    const giver = givers[i]; // current giver id

    for (const rec of receivers) {
      // iterate over every potential receiver
      if (rec === giver) continue; // no self-gifts
      if (used.has(rec)) continue; // can't use the same receiver twice
      if (exclMap[giver]?.has(rec)) continue; // respect directed exclusion giver -> rec

      used.add(rec); // tentatively assign giver -> rec
      if (dfs(i + 1)) return true; // if the rest can be assigned, done
      used.delete(rec); // backtrack: unassign and try next receiver
    }
    return false; // no valid receiver for this giver under current choices
  }

  return dfs(0); // start DFS from the first giver
};

/*
    simulate adding the checkbox “owner cannot give to target”
    check if there is still at least one valid assignment
    return true if it would break (so disable checkbox)
  */

export const wouldBreakIfAdd = (
  exclusions,
  participants,
  ownerId,
  targetId
) => {
  const next = cloneExclusions(exclusions); // copy current exclusions immutably
  const A = next[ownerId] || new Set(); // get or create the Set for this giver
  A.add(targetId); // pretend we add the directed exclusion owner -> target
  next[ownerId] = A; // write it back into the cloned map
  return !hasPerfectMatching(participants, next); // if no perfect matching exists, adding this would break things
};
