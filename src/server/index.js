import { createServer } from 'http';
import { Server } from 'socket.io';
import BufferPool from '../bufferPool';
import { startup } from './lifecycle';
import { parseQuery, parser } from './parser';

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

  socket.on('QUERY', async (sql) => {
    console.log('received query: ' + sql);
    const query = parser(sql);
    const records = await buffer.executeQuery(query);
    socket.emit('QUERY', records);
  });

  socket.on('FETCH_TABLES', async (sql) => {
    console.log('received query: ' + sql);
    const tree = parser(sql);
    console.log(tree);
    const records = await buffer.executeQuery(tree);
    socket.emit('FETCH_TABLES', records);
  })

  console.log('connection established');
  console.log('connectionId: ' + socket.id);
});

const buffer = new BufferPool(10);

await startup(buffer);

httpServer.listen(PORT);