/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/

const starting_positions_json = [
    ["Standard", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
    ["7x7", "[7,7,[[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,1,2,1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1]]]"],
    ["6x6", "[6,6,[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,1,2,-1,-1],[-1,-1,2,1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1]]]"],
    ["5x5", "[5,5,[[-1,-1,-1,-1,-1],[-1,2,1,2,-1],[-1,1,2,1,-1],[-1,2,1,2,-1],[-1,-1,-1,-1,-1]]]"],
    ["Cornerless", "[8,8,[[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2]]]"],
];

class GameMove {
    constructor(square, player) {
        this.square = square;
        this.player = player;
        this.redo();
    }
    redo() {
        this.captured_squares = [];
        this.error_string = undefined;
        if (this.square.player()) {
            this.error_string = "Square in use";
        }
        else {
            for (var c_step = -1; c_step <= 1; ++c_step) {
                for (var r_step = -1; r_step <= 1; ++r_step) {
                    var captures = get_captures(this.square, c_step, r_step);
                    this.captured_squares.push(...captures);
                }
            }
            if (this.captured_squares.length == 0) {
                this.error_string = "Nothing captured";
            }
            else {
                for (var i = 0; i < this.captured_squares.length; ++i) {
                    this.captured_squares[i].player(this.player);
                }
                this.square.player(this.player);
            }
        }
    }
    errorString() {
        return this.error_string;
    }
}

function get_captures(square, r_step, c_step)
{
    var row = square.row;
    var col = square.col;

    var captures = [];


    for(;;)
    {
        col += c_step;
        row += r_step;
        
        var sq = board.getSquare(row, col);
        if(!sq || !sq.player())
        {
            return [];
        }
        else if (sq.player() == current_player) // Using current_player is a kludge
        {
            return captures;
        }   
        else
        {
            captures.push(sq);
        }
    } 
}

function display_game_state()
{
    var p1_score = $("#player1-score");
    var p2_score = $("#player2-score");

    function score_css(elem, player_number)
    {
        const underline = player_number == current_player;
        elem.css({
            textDecoration: underline ? "underline" : "none",
        });
    }
    score_css(p1_score, 1);
    score_css(p2_score, 2);

    var s1 = 0;
    var s2 = 0;

    for(var row = 0; row < board.n_rows; ++row)
    {
        for (var col = 0; col < board.n_cols; ++col) {
            var sq = board.getSquare(row, col);
            if (sq.player() == 1)
                ++s1;

            if (sq.player() == 2)
                ++s2;
        } 
    }

    p1_score.text(s1.toString());
    p2_score.text(s2.toString());

    const history_pos = game_history.pos();
    const history_items = game_history.n_items();

    $("#undo").prop("disabled", history_pos == 0);
    $("#redo").prop("disabled", history_pos + 1>= history_items);
}