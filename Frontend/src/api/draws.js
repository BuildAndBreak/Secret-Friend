// Frontend/src/api/draws.js
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function parseErrorResponse(res) {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const data = await res.json();
    const messages = [];
    if (typeof data.message === "string") messages.push(data.message);
    if (Array.isArray(data.errors)) messages.push(...data.errors);
    return {
      message:
        messages.filter(Boolean).join(", ") ||
        `HTTP ${res.status} ${res.statusText}`,
      data,
    };
  }
  const text = await res.text();
  return {
    message: text?.trim() || `HTTP ${res.status} ${res.statusText}`,
    data: text,
  };
}

export function serializeExclusions(exclusions) {
  return Object.entries(exclusions).map(([ownerId, set]) => ({
    id: ownerId,
    excludedMemberIds: Array.from(set || []),
  }));
}

export async function createDraw(payload, { signal } = {}) {
  const res = await fetch(`${API}/api/draws`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errInfo = await parseErrorResponse(res);
    const err = new Error(errInfo.message);
    err.status = res.status;
    err.data = errInfo.data;
    throw err;
  }
  return res.json(); // { id, groupCode, pairs }
}
