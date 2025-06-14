import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export const foldersRoutes = async (fastify: FastifyInstance, options: { prisma: PrismaClient }) => {
  const { prisma } = options;

  // Get all folders
  fastify.get('/', async (request, reply) => {
    const folders = await prisma.folder.findMany({
      include: {
        notes: true,
      },
    });
    return folders;
  });

  // Get a single folder
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        notes: true,
      },
    });
    if (!folder) {
      reply.code(404);
      return { error: 'Folder not found' };
    }
    return folder;
  });

  // Create a folder
  fastify.post('/', async (request, reply) => {
    const folderData = request.body as any;
    const folder = await prisma.folder.create({
      data: folderData,
      include: {
        notes: true,
      },
    });
    return folder;
  });

  // Update a folder
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const folderData = request.body as any;
    const folder = await prisma.folder.update({
      where: { id },
      data: folderData,
      include: {
        notes: true,
      },
    });
    return folder;
  });

  // Delete a folder
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.folder.delete({
      where: { id },
    });
    return { success: true };
  });
}; 