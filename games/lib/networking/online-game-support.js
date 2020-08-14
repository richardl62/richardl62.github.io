'use strict';
const online_games = ["dropdown", "othello", "cantstop"];

function game_display_name(game) {
    assert(game);
  
    let display_name;
  
    if (game == "cantstop") {
      display_name = "Can't Stop";
    } else {
      // Capitalise the first letter - This is the default
      display_name = game.charAt(0).toUpperCase() + game.slice(1);
    }
  
    return display_name;
  }

// Attempt to start a game of the given type, and with the ID recorded here.
// Throwing an Error if there was a problem.
async function start_online_game(id, game_type, use_local_server) {
    assert(use_local_server !== undefined);
    
    if (!online_games.includes(game_type)) {
      const display_name = game_display_name(game_type);
      throw Error `${display_name} is not available online`;
    }
  
    let sent_data = {
      game: game_type,
      id: id,
    };

    let server_data = null;
    try {
        let fetch_result = game_server_fetch('start-game', use_local_server, sent_data);
        server_data = await fetch_result;
    } catch(err) {
        throw err;
    } finally {
        console.log("server_data", server_data);
        if(server_data) {
            throw_server_error(server_data);
        }
    }
    return server_data;
}

/*
GameSupport provides facilities to support to web based board games.
In summary, it provides support:
- Support for online play
- Undo/Redo (see note below) 
- A record of accumlated state.


Undo: Only moves made on the current client can be undone. After an undo
      is received from the server, only moves it made prior to that can be
      undone. 

To do: Add more notes
*/
class OnlineGameSupport {

    // Sets up the game socket, but does not actually connect.
    constructor(urlParams) {
        this._game_socket = new GameSocket();

        this._local_server = urlParams.has('local');
        this._game_id = urlParams.get('id');
        Object.seal(this);
    }

    set onReceiveState(callback) {
        this._game_socket.onStateReceive = callback;
    }

    get onReceiveState() {
        return this._game_socket.onStateReceive;
    }

    set onDisconnect(callback) {
        this._game_socket.onDisconnect = callback;
    }

    get onDisconnect() {
        return this._game_socket.onDisconnect;
    }
    
    connect() {
        this._game_socket.connect(this._local_server);
    }

    disconnect() {
        this._game_socket.disconnect();
    }

    startGame(game_type) {  // Can throw
        return start_online_game(this._game_id, game_type,
            this._local_server);
    }
 
    // Return a promise that is forefilled when/if the game is joined.
    joinGame(state) {
        const data = this._game_socket.joinGame(this._game_id, state);
        return data;
    }

    // Send state to the server.
    sendState(data/*state and other info*/) {
        assert(this.joined);
        this._game_socket.state(data);
    }



    get connected () {
        return this._game_socket.connected;
    }

    get joined() {
        return this._game_socket.joined;
    }

    get game_id() {
        return this._game_id;
    }

}

/*
 * Off cuts
 */
// // Manage the connection with the server.
// // Has no knowledge about game play.
// class GameServerConnection {
//     constructor() {
//         Object.seal(this);
//     }

//     // Attempt to connect to the server at the give url.
//     // Return a promise that is forefilled when/if the connection is 
//     // established.
//     connect(url) { }

//     // Disconnect from the server;
//     disconnect() { }

//     get connected() { }


//     // Callback this is triggered when the server issues a message,
//     // e.g. about an error.  For now: 
//     // - The message is a string which is passed to the callback. 
//     // - Only one callback is allowed. 
//     // Passing a null callback cancels any previous callback.
//     onMessage(callback) { }
// }

// A GameAction records (as name-value pairs) two sorts of data:
// State:   Accumulated in the game controllr and the server.
// Info:  Not accumulated (except locally in this class).
//
// When a move that contains history is passed to GameClient.move()
// a new undo/redo point is created.
// class GameActionXXX {
//     constructor() {
//         Object.seal(this);
//     }
//     // See header comment.
//     addState(obj) { }

//     // See header comment.
//     addInfo(obj) { }

//     // Return the state that is changed for this move.
//     get state() { }

//     // Return the non-state information for this move. 
//     get info() { }

//     // Return a timestamp for the move. (Used to help support undo.)
//     get timestamp() { }
// }

    // Return the accumulated state
    // get state() { assert(false);}


    // // Control which, if any, parts of the accumuated state are recorded
    // // in history. The legitimate values are:
    // // null:  No history is recorded (the default)
    // // true:  All of the state is recorded.
    // // Array: The names of the history elements to be recorded
    // set historyFilter(filter) {}

    // // Report whether there is a history change availabe to undo/redo.
    // get undoAvailable() { return false;}
    // get redoAvailable() { return false;}

    // // Undo/redo a history change. Do nothing if there is no suitable
    // // history change available.
    // undo() { assert(false);}
    // redo() { assert(false);}

    // Add a callback that is triggered by an undo/redo. It is called as
    //   callback(playerID, gameAction)
    //
    // Where 'gameMove' is an instance of the GameAction class.
    // and playerID is a unique non-zero number identified for the player
    // who made the move, or null if the move was sent by the current instance
    // of the class.
    // onActionXXX(callback) {this._onAction.push(callback); }

    // // Add a callback that is triggered by an undo/redo. It is called as
    // //   callback(state)
    // //
    // // Where 'state' is the accumulated state after the undo/redo.
    // onHistoryChange(callback) {this._onHistoryChange.push(callback); }

    // // Add a callback that is triggered when a message in received from the 
    // // server. (See GameServerConnection.onMessage for more about server messages)
    // set onServerMessage(callback) {
    //     this._serverConnection.onMessage(callback);
    // }

