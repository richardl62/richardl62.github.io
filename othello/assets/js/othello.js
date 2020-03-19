"use strict;"

var status = $("#status");
var board = new BasicGameBoard($("#board"));
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
    ["Cornerless", "[8,8,[[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2]]]"],
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



function option_elem(name)
{
    return "<option>" + name + "</option>";
}

const custom_setup_string = "Setup";
const custom_play_string = "Play";
const default_mode_string = "Options ...";

var mode_html = option_elem(default_mode_string);

mode_html += '<optgroup label="New Game">';
for(var i = 0; i < starting_positions_json.length; i++) {
    mode_html += option_elem(starting_positions_json[i][0]);
    }
mode_html += "</optgroup>";

mode_html += '<optgroup label="Custom">';
mode_html += option_elem(custom_setup_string);
mode_html += option_elem(custom_play_string);
mode_html += "</optgroup>";

$("#mode").html(mode_html);

//KLUDGE? Get the name of the first listed mode
set_mode(starting_positions_json[0][0]);


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
            this.error_string = "Square in use";
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
                this.error_string = "Nothing captured";
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

    var error_box = $("#error-box");
    if(game_move.errorString())
    {
        error_box.text(game_move.errorString());
        error_box.css("display", "block");
    }
    else
    {
        error_box.css("display", "none");
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

board.clickBoardSquare(on_click_play);


function set_mode(mode_name)
{
    var play_mode_elems = $(".play-mode");
    var setup_mode_elems = $(".setup-mode");

    if(mode_name === custom_setup_string)
    {
        play_mode_elems.css("display", "none");
        setup_mode_elems.css("display", "block");
        board.clickBoardSquare(on_click_setup);
    }
    else
    {
        play_mode_elems.css("display", "block");
        setup_mode_elems.css("display", "none");
        board.clickBoardSquare(on_click_play);

        // KLUDGE:  Don't change the board state when going to 'custom play'.
        // Intended for use after 'custom setup' but can be used at any time.
        if (mode_name != custom_play_string) 
        {
            var board_status = named_board_status(mode_name)
            board.status(board_status);
        }

        game_history.clear();
        current_player = 1;
        game_history.record(current_player);

        display_game_state();
    }
}

$("#mode").change(function(){
    var mode_name = $("#mode").find("option:selected").text();
    if(mode_name != default_mode_string)
    {
        set_mode(mode_name);
    }

    // Return to the default
    $('#mode option').prop('selected', function() {
        return this.defaultSelected;
    });
});

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

$("#pass").click(function(){
    current_player = other_player(current_player);
    display_game_state();
});


$("#json").click(function(){
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
    //var w = $(window).width();
    //var f = $("#status").css("font-size");
    //console.log("body width", w, "font size", f, "ratio", parseInt(f)/w);
    
    // Ensure the squares in the board are actually square.
    board.resize();

    // Resize the status line to match the board size.
    // (It will overflow if the board is too small, but that is OK.)
    var bw = board.outerWidth();
    $(".auto-resize").width(bw);
}

$( window ).resize(do_resize);
do_resize();
