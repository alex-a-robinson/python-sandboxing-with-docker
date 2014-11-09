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

    var id = genID()

    socket.emit('program-id', id)


    socket.on('program-in', function(data) {
        if (data[1] != 'example') {
            socket.emit('program-error', '**ERROR** Incorrect password')
            return
        }

        executeFile(socket, data[0], id)
    })
})

function executeFile(socket, data, id) {

    // replace quotes
    var re = new RegExp('"', 'g')
    data = data.replace(re, '\\"')

    cmd = spawn('docker', ['run', '-c', '10', '-m', '5m', '-it', '--rm', 'python:3', 'sh', '-c', 'echo ' + '"' + data + '"' + ' >> /usr/local/bin/app.py && python /usr/local/bin/app.py', ''])

    cmd.on('error', function(err) {
        console.error(id, err)
    })

    cmd.stdout.on('data', function(data) {
        socket.emit('program-out', data.toString('utf-8'))
    })

    cmd.stderr.on('data', function(err) {
        socket.emit('program-error', err.toString('utf-8'))
        console.error(id, err.toString('utf-8'))
    })
}

function genID() {
    return ("00000000", Math.floor(Math.random() * 4294967296).toString(16)).substr(-8)
}
