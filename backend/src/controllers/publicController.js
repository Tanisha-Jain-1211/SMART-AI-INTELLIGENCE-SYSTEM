// Exposes read-only public aggregates for the marketing / home experience.
const prisma = require("../utils/prismaClient");

/**
 * Returns lightweight complaint metrics safe for unauthenticated visitors.
 */
async function getPublicStats(_req, res, next) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [total, resolvedTodayRows, resolvedHistory] = await Promise.all([
      prisma.complaint.count(),
      prisma.statusHistory.groupBy({
        by: ["complaintId"],
        where: {
          status: "RESOLVED",
          changedAt: { gte: startOfDay }
        }
      }),
      prisma.statusHistory.findMany({
        where: { status: "RESOLVED" },
        include: {
          complaint: { select: { createdAt: true } }
        }
      })
    ]);

    const resolvedToday = resolvedTodayRows.length;

    const avgResolutionTimeHours = resolvedHistory.length
      ? Number(
          (
            resolvedHistory.reduce((sum, entry) => {
              const hours =
                (new Date(entry.changedAt) -
                  new Date(entry.complaint.createdAt)) /
                (1000 * 60 * 60);
              return sum + Math.max(0, hours);
            }, 0) / resolvedHistory.length
          ).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        resolvedToday,
        avgResolutionTimeHours
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPublicStats };
