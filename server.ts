import express from 'express'
import path from 'path'
import http from 'http'
import {Server} from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors({ origin: "http://localhost:3001" }))
const server = http.createServer(app)
const io = new Server(server, {
    transports: ['websocket', 'polling'],
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
})

server.listen(3000)

app.use(express.static(path.join('/')))

let usuariosConectados: string[] = []

io.on('connection', (socket)=>{
    socket.on('entrada', (username)=>{
        socket.data.username = username
        usuariosConectados.push(username)
        console.log("Entrou alguem:")
        console.log(usuariosConectados)

        socket.emit('lista', usuariosConectados)
        socket.broadcast.emit('lista-broadcast', {
            joined: username,
            list: usuariosConectados
        })
    })

    socket.on('disconnect', ()=>{
        usuariosConectados = usuariosConectados.filter(item => item != socket.data.username )
        console.log("Saiu alguem:")
        console.log(usuariosConectados)

        socket.broadcast.emit('lista-broadcast', {
            left: socket.data.username,
            list: usuariosConectados
        })
    })

    socket.on('msg', (msgData)=> {

        socket.emit('msg', msgData)
        socket.broadcast.emit('msg', msgData)
    })
})