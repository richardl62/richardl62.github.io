/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayDropdown {
    constructor(board) {
        this.board = board;
    }

    // Updates board squares.
    // Returns true if the next player should have the next move
    move(player, square) {
        // NOTE: Row 0 is the top most row
        const n_rows = this.board.rows();
        const col = square.getCol();
        const empty_row = (row) => this.board.getSquare(row, col).status().is_empty();
        const select_row = (row) => this.board.getSquare(row, col).player(player);

        var row = square.getRow();
        if (empty_row(row)) {
            // Search down for the last empty row
            for (;;) {
                ++row;
                if (row == n_rows || !empty_row(row)) {
                    select_row(row-1);
                    return true;
                }
            }
        }
        else {
            // Search up for the first empty row
            for (;row >= 0; --row) {
                if(empty_row(row)) {
                    select_row(row);
                    return true;
                }
            }
        }

        return false;
    }
}
