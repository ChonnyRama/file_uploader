const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'someemail@abc.com',
      password: hashedPassword
    }
  });

  console.log('test user created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })