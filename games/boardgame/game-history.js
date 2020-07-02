"use strict";

/*
GameHistory:  Record the history of a game and give undo/redo facilities
*/
class GameHistory {
    constructor(board) {
        this.board = board;

        this.clear();
    }

    clear() {
        this.history = new Array;
        this.current_pos = -1; // This element of history that is currently active,
                               // or -1 until first element is recorded.
    }

    record(
        data // Intended for things not recorded in the board, e.g. whose turns it is.
    ) {
        this.current_pos++;
        
        if (this.history.length > this.current_pos) {
            // The current position is not the end of the undo/redo sequence,
            // i.e. there have been some undos without redos.
            // Truncate the history.
            this.history = this.history.slice(0, this.current_pos)
        }

        this.history.push({
            board_status: this.board.status(),
            user_data: data,
        });
    }

    undo() {
        return this.select( this.current_pos - 1, true);
    }

    redo() {
        return this.select(this.current_pos + 1, true);
    }

    undo_available() {
        return this.select( this.current_pos - 1, false);
    }

    redo_available() {
        return this.select(this.current_pos + 1, false);
    }

    restart() {
        return this.select(0, true);
    }

    select(new_pos, make_change) {
        if(make_change === undefined)
            throw Error("make_change is undefined");

        var ok = new_pos >= 0 && new_pos < this.history.length;


        if (ok && make_change) {
            var hist = this.history[new_pos];
            this.board.status(hist.board_status);

            this.current_pos = new_pos;
        }

        return ok;
    }

    user_data() {
        return this.history[this.current_pos].user_data;
    }

    state()
    {
        return {
            history: this.history,
            current_pos: this.current_pos,
        }
    }
}