// upsert: có rồi thì bỏ qua, chưa có thì tạo -> chạy nhiều lần không bị trùng
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { rolename: 'admin' },
    update: {},
    create: { rolename: 'admin' },
  });
  await prisma.role.upsert({
    where: { rolename: 'normal' },
    update: {},
    create: { rolename: 'normal' },
  });

  await prisma.memberShip.upsert({
    where: { mname: 'Member' },
    update: {},
    create: { mname: 'Member', score: 10 },
  });

  console.log('✅ Seed xong: roles (admin, normal), membership (Member, score 10)');
}

main()
  .catch((err) => {
    console.error('❌ Seed lỗi:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());