var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//var onlinePair = {};
var onlineUser = [];
var UserRoomPair = {};
var onlineCount = 0;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/chat.html');
});


io.on('connection', function(socket){
	console.log('a user connected');

	// listen for a new user:
	if(onlineUser.length == 0){
			onlineUser[0] = socket.id;
			socket.join('room' + onlineCount.toString());
			UserRoomPair[socket.id] = 'room' + onlineCount.toString();
	}
	else{
		//onlinePair[onlineUser[0]] = socket.id;
		//onlinePair[socket.id] = onlineUser[0];
		//io.emit('login',{for:onlineUser[0]});
		//console.log(obj.userid + 'enters the chat room');
		socket.join('room' + onlineCount.toString());
		UserRoomPair[socket.id] = 'room' + onlineCount.toString();
		onlineCount++;
		onlineUser = [];
	}
		

	socket.on('chat message', function(msg){
		//socket.emit('chat message', socket.id);
		//socket.emit('chat message', onlineUser);
		//socket.emit('chat message', UserRoomPair[socket.id]);
		socket.emit('chat message', msg);
		socket.broadcast.to(UserRoomPair[socket.id]).emit('chat message', msg);
	});

});

http.listen(3000, function(){
	console.log('listening on *.3000');
});
