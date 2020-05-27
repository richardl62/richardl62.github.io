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
            this.socket.emit('state-change sent', the_state);
        }
    }

    move(the_move) {
        this.gameManager.receiveMove(the_move);
        
        if(this.socket)
        {
            this.socket.emit('game-move sent', the_move);
        }
    }

    chat_message(message) {
        this.gameManager.receiveChat(false, message);

        if(this.socket)
        {
            this.socket.emit('chat sent', message);
        }
    }

    connect(server, timeout)
    {
        this.disconnect();
        
        let socket = io(server);

        socket.on('game-move', (move) => 
             this.gameManager.receiveMove(move));

        socket.on('state-change', (move) => 
             this.gameManager.receiveState(move));

        socket.on('chat', (message) => 
             this.gameManager.receiveChat(true,message));

        return new Promise((resolve, reject) => {
            socket.emit('am i connected', () => {
                this.socket = socket;
                resolve();
            })

            let timeout_action = () =>
            {
                reject(new Error("connect timed out"));
                if(!this.socket)
                {
                    socket.disconnect();
                }
            }
            setTimeout(timeout_action, timeout);
        });

    }

    disconnect()
    {
        if(this.socket)
        {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}