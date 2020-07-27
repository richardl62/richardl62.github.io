class GameSocket {

    /* gameManger requires the following member functions
        action(player_id, transient, state);
            - player_id is null for actions that do not come from the server.
        
        joinedGroup(player_id); // Another player joined the group
        leftGroup(player_id);  // Another player left the group
    */
    constructor(callbacks) {
        this._onAction = null;
        this._onPlayerJoin = null;
        this._onPlayerleave = null;

        this._socket = null;
        // this._state = new Object;
        // this._player_id = null;
    }

    set onAction(callback) {this._onAction = callback;}
    set onPlayerJoin(callback) {this.onPlayerJoin = callback;}
    set onPlayerLeave(callback) {this.onPlayerleave = callback;}
   

    connect(url) {
        this.disconnect();

        this._socket = io(url);

        this.setGameListeners();
    }

    // Set listener used for game play, rather than timeout, errors etc.
    setGameListeners() {
        this._socket.on('action', data => {
            //console.log("Action received", data);
            throw_server_error(data);

            assert(data.player_id);

            // this.mergeState(data.state);

            if(this._onAction) {
                this._onAction(data);
            }
        });

        this._socket.on('player joined', data => {
            throw_server_error(data);
            assert(data.player_id != undefined);

            if(this._onPlayerJoin) {
                this._onPlayerJoin(data.player_id);
            }
        });

        this._socket.on('player left', data => {
            throw_server_error(data);
            assert(data.player_id != undefined);

  
            if(this._onPlayerleave) {
                this._onPlayerLeave(data.player_id);
            }
        });
    }

    /*
     * Return a promise which when/if resolved has {
     *         player_id: <number>
     *         group_id: <number>
     *         group_state: <object with current state for the group>
     *     }
     *
     * If the promise is rejected an error object is returned (if that is the
     * right word).
     */
    joinGame(id) {
        assert(this._socket);
        let socket = this._socket;

        const timeout = default_connection_timeout; // For Now

        let p = new promiseWithTimeout(timeout, (client_resolve, client_reject) => {
            socket.on('connect', server_response => {
                console.log("socket connected");

                socket.emit('join-game', id,
                    server_response => {
                        //console.log("join-game server response:", server_response);
                        if (server_response.server_error) {
                            client_reject(server_response.server_error);
                        }
                        else {
                            client_resolve(server_response);
                        }
                    });
            });
        });

        return p.then(data => {
            // Propogate any error returned by the server.
            if (data.server_error) {
                console.log("Error from ", server, data.server_error);
                throw Error("Server reported: " + data.server_error);
            }
            assert(data.player_id);
            assert(data.state);

            //this.mergeState(data.state);

            this._socket = socket;
            this.setGameListeners();

            this._player_id = data.player_id;

            return data;
        }).catch(err => {
            socket.disconnect();
            throw err; // Repropogate the error
        });
    }

    action(action_) {
        // this.mergeState(state);
        // this._gameManager.receiveData(null, state, info);

        if (this._socket) {
            this._socket.emit('action', action_);
        }
    }

    disconnect() {
        if (this._socket) {
            this._socket.disconnect();
            this._socket = null;
            // this._player_id = null;
        }
    }

    connected() {
        return Boolean(this._socket);
    }

    // state() {
    //     return this._state;
    // }

    // mergeState(state) {
    //     Object.assign(this._state, state);
    // }

    // playerId() {
    //     return this._player_id;
    // }
    // /*
    //  * Fuctions for getting and setting player names
    //  * For now at least these piggy-back on general state
    //  */
    // nametag(player_id) {
    //     return `player${player_id}-name`;
    // }

    // setPlayerName(player_id, name) {
    //     let state = new Object;
    //     state[this.nametag(player_id)] = name;

    //     this.sendData(state);
    // }

    // getPlayerName(player_id) {
    //     let name = this.state()[this.nametag(player_id)];
    //     return name ? name : "Player " + player_id;
    // }
}
