// Implements admin analytics and user management endpoints.
const { z } = require("zod");
const prisma = require("../utils/prismaClient");

const roleSchema = z.object({
  role: z.enum(["CITIZEN", "OFFICER", "ADMIN"])
});

/**
 * Returns dashboard statistics for complaint volume, distribution, and resolution.
 */
async function getStats(_req, res, next) {
  try {
    const [total, statusGroups, categoryGroups, urgencyGroups, resolvedHistory] =
      await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.groupBy({
          by: ["status"],
          _count: { status: true }
        }),
        prisma.complaint.groupBy({
          by: ["category"],
          _count: { category: true }
        }),
        prisma.complaint.groupBy({
          by: ["urgency"],
          _count: { urgency: true }
        }),
        prisma.statusHistory.findMany({
          where: { status: "RESOLVED" },
          include: {
            complaint: { select: { createdAt: true } }
          }
        })
      ]);

    const byStatus = {
      PENDING: 0,
      UNDER_REVIEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0
    };
    statusGroups.forEach((item) => {
      byStatus[item.status] = item._count.status;
    });

    const byCategory = {
      ELECTRICITY: 0,
      WATER: 0,
      ROADS: 0,
      GARBAGE: 0,
      STREET_LIGHTS: 0,
      EDUCATION: 0,
      PUBLIC_SAFETY: 0,
      OTHER: 0
    };
    categoryGroups.forEach((item) => {
      byCategory[item.category] = item._count.category;
    });

    const byUrgency = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    urgencyGroups.forEach((item) => {
      byUrgency[item.urgency] = item._count.urgency;
    });

    const resolvedCount = byStatus.RESOLVED;
    const resolutionRate = total
      ? `${((resolvedCount / total) * 100).toFixed(1)}%`
      : "0.0%";

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
        byStatus,
        byCategory,
        byUrgency,
        resolutionRate,
        avgResolutionTimeHours
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns daily complaint counts for the last N days.
 */
async function getTrends(req, res, next) {
  try {
    const days = Math.max(Number(req.query.days) || 30, 1);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const complaints = await prisma.complaint.findMany({
      where: {
        createdAt: { gte: start }
      },
      select: { createdAt: true }
    });

    const grouped = complaints.reduce((acc, item) => {
      const date = new Date(item.createdAt).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const data = [];
    for (let i = 0; i < days; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const date = day.toISOString().slice(0, 10);
      data.push({ date, count: grouped[date] || 0 });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns geo-points for complaints with coordinates for heatmap rendering.
 */
async function getHeatmap(_req, res, next) {
  try {
    const points = await prisma.complaint.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        urgency: true
      }
    });

    return res.status(200).json({ success: true, data: points });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns a paginated user list with optional role filtering.
 */
async function getUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const where = req.query.role ? { role: req.query.role } : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates a user's role and returns the updated user without password fields.
 */
async function updateUserRole(req, res, next) {
  try {
    const { role } = roleSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  getTrends,
  getHeatmap,
  getUsers,
  updateUserRole
};
