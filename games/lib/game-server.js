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

    connect(options)
    {

        this.disconnect();
        
        let socket = io(options.server);

        socket.on('game-move', (move) => 
             this.gameManager.receiveMove(move));

        socket.on('state-change', (move) => 
             this.gameManager.receiveState(move));

        socket.on('chat', (message) => 
             this.gameManager.receiveChat(true,message));

        let p = new promiseWithTimeout(options.timeout, (resolve, reject) => {
            const channel = options.group_id ? 'join-group' : 'create-group';
            socket.emit(channel, options, (data) => {
                console.log("Channel " + channel + " returned " + data);
                resolve(data)
            });
        });

        return p.then(data => {

            // The server reports an error by returning an Error object
            if (data.server_error) {
                throw Error("Server reported: " + data.server_error); // Repropogate the error
            }
            
            this.socket = socket;
            return data;
        }).catch(err => {
            socket.disconnect();
            throw err; // Repropogate the error
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

    connected()
    {
        return Boolean(this.socket);
    }
}
