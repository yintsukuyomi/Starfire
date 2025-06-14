import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client'; // Removed BookStatus import
import fetch from 'node-fetch';

interface BookRouteOptions extends FastifyPluginOptions {
  prisma: PrismaClient;
}

export async function bookRoutes(fastify: FastifyInstance, options: BookRouteOptions) {
  const { prisma } = options;

  // Valid enum values for SQLite
  const validStatuses = ['TO_READ', 'READING', 'COMPLETED'];

  // Get user's books
  fastify.get('/user-books', async (request, reply) => {
    try {
      const userBooks = await prisma.userBook.findMany({
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return userBooks;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch user books' });
    }
  });

  // Search books via Google Books API
  fastify.get('/search', async (request, reply) => {
    try {
      const { q } = request.query as { q: string };
      
      if (!q || q.length < 2) {
        return [];
      }

      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;

      if (!data.items) {
        return [];
      }

      const books = data.items.map((item: any) => ({
        googleId: item.id,
        title: item.volumeInfo.title || 'Unknown Title',
        author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
        description: item.volumeInfo.description || '',
        coverUrl: item.volumeInfo.imageLinks?.thumbnail || null,
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || null,
      }));

      return books;
    } catch (error) {
      console.error('Google Books API error:', error);
      reply.code(500).send({ error: 'Failed to search books' });
    }
  });

  // Add book to user's library
  fastify.post('/', async (request, reply) => {
    try {
      const { title, author, description, coverUrl, isbn, googleId } = request.body as {
        title: string;
        author: string;
        description?: string;
        coverUrl?: string;
        isbn?: string;
        googleId?: string;
      };

      // Get user ID from request (you'll need to implement auth middleware)
      const userId = request.headers['user-id'] as string; // Temporary - implement proper auth

      // Check if book already exists
      let book = await prisma.book.findFirst({
        where: {
          OR: [
            { googleId },
            { isbn },
            { title, author }
          ]
        }
      });

      // Create book if it doesn't exist
      if (!book) {
        book = await prisma.book.create({
          data: {
            title,
            author,
            description,
            coverUrl,
            isbn,
            googleId,
          },
        });
      }

      // Check if user already has this book
      const existingUserBook = await prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id,
          },
        },
      });

      if (existingUserBook) {
        return reply.code(400).send({ error: 'Book already in your library' });
      }

      // Add book to user's library
      const userBook = await prisma.userBook.create({
        data: {
          userId,
          bookId: book.id,
        },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return userBook;
    } catch (error) {
      console.error('Add book error:', error);
      reply.code(500).send({ error: 'Failed to add book' });
    }
  });

  // Update user book (status, rating, notes, favorite)
  fastify.put('/user-books/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, rating, notes, isFavorite } = request.body as {
        status?: string;
        rating?: number;
        notes?: string;
        isFavorite?: boolean;
      };

      // Validate status if provided
      if (status && !validStatuses.includes(status)) {
        return reply.code(400).send({ error: 'Invalid status value' });
      }

      // Validate rating if provided
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return reply.code(400).send({ error: 'Rating must be between 1 and 5' });
      }

      const userBook = await prisma.userBook.update({
        where: { id },
        data: {
          ...(status && { status: status as 'TO_READ' | 'READING' | 'COMPLETED' }),
          ...(rating !== undefined && { rating }),
          ...(notes !== undefined && { notes }),
          ...(isFavorite !== undefined && { isFavorite }),
        },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return userBook;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update book' });
    }
  });

  // Delete book from user's library
  fastify.delete('/user-books/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await prisma.userBook.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete book' });
    }
  });

  // Get AI recommendations (placeholder)
  fastify.get('/recommendations', async (request, reply) => {
    try {
      // This is a placeholder - implement AI recommendations with OpenAI
      // For now, return some popular books
      const recommendations = [
        {
          id: 'rec-1',
          title: 'The Seven Husbands of Evelyn Hugo',
          author: 'Taylor Jenkins Reid',
          description: 'A captivating novel about love, ambition, and the price of fame.',
          coverUrl: 'https://covers.openlibrary.org/b/isbn/9781501161933-M.jpg',
        },
        {
          id: 'rec-2', 
          title: 'Atomic Habits',
          author: 'James Clear',
          description: 'Transform your life with tiny changes and remarkable results.',
          coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
        }
      ];

      return recommendations;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to get recommendations' });
    }
  });
}
