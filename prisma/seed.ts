import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminCompany = await prisma.company.create({
    data: { name: "Time Tracker" },
  });

  const actions = [
    "create_user",
    "read_user",
    "update_user",
    "delete_user",
    "create_record",
    "read_record",
    "update_record",
    "delete_record",
    "manage_roles",
    "manage_permissions",
  ];

  const permissions = await Promise.all(
    actions.map((action) =>
      prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      })
    )
  );

  const employeePermissions = permissions.filter(({ action }) =>
    ["create_record", "read_record", "update_record"].includes(action)
  );

  const managerPermissions = permissions.filter(({ action }) =>
    [
      "create_record",
      "read_record",
      "update_record",
      "delete_record",
      "create_user",
      "read_user",
      "update_user",
      "delete_user",
    ].includes(action)
  );

  console.log(`✅ Criadas/atualizadas ${permissions.length} permissões.`);

  await prisma.role.create({
    data: {
      name: "EMPLOYEE",
      permissions: {
        connect: employeePermissions.map((perm) => ({ id: perm.id })),
      },
    },
  });

  await prisma.role.create({
    data: {
      name: "MANAGER",
      permissions: {
        connect: managerPermissions.map((perm) => ({ id: perm.id })),
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      permissions: {
        connect: permissions.map((perm) => ({ id: perm.id })),
      },
    },
    include: { permissions: true },
  });

  console.log(
    `✅ Role ADMIN criada com ${adminRole.permissions.length} permissões.`
  );

  const passwordHash = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin Master",
      passwordHash,
      companyId: adminCompany.id,
    },
  });

  console.log(`✅ Usuário admin criado: ${adminUser.email}`);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Usuário admin vinculado ao role ADMIN.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
