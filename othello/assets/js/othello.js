"use strict;"

var preamble = $("#preamble");
var board = new GamesBoard($("#board"));
var game_history = new GameHistory(board);

var current_player = 1;
function other_player (player) {
    return (player%2)+1;
}

starting_positions_json = [
    ["Standard", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
    ["7x7", "[7,7,[[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,1,2,1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1]]]"],
    ["6x6", "[6,6,[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,1,2,-1,-1],[-1,-1,2,1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1]]]"],
    ["5x5", "[5,5,[[-1,-1,-1,-1,-1],[-1,2,1,2,-1],[-1,1,2,1,-1],[-1,2,1,2,-1],[-1,-1,-1,-1,-1]]]"],
    ["Missing corners", "[8,8,[[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2]]]"],
];

function named_board_status(name)
{
    for(i = 0; i < starting_positions_json.length; ++i)
    {
        var spj = starting_positions_json[i];
        if(spj[0] == name)
        {
            return JSON.parse(spj[1]);
        }
    }

    throw new Error("Unrecognised game state: " + name);
}

/* INITIAL SETUP */

var mode_html = "";

function option_elem(name)
{
    return "<option>" + name + "</option>";
}

for(var i = 0; i < starting_positions_json.length; i++) {
    mode_html += option_elem(starting_positions_json[i][0]);
    }

const custom_setup_string = "Custom (Setup)";
const custom_play_string = "Custom (Play)";
mode_html += option_elem(custom_setup_string);
mode_html += option_elem(custom_play_string);

$("#mode").html(mode_html);

mode_change();


/* END OF INITIAL SETUP */


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

class GameMove
{
    constructor(square, player)
    {
        this.square = square;
        this.player = player;
        this.redo();
    }
    
    redo()
    {
        this.captured_squares = [];
        this.error_string = undefined;

        if (this.square.player()) {
            this.error_string = "you must select an empty square";
        }
        else {

            for(var c_step = -1; c_step <= 1; ++c_step)
            {
                for(var r_step = -1; r_step <= 1; ++r_step)
                {
                    var captures = get_captures(this.square, c_step, r_step);
                    this.captured_squares.push(...captures);
                }
            }

            if(this.captured_squares.length == 0)
            {
                this.error_string = "you must capture at least one square";
            }
            else{
                for(var i = 0; i < this.captured_squares.length; ++i)
                {
                    this.captured_squares[i].player(this.player);
                }
                this.square.player(this.player);
            }
        }
    }
    
    errorString()
    {
        return this.error_string;
    }
}

function disable_button(button, disable)
{
    button.prop("disabled", disable);

    if(disable)
    {
        button.addClass("button-disabled");
    }
    else
    {
        button.removeClass("button-disabled");
    }
}


function display_game_state()
{
    var p1_score = $("#player1-score");
    var p2_score = $("#player2-score");

    // Setting colors here isa kludge in that they do not depend on the state
    // of the game.
    function score_css(elem, player_number)
    {
        const underline = player_number == current_player;
        elem.css({
            color: gamesBoardPlayerColor(player_number),
            textDecoration: underline ? "underline" : "none",
        });

    }
    score_css(p1_score, 1);
    score_css(p2_score, 2);

    var s1 = 0;
    var s2 = 0;
    board.for_each_square(function(sq){
        if(sq.player() == 1)
            ++s1;

        if(sq.player() == 2)
            ++s2;
    });

    p1_score.text(s1.toString());
    p2_score.text(s2.toString());

    const history_pos = game_history.pos();
    const history_items = game_history.n_items();

    disable_button($("#undo"), history_pos == 0);
    disable_button($("#redo"), history_pos + 1>= history_items);
}

function history_state_change()
{
    current_player = game_history.user_data();
    display_game_state();
}


function on_click_play(square)
{
    if(square.status().is_disabled())
        return;

    prev_status = board.status();
    prev_player = current_player;

    var game_move = new  GameMove(square, current_player)
    if(game_move.errorString())
    {
        alert(game_move.errorString());
    }
    else
    {
        current_player = other_player(current_player);
        game_history.record(current_player);
        display_game_state();
    } 
}

function on_click_setup(square)
{

    var status = square.status();
    if(status.is_empty())
    {
        status.player(1);
    }
    else if(status.player() == 1)
    {
        status.player(2);
    } 
    else if(status.player() == 2)
    {
        status.disable();
    }
    else
    {
        status.make_empty();
    }

    square.status(status);
}

board.click(on_click_play);


function mode_change()
{
    var mode_text = $("#mode").children("option:selected").text();
    //console.log(mode_text);

    var play_mode_elems = $(".play-mode");
    var setup_mode_elems = $(".setup-mode");

    if(mode_text === custom_setup_string)
    {
        play_mode_elems.css("display", "none");
        setup_mode_elems.css("display", "block");
        board.click(on_click_setup);
    }
    else
    {
        play_mode_elems.css("display", "block");
        setup_mode_elems.css("display", "none");
        board.click(on_click_play);

        // KLUDGE:  Don't change the board state when going to 'custom play'.
        // Intended for use after 'custom setup' but can be used at any time.
        if (mode_text != custom_play_string) 
        {
            var board_status = named_board_status(mode_text)
            board.status(board_status);
        }

        game_history.clear();
        current_player = 1;
        game_history.record(current_player);

        display_game_state();
    }
}

$("#mode").change(mode_change);

function undo() {
    game_history.undo();

    history_state_change();
}

function redo() {
    game_history.redo();
    
    history_state_change();
}

$("#undo").click(undo);

$("#redo").click(redo);


document.onkeydown = function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
        undo();

    if (e.keyCode == 89 && e.ctrlKey)
        redo();
};

$("#new-game").click(function(){
    game_history.select(0);

    history_state_change();
});

$("#pass").click(function(){
    current_player = other_player(current_player);
    display_game_state();
});


$("#show-json").click(function(){
    var json = JSON.stringify(board.status());
    var new_window = window.open("", "");
    new_window.document.write("<p>" + json + "</p>");
});

function reset_board()
{
    var n_rows = parseInt($("#num-rows").val());
    var n_cols = parseInt($("#num-cols").val());
    board.reset(n_rows, n_cols);
    game_history.clear();
}
$("#clear").click(reset_board);
$("#num-rows").change(reset_board);
$("#num-cols").change(reset_board);

function do_resize()
{
    // Ensure the squares in the board are actually square.
    board.resize();

    // Resize the preamble to match the board size.
    // (It will overflow if the board is too small, but that is OK.)
    var bw = board.outerWidth();
    preamble.width(bw);
}

$( window ).resize(do_resize);
do_resize();
