var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

/* web socket functionality */
var http = require('http').Server(app);
var io = require('socket.io')(http);

var colors_available = ['white', 'black'];
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('set-available-colors', {available: colors_available});

  socket.on("choose-color", (color, callback) => {
    console.log("user chose color " + color);
    console.log(colors_available);
    if(colors_available.includes(color)) {
      idx = colors_available.indexOf(color);
      colors_available.splice(idx, 1);
      callback("success");
    } else {
      callback(null);
    }
  });

  //when a move is received, send it to the other player
  socket.on('move', (move) => {
    socket.broadcast.emit('move', move);
  })

//send chats to all users in a particular chat when a messages is received server-side
  socket.on('send-chat-message', (data) => {
      console.log('server received a message');
      console.log(data.message);
      socket.broadcast.emit('chat-message', {
          message: data.message,
          user: data.username,
          chatid: data.chatid,
      });
  });

//send chat invitation to a user when its received by the server
socket.on('invite-user-to-chat', (data) => {
  socket.broadcast.emit('invite-user', {
    user_invited: data.user_invited,
    user_inviting: data.user_inviting,
    chatid: data.chatid,
    chat_title: data.chat_title
  });
});

});

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(port, () => {
  console.log('App listening on port '+port);
})

module.exports = app;
