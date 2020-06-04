'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com/";

class gameSocket {

    /* gameManger requires the following member functions
        action(player_id, transient, state);
            - player_id is null for actions that do not come from the server.
        
        joinedGroup(player_id); // Another player joined the group
        leftGroup(player_id);  // Another player left the group
    */
    constructor(gameManager) {
        assert(typeof gameManager.action == "function");
        assert(typeof gameManager.joinedGroup == "function");
        assert(typeof gameManager.leftGroup == "function");

        this.gameManager = gameManager;
        this.socket = null;
    }

    action(transient, state) {
        this.gameManager.action(null, transient, state);

        if (this.socket) {
            console.log('Sending action to server:', transient, state)
            this.socket.emit('action', transient, state);
        }
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

        socket.on('action', (player_id, transient, state) => {
            console.log("Recieved action from server:", transient, state);
            this.gameManager.action(player_id, transient, state);
        });
        socket.on('joined group', player_id =>
            this.gameManager.joinedGroup(player_id)
        );

        socket.on('left group', player_id =>
            this.gameManager.leftGroup(player_id)
        );

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
