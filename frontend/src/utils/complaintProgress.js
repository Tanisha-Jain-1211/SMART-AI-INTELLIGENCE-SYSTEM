// Shared progress pipeline helpers for track page and list rows.

export const STATUS_PIPELINE = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export function formatStepLabel(status) {
  try {
    return String(status || "").replace(/_/g, " ");
  } catch (err) {
    console.log("[complaintProgress] formatStepLabel", err);
    return "";
  }
}

/**
 * @returns {{ variant: 'normal' | 'rejected', percent: number }}
 */
export function getProgressPercent(status) {
  try {
    if (status === "REJECTED") {
      return { variant: "rejected", percent: 100 };
    }
    const map = {
      PENDING: 20,
      UNDER_REVIEW: 40,
      IN_PROGRESS: 60,
      RESOLVED: 100
    };
    return { variant: "normal", percent: map[status] ?? 20 };
  } catch (err) {
    console.log("[complaintProgress] getProgressPercent", err);
    return { variant: "normal", percent: 20 };
  }
}

export function getUrgencyEtaNote(urgency) {
  try {
    const notes = {
      LOW: "Usually resolved in 7 days",
      MEDIUM: "Usually resolved in 3-5 days",
      HIGH: "Usually resolved in 24-48 hours",
      CRITICAL: "Priority case - being handled urgently"
    };
    return notes[urgency] || notes.MEDIUM;
  } catch (err) {
    console.log("[complaintProgress] getUrgencyEtaNote", err);
    return "Usually resolved in 3-5 days";
  }
}

export function getLastUpdatedAt(complaint, statusHistory) {
  try {
    const times = [];
    if (complaint?.updatedAt) times.push(new Date(complaint.updatedAt).getTime());
    if (complaint?.createdAt) times.push(new Date(complaint.createdAt).getTime());
    for (const h of statusHistory || []) {
      if (h?.changedAt) times.push(new Date(h.changedAt).getTime());
    }
    if (!times.length) return null;
    return new Date(Math.max(...times));
  } catch (err) {
    console.log("[complaintProgress] getLastUpdatedAt", err);
    return complaint?.updatedAt ? new Date(complaint.updatedAt) : null;
  }
}

/**
 * Build ordered pipeline steps with visual state and timestamps from history.
 */
export function buildPipelineSteps(complaint, statusHistory) {
  try {
    const historyAsc = [...(statusHistory || [])].sort(
      (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
    );
    const firstByStatus = {};
    for (const h of historyAsc) {
      if (!firstByStatus[h.status]) firstByStatus[h.status] = h;
    }

    const emptyHistory = historyAsc.length === 0;
    if (!firstByStatus.PENDING) {
      firstByStatus.PENDING = {
        id: "synthetic-pending",
        status: "PENDING",
        changedAt: complaint.createdAt,
        note: null
      };
    }

    const dbStatus = complaint.status;
    const isRejected = dbStatus === "REJECTED";
    const rejEntry = firstByStatus.REJECTED;

    return STATUS_PIPELINE.map((stepStatus, stepIdx) => {
      let visual = "pending";

      if (isRejected) {
        if (stepStatus === "REJECTED") {
          visual = "rejected";
        } else if (rejEntry) {
          const stepEntry = firstByStatus[stepStatus];
          if (
            stepEntry &&
            new Date(stepEntry.changedAt).getTime() <= new Date(rejEntry.changedAt).getTime()
          ) {
            visual = "completed";
          } else if (stepStatus === "PENDING") {
            visual = "completed";
          } else {
            visual = "pending";
          }
        } else {
          visual = stepStatus === "REJECTED" ? "rejected" : "pending";
        }
      } else if (emptyHistory && dbStatus === "PENDING") {
        if (stepIdx === 0) visual = "completed";
        else if (stepIdx === 1) visual = "current";
        else visual = "pending";
      } else {
        const curIdx = STATUS_PIPELINE.indexOf(dbStatus);
        if (stepIdx < curIdx) visual = "completed";
        else if (stepIdx === curIdx) visual = "current";
        else visual = "pending";
      }

      const entry = firstByStatus[stepStatus];

      return {
        status: stepStatus,
        label: formatStepLabel(stepStatus),
        visual,
        changedAt: entry?.changedAt ?? null,
        note: entry?.note ?? null
      };
    });
  } catch (err) {
    console.log("[complaintProgress] buildPipelineSteps", err);
    return STATUS_PIPELINE.map((s) => ({
      status: s,
      label: formatStepLabel(s),
      visual: "pending",
      changedAt: null,
      note: null
    }));
  }
}
