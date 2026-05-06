// Nodemailer helpers for citizen notifications (non-blocking from controllers).
const nodemailer = require("nodemailer");

const STATUS_PIPELINE = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function formatStepLabel(status) {
  try {
    return String(status || "").replace(/_/g, " ");
  } catch (err) {
    console.log("[emailService] formatStepLabel", err);
    return "";
  }
}

function getProgressPercent(status) {
  try {
    if (status === "REJECTED") return { variant: "rejected", percent: 100 };
    const map = {
      PENDING: 20,
      UNDER_REVIEW: 40,
      IN_PROGRESS: 60,
      RESOLVED: 100
    };
    return { variant: "normal", percent: map[status] ?? 20 };
  } catch (err) {
    console.log("[emailService] getProgressPercent", err);
    return { variant: "normal", percent: 20 };
  }
}

function buildPipelineSteps(complaint, statusHistory) {
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
    console.log("[emailService] buildPipelineSteps", err);
    return STATUS_PIPELINE.map((s) => ({
      status: s,
      label: formatStepLabel(s),
      visual: "pending",
      changedAt: null,
      note: null
    }));
  }
}

function formatEmailDate(value) {
  try {
    if (!value) return "";
    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch (err) {
    console.log("[emailService] formatEmailDate", err);
    return "";
  }
}

function escapeHtml(value) {
  try {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  } catch (err) {
    console.log("[emailService] escapeHtml", err);
    return "";
  }
}

function buildProgressTextLines(steps) {
  try {
    return steps
      .map((step) => {
        const label = step.label;
        if (step.visual === "completed") {
          return `✅ ${label} - completed`;
        }
        if (step.visual === "current") {
          const when = formatEmailDate(step.changedAt);
          return `🔵 ${label} - current${when ? ` (as of ${when})` : ""}`;
        }
        if (step.visual === "rejected") {
          const when = formatEmailDate(step.changedAt);
          return `🔴 ${label} - current${when ? ` (as of ${when})` : ""}`;
        }
        return `⏳ ${label} - pending`;
      })
      .join("\n");
  } catch (err) {
    console.log("[emailService] buildProgressTextLines", err);
    return "";
  }
}

function createTransport() {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      return null;
    }
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  } catch (err) {
    console.log("[emailService] createTransport", err);
    return null;
  }
}

/**
 * Sends status update email to citizen. Safe to await; failures are logged inside.
 */
async function sendStatusUpdate({
  to,
  citizenName,
  complaint,
  newStatus,
  note,
  statusHistory
}) {
  try {
    const transport = createTransport();
    if (!transport) {
      console.log("[emailService] Missing EMAIL_USER / EMAIL_PASS — skipping email");
      return { skipped: true };
    }

    const steps = buildPipelineSteps(
      { ...complaint, status: newStatus },
      statusHistory
    );
    const progress = getProgressPercent(newStatus);
    const progressLines = buildProgressTextLines(steps);
    const progressLabel =
      progress.variant === "rejected" ? "Rejected" : `${progress.percent}% Complete`;

    const updatedLine = formatEmailDate(new Date());
    const officerNote =
      note && String(note).trim().length ? String(note).trim() : "—";

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const trackUrl = `${baseUrl.replace(/\/$/, "")}/track/${complaint.id}`;

    const subject = `Update on your complaint - ${complaint.title}`;

    const text = `
Dear ${citizenName || "citizen"},

Your complaint has been updated!

Complaint: ${complaint.title}
New Status: ${newStatus}
Updated on: ${updatedLine}
Officer Note: ${officerNote}

Progress: ${progressLabel}

${progressLines}

Track your complaint here:
${trackUrl}

Thank you for using Smart Complaint System.
`.trim();

    const safeName = escapeHtml(citizenName || "citizen");
    const safeTitle = escapeHtml(complaint.title);
    const safeStatus = escapeHtml(newStatus);
    const safeUpdated = escapeHtml(updatedLine);
    const safeNote = escapeHtml(officerNote);
    const safeProgressLabel = escapeHtml(progressLabel);

    const htmlSteps = progressLines
      .split("\n")
      .map((line) => {
        const safeLine = escapeHtml(line);
        return `<div style="margin:4px 0;font-family:system-ui,sans-serif;">${safeLine}</div>`;
      })
      .join("");

    const html = `
<p>Dear ${safeName},</p>
<p>Your complaint has been updated!</p>
<ul>
  <li><strong>Complaint:</strong> ${safeTitle}</li>
  <li><strong>New Status:</strong> ${safeStatus}</li>
  <li><strong>Updated on:</strong> ${safeUpdated}</li>
  <li><strong>Officer Note:</strong> ${safeNote}</li>
</ul>
<p><strong>Progress:</strong> ${safeProgressLabel}</p>
${htmlSteps}
<p><a href="${trackUrl}">Track your complaint here</a></p>
<p>Thank you for using Smart Complaint System.</p>
`.trim();

    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });

    return { sent: true };
  } catch (err) {
    console.log("[emailService] sendStatusUpdate", err);
    throw err;
  }
}

module.exports = {
  sendStatusUpdate
};
