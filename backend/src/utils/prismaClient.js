// Exports a single shared Prisma client instance for the entire backend.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
