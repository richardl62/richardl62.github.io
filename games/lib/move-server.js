'use strict';

const moveServer_localserver = "http://localhost:5000";
const moveServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";
class moveServer {

    constructor(localMoveManager) {
        this.localMoveManager = localMoveManager;
        this.socket = null;
    }

    move(the_move) {
        this.localMoveManager.receiveMove(the_move);
        
        if(this.socket)
        {
            this.socket.emit('game-move made', the_move);
        }
    }

    connect(server)
    {
        this.socket = io(server);
        this.socket.on('game-move', (move) => 
             this.localMoveManager.receiveMove(move));
    }

    web_connect()
    {
        return this.connect(moveServer_webserver);
    }

    local_connect()
    {
        return this.connect(moveServer_localserver);
    }
}