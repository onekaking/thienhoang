// var cool = require('cool-ascii-faces');
// var express = require('express');
// var hbjs = require("handbrake-js"),
//     path = require("path");
// var fs = require("fs"),
//     http = require("http"),
//     url = require("url");

// var app = express();

// app.set('port', (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/public'));

// // views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

// app.get('/', function(request, response) {
//   	response.render('pages/index')
// });

// app.get('/cool', function(request, response) {
//   	response.send(cool());
// });

// app.get('/video', function(request, response) {
// 	var options = {
// 	    input: path.resolve(__dirname, "video/test.avi"),
// 	    output: "video/output.mp4"
// 	};

// 	hbjs.spawn({ input: "video/test.avi", output: "video/output.mp4" })
// 	  .on("error", function(err){
// 	    // invalid user input, no video found etc
// 	  })
// 	  .on("progress", function(progress){
// 	    console.log(
// 	      "Percent complete: %s, ETA: %s", 
// 	      progress.percentComplete, 
// 	      progress.eta
// 	    );
// 	  });

// 	/* 
// 	Transcodes the input .mkv to an .mp4 using the 'Normal' preset.
// 	Using spawn enables you to track progress while encoding,
// 	more appropriate for long-running tasks.
// 	*/
// 	hbjs.exec(options, function(err, stdout, stderr){
//     	if (err) throw err;
// 	 	console.log("STDERR:", stderr);
// 	    console.log("STDOUT:", stdout);
// 	    response.send("OK");
// 	});

// });

// app.get('/watch', function(req, res) {
// 	res.writeHead(200, { "Content-Type": "text/html" });
//     res.end('<video controls><source src="movie.mp4" type="video/mp4"/></video>');
// });

// app.get('/movie.mp4', function(req, res) {
//   // 	var file = path.resolve(__dirname,"video/output.mp4");
//   //   var range = req.headers.range;
//   //   var positions = range.replace(/bytes=/, "").split("-");
//   //   var start = parseInt(positions[0], 10);

//   //   fs.stat(file, function(err, stats) {
//   //     	var total = stats.size;
//   //     	var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
//   //     	var chunksize = (end - start) + 1;

//   //     	console.log(positions);
//   //   	console.log(start + '-' + end + '-' + stats.size);
		
// 		// res.writeHead(206, {
// 		// 	"Content-Range": "bytes " + start + "-" + end + "/" + total,
// 		// 	"Accept-Ranges": "bytes",
// 		// 	"Content-Length": chunksize,
// 		// 	"Content-Type": "video/mp4"
// 		// });

//   //     	var stream = fs.createReadStream(file, { start: start, end: end })
//   //       .on("open", function() {
//   //         	stream.pipe(res);
//   //       }).on("error", function(err) {
//   //         	res.end(err);
//   //       });
//   //   });
	
// 	var path = 'video/videoviewdemo.mp4';
// 	var stat = fs.statSync(path);
// 	var total = stat.size;
// 	if (req.headers['range']) {
// 		var range = req.headers.range;
// 		var parts = range.replace(/bytes=/, "").split("-");
// 		var partialstart = parts[0];
// 		var partialend = parts[1];

// 		var start = parseInt(partialstart, 10);
// 		var end = partialend ? parseInt(partialend, 10) : total-1;
// 		var chunksize = (end-start)+1;
// 		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

// 		var file = fs.createReadStream(path, {start: start, end: end});
// 		res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
// 		file.pipe(res);
// 	} else {
// 		console.log('ALL: ' + total);
// 		res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
// 		fs.createReadStream(path).pipe(res);
// 	}
	
// });


// app.listen(app.get('port'), function() {
//   	console.log('Node app is running on port', app.get('port'));
// });

// var app = require('express')();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

// server.listen(3000);

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

// app.get('/user', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

// var chat = io
//   .of('/chat')
//   .on('connection', function (socket) {
//     socket.emit('a message', {
//         that: 'only'
//       , '/chat': 'will get'
//     });
//     chat.emit('a message', {
//         everyone: 'in'
//       , '/chat': 'will get'
//     });
//   });

// var news = io
//   .of('/news')
//   .on('connection', function (socket) {
//     socket.emit('item', { news: 'item' });
//   });

var express = require('express');
var fs = require('fs');
var app =  express();

app.set('port', (process.env.PORT || 5000));

// Initialize main server
// app.use(express.bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.get('/', function(req, res){
  res.render('index');
});

app.get('/view/:room', function(req, res){
  res.render('view', {room: req.params.room});
});

app.get('/broadcast/:room', function(req, res){
  res.render('broadcast', {room: req.params.room});
});

app.listen(app.get('port'));

var BinaryServer = require('binaryjs').BinaryServer;
var rooms = {};

// Start Binary.js server
var server = BinaryServer({port: 9001});
// Wait for new user connections
server.on('connection', function(client){
  client.on('error', function(e) {
    console.log(e.stack, e.message);
  });
  client.on('stream', function(stream, meta){
    if(meta.type == 'write') {
      rooms[meta.room] = stream;
    } else if (meta.type == 'read' && rooms[meta.room]) {
      rooms[meta.room].pipe(stream);
    }
 });
});
