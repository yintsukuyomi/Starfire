import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export const tagsRoutes = async (fastify: FastifyInstance, options: { prisma: PrismaClient }) => {
  const { prisma } = options;

  // Get all tags
  fastify.get('/', async (request, reply) => {
    const tags = await prisma.tag.findMany({
      include: {
        notes: true,
      },
    });
    return tags;
  });

  // Get a single tag
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        notes: true,
      },
    });
    if (!tag) {
      reply.code(404);
      return { error: 'Tag not found' };
    }
    return tag;
  });

  // Create a tag
  fastify.post('/', async (request, reply) => {
    const tagData = request.body as any;
    const tag = await prisma.tag.create({
      data: tagData,
      include: {
        notes: true,
      },
    });
    return tag;
  });

  // Update a tag
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tagData = request.body as any;
    const tag = await prisma.tag.update({
      where: { id },
      data: tagData,
      include: {
        notes: true,
      },
    });
    return tag;
  });

  // Delete a tag
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.tag.delete({
      where: { id },
    });
    return { success: true };
  });
}; 