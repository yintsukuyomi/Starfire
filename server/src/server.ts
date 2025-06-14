import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './lib/prisma';
import { trashRoutes } from './routes/trash';
import { notesRoutes } from './routes/notes';
import { foldersRoutes } from './routes/folders';
import { tagsRoutes } from './routes/tags';

const server = Fastify({
  logger: true,
});

// Register CORS
server.register(cors, {
  origin: true, // Allow all origins in development
});

// Register routes
server.register(trashRoutes, { prefix: '/api/trash', prisma });
server.register(notesRoutes, { prefix: '/api/notes', prisma });
server.register(foldersRoutes, { prefix: '/api/folders', prisma });
server.register(tagsRoutes, { prefix: '/api/tags', prisma });

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server is running on port 3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 