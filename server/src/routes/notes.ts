import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export const notesRoutes = async (fastify: FastifyInstance, options: { prisma: PrismaClient }) => {
  const { prisma } = options;

  // Get all notes
  fastify.get('/', async (request, reply) => {
    const notes = await prisma.note.findMany({
      include: {
        tags: true,
        folder: true,
      },
    });
    return notes;
  });

  // Get a single note
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        tags: true,
        folder: true,
      },
    });
    if (!note) {
      reply.code(404);
      return { error: 'Note not found' };
    }
    return note;
  });

  // Create a note
  fastify.post('/', async (request, reply) => {
    const noteData = request.body as any;
    const note = await prisma.note.create({
      data: {
        title: noteData.title || "Untitled Note",
        content: noteData.content || "",
        folderId: noteData.folderId,
        isArchived: noteData.isArchived || false,
        isPinned: noteData.isPinned || false,
        tags: {
          connect: noteData.tags?.map((tagId: string) => ({ id: tagId })) || []
        }
      },
      include: {
        tags: true,
        folder: true,
      },
    });
    return note;
  });

  // Update a note
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const noteData = request.body as any;
    const note = await prisma.note.update({
      where: { id },
      data: {
        title: noteData.title,
        content: noteData.content,
        folderId: noteData.folderId,
        isArchived: noteData.isArchived,
        isPinned: noteData.isPinned,
        tags: {
          set: noteData.tags?.map((tagId: string) => ({ id: tagId })) || []
        }
      },
      include: {
        tags: true,
        folder: true,
      },
    });
    return note;
  });

  // Delete a note
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.note.delete({
      where: { id },
    });
    return { success: true };
  });
}; 