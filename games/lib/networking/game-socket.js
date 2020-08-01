class GameSocket {

    /* gameManger requires the following member functions
        state(state);
        joinedGroup(player_id); // Another player joined the group
        leftGroup(player_id);  // Another player left the group
    */
    constructor(callbacks) {
        this.reset();
        
        Object.seal(this);
    }

    reset() {
        this._onStateReceive = null;
        this._onPlayerJoin = null;
        this._onPlayerleave = null;
        this._onDisconnect = null;

        this._socket = null;
        this._player_id = null;
        this._game_id = null;
    }

    set onStateReceive(callback) {this._onStateReceive = callback;}
    set onPlayerJoin(callback) {this._onPlayerJoin = callback;}
    set onPlayerLeave(callback) {this._onPlayerleave = callback;}
    set onDisconnect(callback) {this._onDisconnect = callback;}

    connect(url) {
        this.disconnect();

        this._socket = io(url);

        this.setGameListeners();
    }

    // Set listener used for game play, rather than timeout, errors etc.
    setGameListeners() {
        this._socket.on('state', data => {
            //console.log("State received", data.server_info);
            throw_server_error(data.server_info);

            assert(data.server_info.player_id);

            // this.mergeState(data.state);

            if(this._onStateReceive) {
                this._onStateReceive(data.state, data.server_info);
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

        this._socket.on('disconnect', () => {
            this.disconnect();
        });
    }

    /*
     * Return a promise which when/if resolved has {
     *         player_id: <number>
     *         game_id: <string> // Typically, records a number.
     *         state: <object with current state for the group, or null>
     *     }
     *
     * If the promise is rejected an error object is returned (if that is the
     * right word).
     */
    joinGame(id,state) {
        assert(this._socket);
        let socket = this._socket;

        const timeout = default_connection_timeout; // For Now

        let p = new promiseWithTimeout(timeout, (client_resolve, client_reject) => {
            socket.on('connect', server_response => {
                this._game_id = id;
                console.log("socket connected: game id=",this._game_id);

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

            assert(typeof data.state == "number" || typeof data.state == "object");
            assert(typeof data.player_id == "number");
            assert(typeof data.game_id == "string");

            this._player_id = data.player_id;

            this._socket = socket;
            this.setGameListeners();



            return data;
        }).catch(err => {
            console.log("Error caught in GameSocket.joinGame",err);
            throw err; // Repropogate the error
        });
    }

    state(state_) {
        // this.mergeState(state);
        // this._gameManager.receiveData(null, state, info);

        if (this._socket) {
            this._socket.emit('state', state_);
        }
    }

    disconnect() {
        if (this.connected) {
            console.log("game-socket disconnecting: game id", this._game_id);
            if(this._onDisconnect) {
                this._onDisconnect();
            } 

            this._socket.disconnect();
            
            this.reset();
        }
    }

    get connected() {
        return Boolean(this._socket);
    }

    get joined() {
        return this.playerId !== null;
    }

    get playerId() {
        assert(this._player_id === null || typeof this._player_id == "number");
        return this._player_id;
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
