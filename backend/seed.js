const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDepartments() {
  const departments = [
    { name: 'Electricity Board', email: 'electricity@gov.in' },
    { name: 'Water Authority', email: 'water@gov.in' },
    { name: 'Roads & PWD', email: 'roads@gov.in' },
    { name: 'Municipal Sanitation', email: 'sanitation@gov.in' },
    { name: 'Street Lighting', email: 'streetlight@gov.in' },
    { name: 'Education Department', email: 'education@gov.in' },
    { name: 'Public Safety', email: 'safety@gov.in' },
  ];

  for (const dept of departments) {
    await prisma.department.create({ data: dept });
    console.log('Created:', dept.name);
  }

  console.log('All departments added!');
  await prisma.$disconnect();
}

addDepartments().catch(console.error);
