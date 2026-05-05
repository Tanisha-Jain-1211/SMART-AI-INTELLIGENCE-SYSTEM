// Handles department creation and retrieval operations.
const { z } = require("zod");
const prisma = require("../utils/prismaClient");

const departmentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional()
});

/**
 * Creates a new department.
 */
async function createDepartment(req, res, next) {
  try {
    const body = departmentSchema.parse(req.body);
    const department = await prisma.department.create({
      data: {
        name: body.name,
        email: body.email || null
      }
    });

    return res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns all departments.
 */
async function getDepartments(_req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { complaints: true } }
      }
    });
    return res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createDepartment, getDepartments };
