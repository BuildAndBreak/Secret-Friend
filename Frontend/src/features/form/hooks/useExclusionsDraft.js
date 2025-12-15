import { useEffect } from "react";
import { serializeExclusions, deserializeExclusions } from "../../../api/draws";

export function useExclusionsDraft({
  exclusions,
  setDraftData,
  setExclusions,
}) {
  // save exclusions to LocalStorage on change
  useEffect(() => {
    if (Object.keys(exclusions).length === 0) return;

    try {
      const draftExists = localStorage.getItem("secret-santa-draft");
      if (!draftExists) return;

      const parsedDraft = JSON.parse(draftExists);

      const serialized = serializeExclusions(exclusions);
      const newDraft = { ...parsedDraft, exclusions: serialized };

      setDraftData(newDraft);
      localStorage.setItem("secret-santa-draft", JSON.stringify(newDraft));
    } catch (err) {
      console.error("Failed to save exclusions to localStorage:", err);
    }
  }, [exclusions, setDraftData]);

  // load exclusions from LocalStorage on mount
  useEffect(() => {
    const draftExists = localStorage.getItem("secret-santa-draft");
    if (!draftExists) return;

    try {
      const parsedDraft = JSON.parse(draftExists);

      if (Array.isArray(parsedDraft.exclusions)) {
        setExclusions(deserializeExclusions(parsedDraft.exclusions));
      }
    } catch (err) {
      console.error("Failed to load exclusions from draft", err);
    }
  }, [setExclusions]);
}
