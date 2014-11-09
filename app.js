var express = require('express')
var app     = express()
var router  = express.Router()
var io      = require('socket.io').listen(app.listen(3000))

app.use('/', router)

router.route('/').get(function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', function(socket) {
    socket.on('program-in', function(data) {
        socket.emit('program-out', 'seems to work!')
    })
})
