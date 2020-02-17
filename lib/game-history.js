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
        return this.select( this.current_pos - 1);
    }

    redo() {
        return this.select(this.current_pos + 1);
    }

    select(new_pos) {
        var ok = new_pos >= 0 && new_pos < this.history.length;

        if (ok) {
            var hist = this.history[new_pos];
            this.board.status(hist.board_status);

            this.current_pos = new_pos;
        }

        return ok;
    }

    user_data(user_data) {
        if (this.current_pos < 0) {
            throw new Error("No user data recorded");
        }

        if (user_data === undefined) {
            return this.history[this.current_pos].user_data;
        }
        else {
            this.history[this.current_pos].user_data = user_data;
        }
    }

    n_items() {
        return this.history.length;
    }

    pos() {
        return this.current_pos;
    }

    state()
    {
        return {
            history: this.history,
            current_pos: this.current_pos,
        }
    }
}