//var http = require('http');
var https = require('https');

var fs = require('fs'); // Using the filesystem module

//edit and insert your https-certificate
var options = {
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

var httpServer = https.createServer(options, requestHandler);
httpServer.listen(8000);
console.log('Server listening on port 8000');

var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    numUsers++;
    console.log("We have a new client: " + socket.id);
    socket.on('coordinates', function(data) {
      io.sockets.emit('coordates', data);
    });
    socket.on('dataurl', function(data) {
      io.sockets.emit('dataurl', {id: socket.id, data: data});
    });

    socket.on('',
      // Run this function when a message is sent
      function(data) {
        console.log(data);
        io.sockets.emit('draw', { id: socket.id, data: data });
      }
    );
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
      numUsers--;
    });

  }
);
