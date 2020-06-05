'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";

function throw_server_error(data) {
    if(data.server_error) {
        throw Error(ata.server_error)
    }
}

class gameSocket {

    /* gameManger requires the following member functions
        action(player_id, transient, state);
            - player_id is null for actions that do not come from the server.
        
        joinedGroup(player_id); // Another player joined the group
        leftGroup(player_id);  // Another player left the group
    */
    constructor(gameManager) {
        assert(typeof gameManager.receiveState == "function");
        assert(typeof gameManager.receiveTranscient == "function");
        assert(typeof gameManager.playerJoined == "function");
        assert(typeof gameManager.playerLeft == "function");

        this.gameManager = gameManager;
        this.socket = null;
    }

    /*
     * Takes {
     *     // Compulsory
     *     server: <name of server>
     *     timeout: <timeout in millseconds>
     *
     *     //  Optional
     *     group_id: <number>
     *     state: <object with state to be recorded with group>
     * }
     *
     * Return a promise which when/if resolved has {
     *         player_id: <number>
     *         group_id: <number> 
     *         group_state: <object with current state for the group>
     *     }
     *
     * If the promise is rejected an error object is returned (if that is the
     * right word).
     */
    connect(options) {
        this.disconnect();

        let socket = io(options.server);

        socket.on('state', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            let state = data.state;
            assert(player_id && state);
            
            this.gameManager.receiveState(player_id, state);
        })

        socket.on('transcient', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            let transcient = data.transcient;
            assert(player_id && transcient);
            
            this.gameManager.receiveTranscient(player_id, transcient);
        })

        socket.on('player joined', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            assert(player_id);
            this.gameManager.playerJoined(player_id);
        });

        socket.on('player left', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            assert(player_id);
            this.gameManager.playerLeft(player_id);
        });

        let p = new promiseWithTimeout(options.timeout, (resolve) => {
            assert(!options.state || typeof options.state == "object");
            socket.emit('join-group', options.group_id, options.state,
                rserver_response => resolve(rserver_response))
        });

        return p.then(data => {
            // Propogate any error returned by the server.
            if (data.server_error) {
                throw Error("Server reported: " + data.server_error);
            }

            this.socket = socket;
            return data;
        }).catch(err => {
            socket.disconnect();
            throw err; // Repropogate the error
        });
    }


    sendState(state) {
        this.gameManager.receiveState(null, state);

        if (this.socket) {
            this.socket.emit('state',state);
        }
    }

    sendTranscient(data) {
        this.gameManager.receiveTranscient(null, data);

        if (this.socket) {
            this.socket.emit('transcient', data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    connected() {
        return Boolean(this.socket);
    }
}
