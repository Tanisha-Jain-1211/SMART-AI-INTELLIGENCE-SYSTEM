// Handles complaint creation, listing, status transitions, assignment, and deletion.
const { z } = require("zod");
const prisma = require("../utils/prismaClient");
const { classifyComplaint, checkDuplicate } = require("../services/mlService");

const complaintCreateSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
  category: z
    .enum([
      "ELECTRICITY",
      "WATER",
      "ROADS",
      "GARBAGE",
      "STREET_LIGHTS",
      "EDUCATION",
      "PUBLIC_SAFETY",
      "OTHER"
    ])
    .optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  note: z.string().optional()
});

const assignDepartmentSchema = z.object({
  departmentId: z.string().uuid()
});

/**
 * Creates a complaint, then enriches it with ML classification and duplicate checks.
 */
async function createComplaint(req, res, next) {
  try {
    const body = complaintCreateSchema.parse({
      ...req.body,
      latitude:
        req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
      longitude:
        req.body.longitude !== undefined ? Number(req.body.longitude) : undefined
    });

    let complaint = await prisma.complaint.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || "OTHER",
        urgency: body.urgency || "MEDIUM",
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        address: body.address || null,
        imageUrl: req.file?.path ?? null,
        userId: req.user.id
      }
    });

    const mlClassification = await classifyComplaint(body.title, body.description);
    if (mlClassification) {
      complaint = await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          aiCategory: mlClassification.category,
          aiUrgency: mlClassification.urgency,
          aiConfidence: mlClassification.confidence
        }
      });
    }

    const existingComplaints = await prisma.complaint.findMany({
      where: { category: body.category || "OTHER" },
      select: { id: true, title: true, description: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    
    const formattedExisting = existingComplaints.map(c => ({
      id: c.id,
      text: `${c.title} ${c.description}`
    }));

    const duplicate = await checkDuplicate(
      body.title, 
      body.description, 
      complaint.id, 
      formattedExisting
    );
    
    if (duplicate.isDuplicate) {
      complaint = await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          isDuplicate: true,
          duplicateOf: duplicate.similarComplaintId
        }
      });
      // Optionally could log the similarity score from duplicate.similarityScore
      console.log(`[ML] Marked complaint ${complaint.id} as duplicate. Score: ${duplicate.similarityScore}`);
    }

    return res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns paginated complaints with optional status/category/urgency filters.
 */
async function getComplaints(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;
    if (req.query.urgency) where.urgency = req.query.urgency;

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: complaints,
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
 * Returns a single complaint with status history and creator name.
 */
async function getComplaintById(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        statusHistory: {
          orderBy: { changedAt: "desc" }
        },
        user: {
          select: { name: true }
        }
      }
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates complaint status and creates a status history entry.
 */
async function updateComplaintStatus(req, res, next) {
  try {
    const body = statusSchema.parse(req.body);
    const complaintId = req.params.id;

    await prisma.$transaction([
      prisma.complaint.update({
        where: { id: complaintId },
        data: { status: body.status }
      }),
      prisma.statusHistory.create({
        data: {
          complaintId,
          status: body.status,
          note: body.note || null
        }
      })
    ]);

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        statusHistory: {
          orderBy: { changedAt: "desc" },
          take: 1
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedComplaint
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Assigns a complaint to a department.
 */
async function assignComplaint(req, res, next) {
  try {
    const body = assignDepartmentSchema.parse(req.body);

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { departmentId: body.departmentId }
    });

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Deletes complaint based on role and ownership/status restrictions.
 */
async function deleteComplaint(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      select: { id: true, userId: true, status: true }
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    if (req.user.role === "CITIZEN") {
      const isOwner = complaint.userId === req.user.id;
      const isPending = complaint.status === "PENDING";
      if (!isOwner || !isPending) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }
    }

    await prisma.$transaction([
      prisma.statusHistory.deleteMany({ where: { complaintId: complaint.id } }),
      prisma.complaint.delete({ where: { id: complaint.id } })
    ]);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted"
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint
};
