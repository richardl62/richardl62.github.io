'use strict';

// Manage the connection with the server.
// Has no knowledge about game play.
class GameServerConnection {
    constructor() {
        Object.seal(this);
    }

    // Attempt to connect to the server at the give url.
    // Return a promise that is forefilled when/if the connection is 
    // established.
    connect(url) { }

    // Disconnect from the server;
    disconnect() { }

    get connected() { }


    // Callback this is triggered when the server issues a message,
    // e.g. about an error.  For now: 
    // - The message is a string which is passed to the callback. 
    // - Only one callback is allowed. 
    // Passing a null callback cancels any previous callback.
    onMessage(callback) { }
}

// A GameMove records (as name-value pairs) three sorts of data:
// State:   Accumulated in the game client and the server.
// History: A subset of state that is affected by undo. 
// Action:  Not accumulated outside of this class.
//
// When a move that contains history is passed to GameClient.move()
// a new undo/redo point is created.
class GameMove {
    constructor() {
        Object.seal(this);
    }

    // See header comment.
    addHistory(obj) { }

    // See header comment.
    addState(obj) { }

    // See header comment.
    addAction(obj) { }

    // Return the state that is changed for this move. I.e.
    // the accumulated state set by addHistory() and addState()
    get state() { }

    // Return the accumulated actions. 
    get actions() { }

    // Return a timestamp for the move. (Used to help support undo.)
    get timestamp() { }
}

`
Wrapper around a connection to a server with facilities to support game play. 
(The idea is that individual games interact with this class won't need to know
about the connection.)

Also provide  utility functions for:
- Undo (see note below)
- A record of accumlated state.

Undo: Only moves made on the current client can be undone. After an undo
      is received from the server, only moves it made prior to that can be
      undone. 
`
class NewGameController {

    constructor() {
        this._serverConnection = new GameServerConnection;
        this._onMove = null;

        Object.seal(this);
    }

    // Attempt to connect to the local or networked server.
    // Return a promise that is forefilled when/if the connection is 
    // established.
    connect(local) { assert(false); }

    // Send a move to the server, if connected.
    // Also trigger the onMove() callback if set
    move(gameMove) { assert(gameMove instanceof GameMove); }

    // Return the accumulated state
    get state() { assert(false);}

    // Report whether there is a recorded move availabe to undo.
    get undoAvailable() { return false;}

    // Undo the last recorded move. Do nothing if recorded move 
    // available.
    undo() { assert(false);}

    // Set a callback to be triggered when a move is made, or set to 
    // null to disable callbacks. A callback is called like
    //
    //      callback(gameMove);
    // 
    // See also onUndo.
    set onMove(callback) { _this.onMove = callback;}

    // Similar to onMove, but triggered by an undo. The GameMove records
    // the accumulated history at immedidately after the undo (so it could include
    // data that has not been changed. )
    set onUndo(callback) {_this.onUndo = callback; }

    // Recieve messages from the server. (See GameServerConnection.onMessage)
    set onServerMessage(callback) {
        this._serverConnection.onMessage(callback);
    }
}
