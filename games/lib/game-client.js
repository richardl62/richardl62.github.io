'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com";
const default_connection_timeout = 10000; //ms

function get_game_server(local) {
    return local ? gameServer_localserver : gameServer_webserver;
}

// Send/fetch data to/from the server.
// KLUDGE? Always uses a POST request.
function game_server_fetch(path, local, data) {
    assert(typeof path == "string");
    assert(typeof local == "boolean");

    const url = get_game_server(local) + '/' + path;

    const fetch_options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    return fetch(url, fetch_options)
        .then(response => {
            if (response.status != 200) {
                let error_message = "Connection to server failed";
                if (response.statusText) {
                    error_message = `Server response "${response.statusText}"`
                }

                throw new Error(error_message);
            }
            return response.json()
        })
        .then(data => {
            // data.error is set if there is a 'legitimate' error,
            // i.e. a user error rather than a code error.
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        })
        .catch(err => {
            //console.log("Fetch failed:", err);
            throw err; // repropogate
        });
}

function throw_server_error(data) {
    if (data && data.server_error) {
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
        assert(typeof gameManager.receiveData == "function");
        assert(typeof gameManager.playerJoined == "function");
        assert(typeof gameManager.playerLeft == "function");

        this.m_gameManager = gameManager;
        this.m_socket = null;
        this.m_state = new Object;
        this.m_player_id = null;
    }

    /*
     * Takes {
     *     // Compulsory
     *     server: <name of server>
     *     timeout: <timeout in millseconds>
     *
     *     //  Optional
     *     group_id: <strimg>
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
    connect(url) {
        this.disconnect();
        
        this.m_socket = io(url);

        this.setGameListeners();
    }

    // Set listener used for game play, rather than timeout, errors etc.
    setGameListeners() {
        this.m_socket.on('data', data => {
            throw_server_error(data.state);
            throw_server_error(data.info);

            let player_id = data.player_id;
            assert(player_id)

            this.mergeState(data.state);

            this.m_gameManager.receiveData(data.player_id, data.state,
                data.info);
        })

        this.m_socket.on('player joined', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            assert(player_id);
            this.m_gameManager.playerJoined(player_id);
        });

        this.m_socket.on('player left', data => {
            throw_server_error(data);

            let player_id = data.player_id;
            assert(player_id);
            this.m_gameManager.playerLeft(player_id);
        });
    }

    joinGame(id) {
        assert(this.m_socket);
        let socket = this.m_socket;
   
        const timeout = default_connection_timeout; // For Now

        let p = new promiseWithTimeout(timeout, (client_resolve, client_reject) => {
            socket.on('connect', server_response => {
                console.log("socket connected");

                socket.emit('join-game', id,
                    server_response => {
                        console.log("join-game server response:", server_response);
                        if (server_response.server_error) {
                            client_reject(server_response.server_error)
                        } else {
                            client_resolve(server_response);
                        }
                    });
            })
        });

        return p.then(data => {
            // Propogate any error returned by the server.
            if (data.server_error) {
                console.log("Error from ", server, data.server_error)
                throw Error("Server reported: " + data.server_error);
            }
            assert(data.player_id);
            assert(data.state);

            this.mergeState(data.state);

            this.m_socket = socket;
            this.setGameListeners();

            this.m_player_id = data.player_id;

            return data;
        }).catch(err => {
            socket.disconnect();
            throw err; // Repropogate the error
        });
    }

    sendData(state, info) {
        this.mergeState(state);
        this.m_gameManager.receiveData(null, state, info);

        if (this.m_socket) {
            this.m_socket.emit('data', state, info);
        }
    }

    disconnect() {
        if (this.m_socket) {
            this.m_socket.disconnect();
            this.m_socket = null;
            this.m_player_id = null;
        }
    }

    connected() {
        return Boolean(this.m_socket);
    }

    state() {
        return this.m_state;
    }

    mergeState(state) {
        Object.assign(this.m_state, state);
    }

    playerId() {
        return this.m_player_id;
    }
    /* 
     * Fuctions for getting and setting player names
     * For now at least these piggy-back on general state
     */
    nametag(player_id) {
        return `player${player_id}-name`;
    }

    setPlayerName(player_id, name) {
        let state = new Object;
        state[this.nametag(player_id)] = name;

        this.sendData(state);
    }

    getPlayerName(player_id) {
        let name = this.state()[this.nametag(player_id)];
        return name ? name : "Player " + player_id;
    }
}
