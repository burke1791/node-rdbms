import { createServer } from 'http';
import { Server } from 'socket.io';
import BufferPool from '../bufferPool';
import { startup } from './lifecycle';
import { parseQuery } from './parser';

const PORT = 6969;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [ 'http://localhost:8080' ]
  }
});

io.on('connection', socket => {
  socket.on('ping', () => {
    console.log('received ping');
    socket.emit('pong');
  });

  socket.on('query', async (sql) => {
    console.log('received query: ' + sql);
    const query = parseQuery(sql);
    const records = await buffer.executeQuery(query);
    socket.emit('query', records);
  });

  console.log('connection established');
  console.log('connectionId: ' + socket.id);
});

const buffer = new BufferPool(10);

await startup(buffer);

httpServer.listen(PORT);