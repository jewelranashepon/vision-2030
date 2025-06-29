import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Member data from image
  const members = [
    { id: '203001', name: 'Md. Jakir Hossain', email: 'jakir@example.com', installments: [5000,5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0] },
    { id: '203002', name: 'Raju Ahmed', email: 'raju@example.com', installments: [10000,10000,10000,10000,10000,10000,10000,0,0,0,0,0,0,0,0] },
    { id: '203003', name: 'Md. Shahinur Rahman', email: 'shahinur@example.com', installments: [5000,5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0] },
    { id: '203004', name: 'Muhammad Salim Reza', email: 'salim@example.com', installments: [5000,5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0] },
    { id: '203005', name: 'Khairul Islam', email: 'khairul@example.com', installments: [5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0,0] },
    { id: '203006', name: 'Rafiqul Islam', email: 'rafiqul@example.com', installments: [5000,5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0] },
    { id: '203007', name: 'Md. Anisur Rahman', email: 'anisur@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203008', name: 'Assaduzzaman Repon', email: 'repon@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203009', name: 'Jewel Rana', email: 'jewel@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203010', name: 'Md. Sabbir Ahamed Shohan', email: 'shohan@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203011', name: 'Md. Anwar Hossen Sumon', email: 'sumon@example.com', installments: [2000,2000,2000,2000,2000,1000,0,0,0,0,0,0,0,0,0] },
    { id: '203012', name: 'Shakil Hossain', email: 'shakil@example.com', installments: [1000,1000,1000,1000,1000,1000,1000,0,0,0,0,0,0,0,0] },
    { id: '203013', name: 'Md. Mizanur Rahman', email: 'mizanur@example.com', installments: [5000,5000,5000,5000,5000,5000,5000,0,0,0,0,0,0,0,0] },
    { id: '203014', name: 'Zihad', email: 'zihad@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203015', name: 'Sultana Parvin Sathi', email: 'sathi@example.com', installments: [1000,1000,1000,1000,1000,1000,1000,0,0,0,0,0,0,0,0] },
    { id: '203016', name: 'Sonia', email: 'sonia@example.com', installments: [2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0,0,0] },
    { id: '203017', name: 'Khokon', email: 'khokon@example.com', installments: [3000,3000,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  ];

  const months = [
    '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04',
    '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'
  ];

  for (const m of members) {
    const hashedPassword = await bcrypt.hash('member123', 10);

    const user = await prisma.user.create({
      data: {
        email: m.email,
        password: hashedPassword,
        name: m.name,
        role: 'MEMBER',
      },
    });

    const member = await prisma.member.create({
      data: {
        membershipId: m.id,
        userId: user.id,
      },
    });

    // Insert installments
    for (let i = 0; i < months.length; i++) {
      const amount = m.installments[i];
      if (amount > 0) {
        await prisma.installment.create({
          data: {
            memberId: member.id,
            month: months[i],
            amount,
            paymentDate: new Date(`${months[i]}-15`),
          },
        });
      }
    }

    console.log(`✅ Seeded member: ${m.name}`);
  }

  console.log('🎉 Database seeded with all members and installments!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
