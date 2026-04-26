// Seeds departments, users, and realistic sample complaints for local development.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prismaClient");

async function main() {
  await prisma.statusHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const departments = await prisma.$transaction([
    prisma.department.create({
      data: { name: "Electricity Board", email: "electricity@gov.test" }
    }),
    prisma.department.create({
      data: { name: "Water Authority", email: "water@gov.test" }
    }),
    prisma.department.create({
      data: { name: "Roads & PWD", email: "roads@gov.test" }
    }),
    prisma.department.create({
      data: { name: "Municipal Sanitation", email: "sanitation@gov.test" }
    }),
    prisma.department.create({
      data: { name: "Street Lighting", email: "lighting@gov.test" }
    })
  ]);

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const officerPassword = await bcrypt.hash("Officer@123", 12);
  const citizenPassword = await bcrypt.hash("Citizen@123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@test.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const officer = await prisma.user.create({
    data: {
      name: "Field Officer",
      email: "officer@test.com",
      password: officerPassword,
      role: "OFFICER"
    }
  });

  const citizens = await Promise.all([
    prisma.user.create({
      data: {
        name: "Rohit Sharma",
        email: "rohit.sharma@gmail.com",
        password: citizenPassword,
        role: "CITIZEN",
        phone: "9876543210"
      }
    }),
    prisma.user.create({
      data: {
        name: "Priya Verma",
        email: "priya.verma@gmail.com",
        password: citizenPassword,
        role: "CITIZEN",
        phone: "9811122233"
      }
    }),
    prisma.user.create({
      data: {
        name: "Aman Yadav",
        email: "aman.yadav@gmail.com",
        password: citizenPassword,
        role: "CITIZEN",
        phone: "9898989898"
      }
    })
  ]);

  const categories = [
    "ELECTRICITY",
    "WATER",
    "ROADS",
    "GARBAGE",
    "STREET_LIGHTS",
    "EDUCATION",
    "PUBLIC_SAFETY",
    "OTHER"
  ];
  const urgencies = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const statuses = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
  const descriptions = [
    "Sector 46 mein do din se bijli baar baar ja rahi hai, bachchon ki online class bhi miss ho rahi hai.",
    "Pani ka pressure bahut kam hai, subah ke time bilkul supply nahi aa rahi, please jaldi action lijiye.",
    "Road par bada gadda hai jisse bike slip ho rahi hai, kal raat ek accident bhi hua.",
    "Garbage collection teen din se nahi hua, gali mein badbu aur machhar bahut badh gaye hain.",
    "Street light kharab hai, raat ko pura area andhera rehta hai aur safety concern hai.",
    "Government school ke bahar drainage block hai aur bachchon ko paani mein se hokar jana padta hai.",
    "Market area mein raat ko suspicious activity ho rahi hai, police patrolling badhani chahiye.",
    "Public park mein bench tuti hui hai aur swings unsafe ho gaye hain for kids."
  ];

  const createdComplaints = [];
  for (let i = 0; i < 20; i += 1) {
    const category = categories[i % categories.length];
    const urgency = urgencies[i % urgencies.length];
    const status = statuses[i % statuses.length];
    const citizen = citizens[i % citizens.length];
    const hasCoords = i % 3 !== 0;
    const createdAt = new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000);
    const assignedDepartment = departments[i % departments.length];

    const complaint = await prisma.complaint.create({
      data: {
        title: `Complaint #${i + 1} - ${category.replace("_", " ")}`,
        description: descriptions[i % descriptions.length],
        category,
        status,
        urgency,
        latitude: hasCoords ? 28.38 + (i % 12) * 0.01 : null,
        longitude: hasCoords ? 76.96 + (i % 12) * 0.012 : null,
        address: `Sector ${38 + (i % 25)}, Gurugram`,
        userId: citizen.id,
        departmentId: assignedDepartment.id,
        aiCategory: i % 2 === 0 ? category : null,
        aiUrgency: i % 2 === 0 ? urgency : null,
        aiConfidence: i % 2 === 0 ? 0.72 + (i % 4) * 0.06 : null,
        isDuplicate: i === 5 || i === 11 || i === 17,
        duplicateOf: null,
        createdAt
      }
    });

    createdComplaints.push(complaint);
    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: complaint.status,
        note: `Initial status set to ${complaint.status}`,
        changedAt:
          complaint.status === "RESOLVED"
            ? new Date(createdAt.getTime() + 36 * 60 * 60 * 1000)
            : new Date(createdAt.getTime() + 8 * 60 * 60 * 1000)
      }
    });
  }

  await prisma.complaint.update({
    where: { id: createdComplaints[5].id },
    data: { duplicateOf: createdComplaints[1].id }
  });
  await prisma.complaint.update({
    where: { id: createdComplaints[11].id },
    data: { duplicateOf: createdComplaints[2].id }
  });
  await prisma.complaint.update({
    where: { id: createdComplaints[17].id },
    data: { duplicateOf: createdComplaints[4].id }
  });

  console.log("Seed completed successfully.");
  console.log("Admin:", admin.email, "/ Admin@123");
  console.log("Officer:", officer.email, "/ Officer@123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
