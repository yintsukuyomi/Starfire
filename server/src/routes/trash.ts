import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

interface TrashRouteOptions extends FastifyPluginOptions {
  prisma: PrismaClient;
}

export async function trashRoutes(fastify: FastifyInstance, options: TrashRouteOptions) {
  const { prisma } = options;

  // Get all items in trash
  fastify.get('/', async (request, reply) => {
    try {
      console.log('Fetching trash items...');
      
      // First, verify database connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection verified');

      const trashItems = await prisma.trashItem.findMany({
        orderBy: {
          deletedAt: 'desc',
        },
      });

      console.log(`Found ${trashItems.length} trash items`);

      if (!trashItems) {
        console.log('No trash items found, returning empty array');
        return reply.code(200).send([]);
      }

      const parsedItems = trashItems.map(item => {
        try {
          return {
            ...item,
            data: JSON.parse(item.data),
          };
        } catch (parseError) {
          console.error('Error parsing trash item data:', parseError);
          return {
            ...item,
            data: {},
          };
        }
      });

      console.log('Successfully parsed trash items');
      return reply.code(200).send(parsedItems);
    } catch (error) {
      console.error('Error in GET /trash:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return reply.code(500).send({ 
        error: 'Failed to fetch trash items',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Move item to trash
  fastify.post('/move-to-trash', async (request, reply) => {
    try {
      const { type, id } = request.body as { type: 'note' | 'folder' | 'tag'; id: string };
      
      let item;
      switch (type) {
        case 'note':
          item = await prisma.note.findUnique({ where: { id } });
          break;
        case 'folder':
          item = await prisma.folder.findUnique({ where: { id } });
          break;
        case 'tag':
          item = await prisma.tag.findUnique({ where: { id } });
          break;
      }

      if (!item) {
        return reply.code(404).send({ error: 'Item not found' });
      }

      // Create trash item
      const trashItem = await prisma.trashItem.create({
        data: {
          type,
          originalId: id,
          data: JSON.stringify(item),
          expiresAt: addDays(new Date(), 30), // 30 days retention
        },
      });

      // Soft delete the original item
      switch (type) {
        case 'note':
          await prisma.note.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
          break;
        case 'folder':
          await prisma.folder.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
          break;
        case 'tag':
          await prisma.tag.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
          break;
      }

      return trashItem;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to move item to trash' });
    }
  });

  // Restore item from trash
  fastify.post('/restore/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const trashItem = await prisma.trashItem.findUnique({
        where: { id },
      });

      if (!trashItem) {
        return reply.code(404).send({ error: 'Trash item not found' });
      }

      const itemData = JSON.parse(trashItem.data);

      // Restore the original item
      switch (trashItem.type) {
        case 'note':
          await prisma.note.update({
            where: { id: trashItem.originalId },
            data: { deletedAt: null },
          });
          break;
        case 'folder':
          await prisma.folder.update({
            where: { id: trashItem.originalId },
            data: { deletedAt: null },
          });
          break;
        case 'tag':
          await prisma.tag.update({
            where: { id: trashItem.originalId },
            data: { deletedAt: null },
          });
          break;
      }

      // Delete the trash item
      await prisma.trashItem.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to restore item' });
    }
  });

  // Permanently delete item from trash
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const trashItem = await prisma.trashItem.findUnique({
        where: { id },
      });

      if (!trashItem) {
        return reply.code(404).send({ error: 'Trash item not found' });
      }

      // Permanently delete the original item
      switch (trashItem.type) {
        case 'note':
          await prisma.note.delete({
            where: { id: trashItem.originalId },
          });
          break;
        case 'folder':
          await prisma.folder.delete({
            where: { id: trashItem.originalId },
          });
          break;
        case 'tag':
          await prisma.tag.delete({
            where: { id: trashItem.originalId },
          });
          break;
      }

      // Delete the trash item
      await prisma.trashItem.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete item' });
    }
  });

  // Clean up expired trash items (should be run by a cron job)
  fastify.post('/cleanup', async (request, reply) => {
    try {
      const expiredItems = await prisma.trashItem.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      for (const item of expiredItems) {
        // Permanently delete the original item
        switch (item.type) {
          case 'note':
            await prisma.note.delete({
              where: { id: item.originalId },
            });
            break;
          case 'folder':
            await prisma.folder.delete({
              where: { id: item.originalId },
            });
            break;
          case 'tag':
            await prisma.tag.delete({
              where: { id: item.originalId },
            });
            break;
        }

        // Delete the trash item
        await prisma.trashItem.delete({
          where: { id: item.id },
        });
      }

      return { success: true, deletedCount: expiredItems.length };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to clean up trash' });
    }
  });
} 