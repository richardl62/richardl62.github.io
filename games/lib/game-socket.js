'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";
const default_connection_timeout = 10000; //ms

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
        function get_option(name, default_val) {
            let res;
            if(options instanceof URLSearchParams)
            {
                res = options.get(name);
            } else {
                res = options.get(name);
            }

            if(!res)
                res = default_val;

            //console.log(`${name}: ${res}\n`);
            
            return res;
        }
        const local_server = get_option('local-server');
        const timeout = get_option('timeout', default_connection_timeout);
        const state = get_option('state');
        const game_id = parseInt(get_option('game-id'));

        this.disconnect();

        let socket = io(local_server ?
            gameServer_localserver : gameServer_webserver 
            );

        let p = new promiseWithTimeout(timeout, (resolve) => {
            assert(!state || typeof state == "object");
            socket.emit('join-group', game_id, state,
                server_response => resolve(server_response))
        });

        return p.then(data => {
            // Propogate any error returned by the server.
            if (data.server_error) {
                throw Error("Server reported: " + data.server_error);
            }
            assert(data.player_id);
            assert(data.group_state);

            this.mergeState(data.group_state);

            this.m_socket = socket;
            this.setListeners();

            this.m_player_id = data.player_id;

            return data;
        }).catch(err => {
            socket.disconnect();
            throw err; // Repropogate the error
        });
    }

    setListeners() {
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
