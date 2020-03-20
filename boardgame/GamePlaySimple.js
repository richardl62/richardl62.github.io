/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlaySimple {
    constructor(board) {
        this.board = board;
    }

    static mode()
    {
        return "simple";
    }

    static starting_positions_json()
    {
        return [
            ["8x8", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
        ]
    };

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

    get_error_string()
    {
        return undefined;
    }

    display_status() {
        var p1_score = $("#player1-score");
        var p2_score = $("#player2-score");

        function score_css(elem, player_number) {
            const underline = player_number == current_player;
            elem.css({
                textDecoration: underline ? "underline" : "none",
            });
        }
        score_css(p1_score, 1);
        score_css(p2_score, 2);
    }
}