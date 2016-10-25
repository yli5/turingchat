var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usernames = [];     // name of users chatting with humans
var usersWithBot = [];  // name of users chatting with bot
var UserRoomPair = {};  // store {username: room id} pair

var roomCount = 0;      // number of rooms open
var roomState = {};     // record the state of room {room id: state}, value is {1,-1}
                        // 1 means it's time to ask questions, -1 means it's time to answer yes/no
var UserState = {};     // record the state of user {username: state}, value is {1,-1}
                        // 1 means this user is asker, -1 means this user is responser
var numMsg = {};        // number of messages each user has sent out

var botname = 'Alan'; // Make it change randomly?
var fs = require('fs');

app.get('/', function(req, res){
  if(usernames.length % 2 == 0){
    res.sendFile(__dirname + '/chat.html');
  }
  else{
    res.sendFile(__dirname + '/chat_yesno.html');
  }
	
});

io.on('connection', function(socket){
	console.log('a user connected');

	// listen for a new user:
  socket.on('adduser', function(username){
    socket.username = username;
    numMsg[socket.username] = 0;
    // Assign to human chatroom
    if (Math.random() < 0.9) {
      socket.room = 'room' + roomCount.toString();
      usernames.push(socket.username);
      socket.join(socket.room);
      UserRoomPair[socket.username] = socket.room;    //update UserRoomPair
      
      UserState[socket.username] = 1;   // initial all users' state as 1
      roomState[socket.room] = 1;       // initial roomState as 1, namely it's time to ask questions

      if (usernames.length % 2 == 0){
        UserState[socket.username] = -1;    // if it is a responser, state changes to -1
        roomCount++;
      }
    }
    // Assign to bot chatroom
    else {
      socket.room = 'botroom' + usersWithBot.length.toString();
      usersWithBot.push(socket.username);
      socket.join(socket.room);
      UserRoomPair[socket.username] = socket.room;
      
      UserState[socket.username] = 1;     // for users in botroom, they are always askers.
    }
    console.log(socket.username + ' has joined ' + socket.room);
    console.log(usernames);
    console.log(usersWithBot);
    console.log(UserRoomPair);
  });
		
  // broadcast new message
	socket.on('sendchat', function(msg){
    if(roomState[socket.room] == UserState[socket.username]){     // can broadcast message only userstate matches roomstate
		  io.sockets.in(socket.room).emit('updatechat', socket.username, msg);
      roomState[socket.room] *= -1;   // after broadcasting, change roomstate
      numMsg[socket.username] += 1;

      fs.appendFile("test.log", '['+socket.room.toString()+':'+numMsg[socket.username]+'] '+msg+'\n', function(err){
        if (err) {
          return console.log(err)
        }
      });
    }
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
