import { Server } from 'socket.io'

let io = null;

const initSocket = (server) =>{
    io = new Server(server,{
        cors: {origin : '*'}
    })

    io.on('connection', (socket) => {
        console.log('Admin connected');

        socket.on('disconnect', () => {
            console.log('Admin disconnected');
        })
    })


}

const emitStatsUpdate = (data) => {
    if(io !== null){
        io.emit('status_update', data)
    }
}

export {initSocket, emitStatsUpdate}