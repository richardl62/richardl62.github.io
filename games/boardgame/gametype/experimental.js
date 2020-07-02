/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayExperimental {
    constructor(board) {
        this.board = board;
        this.recently_turned_square = undefined;
    }

    // Updates board squares.
    // Returns true if the next player should have the next move
    move(player, square) {
        function other_player(player) {
            return player == 1 ? 2 : 1;
        }
        const recently_turned = square == this.recently_turned_square;
        this.recently_turned_square = undefined;

        var change_player = false;

        if (square.status().is_empty()) {
            square.player(player);
            change_player = true;
        }
        else if (square.is_disabled()) {
            square.make_empty();
        }
        else if(recently_turned)
        {
            square.disable();
        }
        else {
            square.next_player();
            this.recently_turned_square = square;
        }
         
        return change_player;
    }
}