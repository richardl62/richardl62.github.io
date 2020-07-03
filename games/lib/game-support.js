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

// A GameMove records (as name-value pairs) two sorts of data:
// State:   Accumulated in the game controllr and the server.
// Action:  Not accumulated (except locally in this class).
//
// When a move that contains history is passed to GameClient.move()
// a new undo/redo point is created.
class GameMove {
    constructor() {
        Object.seal(this);
    }
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
class GameSupport {

    constructor() {
        this._serverConnection = new GameServerConnection;
        this._onHitosryChange = null;
        this._historyFilter = null;
        
        Object.seal(this);
    }

    // Attempt to connect the server at the given url.
    // Return a promise that is forefilled when/if the connection is 
    // established.
    connect(url) { }

    // Send a move to the server, if connected.
    // Also trigger the onMove() callback if set
    move(gameMove) { assert(gameMove instanceof GameMove); }

    // Return the accumulated state
    get state() { assert(false);}


    // Control which, if any, parts of the accumuated state are recorded
    // in history. The legitimate values are:
    // null:  No history is recorded (the default)
    // true:  All of the state is recorded.
    // Array: The names of the history elements to be recorded
    set historyFilter(filter) {}

    // Report whether there is a history change availabe to undo/redo.
    get undoAvailable() { return false;}
    get redoAvailable() { return false;}

    // Undo/redo a history change. Do nothing if there is no suitable
    // history change available.
    undo() { assert(false);}
    redo() { assert(false);}

    // Set a callback that is triggered by an undo/redo. It is called as
    //   callback(state)
    //
    // Where 'state' is the accumulated state after the undo/redo.
    set onHitosryChange(callback) {_this.onHitosryChange = callback; }

    // Recieve messages from the server. (See GameServerConnection.onMessage)
    set onServerMessage(callback) {
        this._serverConnection.onMessage(callback);
    }
}
