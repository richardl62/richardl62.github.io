"use strict";
class GameControl {
    constructor()
    {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(board);
        this.game_options = new GameOptions;
        
        this.game_play = undefined; // set later

        this.reset();
    }

    game_index(index)
    {
        this.game_options.game_index(index);
        this.reset();
    }

    initial_status_index(index)
    {
        this.game_options.initial_status_index(index);
        this.reset();
    }

    game_names() {return this.game_options.game_names();}
    initial_status_names() {return this.game_options.initial_status_names();}

    reset()
    {
        this.game_play = this.game_options.new_game_play();
        const init_stat = this.game_options.initial_status();
        console.log(init_stat);
        this.board.status(init_stat);
    }

    clickBoardSquare() {
        this.board.clickBoardSquare();
    }

    fixedWidthSquares(opt)
    {
        return this.board.fixedWidthSquares(opt);
    }
}

var game_control = new GameControl;

$("#game-type").html(inner_html_for_select(
    game_control.game_names()
));

// kludge: Copied below
$("#game-option").html(inner_html_for_select(
    game_control.initial_status_names()
));


$("#game-type").change(function(param) {
    game_control.game_index(this.selectedIndex);
    
    // kludge: Copied above
    $("#game-option").html(inner_html_for_select(
        game_control.initial_status_names()
    ));
});

$("#game-option").change(function(param) {
    console.log("game-option");
    game_control.initial_status_index(this.selectedIndex);
});

function set_error_string(str)
{
    $("#error-box").text(str);
    $("#error-box").css("display","block");
}

function clear_error_string()
{
    $("#error-box").css("display","none");
}

function setup_for_customising()
{
    clear_error_string();

    $(".play-mode").css("display", "none");
    $(".setup-mode").css("display", "block");
    board.clickBoardSquare(on_click_setup);
}

function setup_for_game_play()
{
    clear_error_string();

    $(".play-mode").css("display", "block");
    $(".setup-mode").css("display", "none");
    board.clickBoardSquare(on_click_play);

    game_history.clear();
    current_player = 1;
    game_history.record(current_player);

    
    display_game_state();
}

function game_option_inner_html(starting_positions_json)
{
    var html = "";
    starting_positions_json.forEach(
        spj => html += option_elem(spj[0]) 
    );

    $("#game-option").html(html);
}

// function setup_for_specific_game(mode_index)
// {
    
//     var game_play_mode = game_play_modes[mode_index];

//     game_play = new game_play_mode(board);


//     // Kludge?  Hard coded to pick the first starting position
//     const starting_pos = game_play.starting_positions_json()[0][1];
//     board.status(JSON.parse(starting_pos));

//     setup_for_game_play();
// }

// // kludge? Default to the first game
// setup_for_specific_game(0);

var current_player = 1;
function other_player (player) {
    return (player%2)+1;
}


// function option_elem(name) {
//     return "<option>" + name + "</option>";
// }

// function game_type_inner_html()
// {
//     var html = "";
//     game_play_modes.forEach(
//         gpm => html += option_elem(gpm.mode()) 
//     );

//     return html;
// }




// For use during play rather than customisation
function display_game_state() {

    game_play.display_status(current_player);

    const history_pos = game_history.pos();
    const history_items = game_history.n_items();

    $("#undo").prop("disabled", history_pos == 0);
    $("#redo").prop("disabled", history_pos + 1 >= history_items);
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

    // Loose any old errror string
    clear_error_string();
    
    if(game_play.move(current_player, square))
    {
        current_player = other_player(current_player);
        game_history.record(current_player); 
    }

    display_game_state(); 
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

game_control.clickBoardSquare(on_click_play);


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


function set_fixed_width_options()
{
    var fixed_width = game_control.fixedWidthSquares();
    if(fixed_width)
    {
        $("body").css("width", "auto");
        $("#scale-to-fit").css({
            border: "outset",
            // color: "black"
        });
    }
    else
    {
        $("body").css("width", "100%");
        $("#scale-to-fit").css({
            border: "inset",
            // color: "red"
        });
    }
}
set_fixed_width_options();

$("#scale-to-fit").click(function()
{
    game_control.fixedWidthSquares(!game_control.fixedWidthSquares());
    set_fixed_width_options();

});

