'use strict';





`
GameSupport provides facilities to support to web based board games.
In summary, it provides support:
- Support for online play
- Undo/Redo (see note below) 
- A record of accumlated state.


Undo: Only moves made on the current client can be undone. After an undo
      is received from the server, only moves it made prior to that can be
      undone. 

To do: Add more notes
`
class OnlineGameSupport {

    constructor() {
        this._game_socket = new GameSocket();
        Object.seal(this);
    }

    set onReceiveState(callback) {
        this._game_socket.onAction = callback;
    }

    // Attempt to connect to a server and then join a game as specified in the
    // url parameters.
    // Return a promise that is forefilled when/if the game is joined
    joinGame(url_params) {
        const server_url = get_game_server(url_params.has('local'));
        
        const game_id = url_params.get('id');
        
        assert(game_id !== undefined);
        
        this._game_socket.connect(server_url);
        return this._game_socket.joinGame(game_id);
    }

    // Send an action to the server, if connected.
    sendState(state) {
        this._game_socket.action(state);
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

