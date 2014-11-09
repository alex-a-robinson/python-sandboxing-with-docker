var fs      = require('fs')
var spawn   = require('child_process').spawn
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
        writeFile(socket, data, executeFile)
    })
})

function executeFile(socket, path) {
    cmd = spawn('python', [path])

    cmd.on('error', function(err) {
        console.error(path, err)
    })

    cmd.stdout.on('data', function(data) {
        console.log(data.toString('utf-8'))
        socket.emit('program-out', data.toString('utf-8'))
    })

    cmd.stderr.on('data', function(err) {
        console.error(path, err)
    })

    cmd.on('close', function(code) {
        console.log(path + ' exited with code: ' + code)
    })
}

function writeFile(socket, data, callback) {
    id = ("00000000", Math.floor(Math.random() * 4294967296).toString(16)).substr(-8)
    path = '/tmp/' + id + '.py'
    fs.writeFile(path, data, function(err) {
        if (err) {
            console.error(err)
        } else {
            console.log('saved: ' + id)
            callback(socket, path)
        }
    })
}
