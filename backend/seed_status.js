const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStatusHistory() {
  // Get first complaint
  const complaint = await prisma.complaint.findFirst();
  
  if (!complaint) {
    console.log('No complaints found!');
    return;
  }

  // Add status history record
  await prisma.statusHistory.create({
    data: {
      complaintId: complaint.id,
      status: 'UNDER_REVIEW',
      note: 'Complaint is being reviewed by officer'
    }
  });

  await prisma.statusHistory.create({
    data: {
      complaintId: complaint.id,
      status: 'IN_PROGRESS',
      note: 'Officer assigned, work started'
    }
  });

  console.log('StatusHistory records created!');
  await prisma.$disconnect();
}

addStatusHistory().catch(console.error);
