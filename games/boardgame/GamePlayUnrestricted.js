/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayUnrestricted {
    constructor(board) {
        this.board = board;
    }

    // Updates board squares.
    // Returns true if the next player should have the next move
    move(player, square) {
        if(square.status().is_empty())
        {
            square.player(player);;
            return true;
        }
         
        return false;
    }

    display_status(player) {
        $("#status").html(status_span("Player " + player, player));
    }
}