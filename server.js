var express = require('express');
var app = express();

var config = {
	port: 3000
};

//serve the assets
app.use(express.static('/partials'));
app.use('/', express.static(__dirname));



app.listen(process.env.PORT || config.port);
console.log('Magic happens on port ' + config.port);
