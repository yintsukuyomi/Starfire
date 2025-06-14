import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Create a test folder
  const folder = await prisma.folder.create({
    data: {
      name: 'Test Folder',
    },
  });

  // Create a test tag
  const tag = await prisma.tag.create({
    data: {
      name: 'Test Tag',
      color: '#FF0000',
    },
  });

  // Create a test note
  const note = await prisma.note.create({
    data: {
      title: 'Test Note',
      content: 'This is a test note',
      folderId: folder.id,
      tags: {
        connect: [{ id: tag.id }],
      },
    },
  });

  // Move the note to trash
  await prisma.trashItem.create({
    data: {
      type: 'note',
      originalId: note.id,
      data: JSON.stringify(note),
      expiresAt: addDays(new Date(), 30),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 