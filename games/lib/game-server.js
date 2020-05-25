'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";
class gameServer {

    constructor(gameManager) {
        this.gameManager = gameManager;
        this.socket = null;
    }

    state(the_state) {
        this.gameManager.receiveState(the_state);
        
        if(this.socket)
        {
            this.socket.emit('state-change made', the_state);
        }
    }

    move(the_move) {
        this.gameManager.receiveMove(the_move);
        
        if(this.socket)
        {
            this.socket.emit('game-move made', the_move);
        }
    }


    connect(server)
    {
        this.socket = io(server);

        this.socket.on('game-move', (move) => 
             this.gameManager.receiveMove(move));

        this.socket.on('state-change', (move) => 
             this.gameManager.receiveState(move));
    }

    web_connect()
    {
        return this.connect(gameServer_webserver);
    }

    local_connect()
    {
        return this.connect(gameServer_localserver);
    }
}