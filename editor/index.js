const app = require('express')();
const http = require('http').Server(app);
import initIO from 'socket.io';
const fs = require('fs');
const path = require('path');

const io = initIO(http);

const DATABASE_PATH = path.join(__dirname, 'database.db');
let database = {
  profiles: {}
};

init();

function init() {
  if (fs.existsSync(DATABASE_PATH)) {
    database = JSON.parse(fs.readFileSync(DATABASE_PATH));
  } else {
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
  }
}

function sendState(context) {
  context.emit('state', {profiles: database.profiles});
}

app.get('/', (req, res) => {
  res.send('<h1>Probably you trying to do something wrong</h1>');
});

io.on('connection', socket => {
  console.log('a user connected');

  sendState(socket);

  socket.on('save_profile', ({profile, data}) => {
    database.profiles[profile] = data;
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
    sendState(io);
  });

  socket.on('remove_profile', ({profile}) => {
    if (database.profiles[profile]) {
      delete database.profiles[profile];
      fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
      sendState(io);
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(process.argv[2], () => {
  console.log(`listening on *:${process.argv[2]}`);
});