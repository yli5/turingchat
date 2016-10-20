var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usernames = [];
var usersWithBot = [];
var UserRoomPair = {};
var roomCount = 0;
var botname = 'Alan'; // Make it change randomly?

app.get('/', function(req, res){
	res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
	console.log('a user connected');

	// listen for a new user:
  socket.on('adduser', function(username){
    socket.username = username;
    // Assign to human chatroom
    if (Math.random() < 0.5) {
      socket.room = 'room' + roomCount.toString();
      usernames.push(socket.username);
      socket.join(socket.room);
      UserRoomPair[socket.username] = socket.room;
      if (usernames.length % 2 == 0){
        roomCount++;
      }
    }
    // Assign to bot chatroom
    else {
      socket.room = 'botroom' + usersWithBot.length.toString();
      usersWithBot.push(socket.username);
      socket.join(socket.room);
      UserRoomPair[socket.username] = socket.room;
    }
    console.log(socket.username + ' has joined ' + socket.room);
    console.log(usernames);
    console.log(usersWithBot);
    console.log(UserRoomPair);
  });
		
  // broadcast new message
	socket.on('sendchat', function(msg){
		io.sockets.in(socket.room).emit('updatechat', socket.username, msg);
    // If user is in a bot room, bot responds
    if (usernames.indexOf(socket.username) == -1) {
      if (Math.random() < 0.5) {
        botMsg = 'Yes'
      }
      else {
        botMsg = 'No'
      }
      io.sockets.in(socket.room).emit('updatechat', botname, botMsg);
    }
	});

  // disconnect
  socket.on('disconnect', function(){
    usrIdx = usernames.indexOf(socket.username)
    if (usrIdx != -1) {
      usernames.splice(usrIdx, 1);
      if (usernames.length % 2 != 0) {
        roomCount--;
      }
    }
    else {
      usersWithBot.splice(usersWithBot.indexOf(socket.username));
    }
    delete UserRoomPair[socket.username];
    socket.leave(socket.room);
    socket.emit('chat message', 'SERVER', socket.username+' has disconnected');
    console.log(socket.username+' disconnected');
  });
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
