var http = require('http');
//var https = require('https');

var fs = require('fs'); // Using the filesystem module

//edit and insert your https-certificate
// var options = {
// key: fs.readFileSync('my-key.pem'),
// cert: fs.readFileSync('my-cert.pem')
// };

var httpServer = http.createServer(requestHandler);
httpServer.listen(3001);


var url = require('url');
// httpServer.listen(8080);
console.log('Server listening on port 3001');

function requestHandler(req, res) {

  var parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);

  // Read in the file they requested
  fs.readFile(__dirname + parsedUrl.pathname,
    // Callback function, called when reading is complete
    function(err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + parsedUrl.pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200);
      res.end(data);
    }
  );
}

var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log("We have a new client: " + socket.id);
    // socket.on('coordinates', function(data) {
    //   io.sockets.emit('coordates', data);
    // });
    socket.on('dataurl', function(data) {
      io.sockets.emit('dataurl', {id: socket.id, data: data});
    });

    // socket.on('',
    //   // Run this function when a message is sent
    //   function(data) {
    //     console.log(data);
    //     //io.sockets.emit('draw');
    //     io.sockets.emit('connectToChat', { id: socket.id, data: data });
    //   }
    // );
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });

  }
);
