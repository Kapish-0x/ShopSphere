// Defines which status a suborder is allowed to move to, from its current status.
// Keeping this as a single lookup table means every route that changes status
// checks the same rules — no route can accidentally skip a step.

export const ORDER_TRANSITIONS = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"], // once shipped, can't cancel — only deliver (or it gets lost/returned later)
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: [], // terminal state
  refunded: [], // terminal state
};

// Returns true/false — use this before applying any status change
export const canTransition = (currentStatus, nextStatus) => {
  const allowed = ORDER_TRANSITIONS[currentStatus];
  if (!allowed) return false; // unknown current status
  return allowed.includes(nextStatus);
};

// Throws a descriptive error if the transition isn't allowed —
// convenient for routes that just want to try/catch
export const assertValidTransition = (currentStatus, nextStatus) => {
  if (!canTransition(currentStatus, nextStatus)) {
    throw new Error(
      `Cannot change status from "${currentStatus}" to "${nextStatus}". Allowed next steps: ${
        ORDER_TRANSITIONS[currentStatus]?.join(", ") || "none (terminal state)"
      }`
    );
  }
};