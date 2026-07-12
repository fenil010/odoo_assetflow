import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed default Admin user
  const adminEmail = "admin@assetflow.com";
  const passwordHash = await bcrypt.hash("AdminPassword123!", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash, // update password hash on seed to be sure
      role: Role.ADMIN,
      status: "ACTIVE",
    },
    create: {
      name: "System Administrator",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
  });
  console.log(`✅ Seeded administrator user: ${admin.email} (Password: AdminPassword123!)`);

  // 2. Seed default Departments
  const departments = ["Engineering", "Operations", "Sales", "Human Resources"];
  const seededDepts = [];
  
  for (const name of departments) {
    const existing = await prisma.department.findFirst({
      where: { name }
    });
    
    if (!existing) {
      const dept = await prisma.department.create({
        data: { name, status: "ACTIVE" }
      });
      seededDepts.push(dept);
      console.log(`🏢 Seeded department: ${name}`);
    } else {
      seededDepts.push(existing);
      console.log(`🏢 Department already exists: ${name}`);
    }
  }

  // Assign administrator to Engineering department
  const engDept = seededDepts.find(d => d.name === "Engineering");
  if (engDept) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { departmentId: engDept.id }
    });
    console.log(`🔗 Linked administrator to department: ${engDept.name}`);
  }

  // 3. Seed default Asset Categories
  const categories = [
    { name: "Electronics", description: "Laptops, phones, tablets, monitors, and testing gear" },
    { name: "Furniture", description: "Office desks, chairs, standing tables, and whiteboard systems" },
    { name: "Vehicles", description: "Company shuttles, delivery trucks, and shared utility vehicles" },
    { name: "Machinery", description: "Lab testing machines, industrial pumps, and server arrays" }
  ];

  for (const cat of categories) {
    await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
      },
      create: {
        name: cat.name,
        description: cat.description,
        customFields: {}
      }
    });
    console.log(`🏷️ Seeded category: ${cat.name}`);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
