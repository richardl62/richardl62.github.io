'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";

class gameServer {

    constructor(gameManager) {
        this.gameManager = gameManager;
        this.socket = null;
    }

    stateChange(state) {


        this.gameManager.receiveState(state);
        
        if(this.socket)
        {
            this.socket.emit('state-change', state);
        }
    }

    move(the_move) {
        assert(typeof the_move == "object");

        this.gameManager.receiveMove(the_move);
        
        if(this.socket)
        {
            this.socket.emit('game-move', the_move);
        }
    }

    connect(options)
    {
        this.disconnect();
        
        let socket = io(options.server);

        socket.on('game-move', (socket_id, move) => 
             this.gameManager.receiveMove(socket_id, move));

        socket.on('state-change', (socket_id, move) => 
             this.gameManager.receiveState(socket_id, move));
    
        let p = new promiseWithTimeout(options.timeout, (resolve, reject) => {
            if(options.group_id) {
                assert(typeof options.group_id == "number");
                socket.emit('join-group',options.group_id, 
                    (socket_id, game_state) => resolve(socket_id, game_state))     
            } else {
                assert(typeof options.state == "object");
                socket.emit('create-group', options.state, 
                    (socket_id, game_state) => {
                        console.log("socket id: " + socket_id,
                            "group id: " + group_id);
                        resolve(socket_id, group_id)
                    })
            }
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
