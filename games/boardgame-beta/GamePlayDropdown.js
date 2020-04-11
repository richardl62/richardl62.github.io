/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayDropdown {
    constructor(board) {
        this.board = board;
    }

    static mode()
    {
        return "dropdown";
    }

    static initial_statuses_json()
    {
        return [
            ["expermental", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-2,1,2,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
            ["8x8", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
         ]
    };

    // Updates board squares.
    // Returns true if the next player should have the next move
    move(player, square) {
        var col = square.getCol();
        var clicked_row = square.getCol();
        for(var row = this.board.rows() -1; row >= 0; --row)
        {
            var sq = this.board.getSquare(row, col);
            if(sq.status().is_empty())
            {
                sq.player(player);
                return true;
            }
        }
         
        return false;
    }

    display_status(player) {
        $("#status").html(status_span("Player " + player, player));
    }
}