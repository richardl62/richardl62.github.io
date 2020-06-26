"use strict";


const jq = { // Get the jQuery elements that are used in this file.
    clear: $("#clear"),
    customise_button: $("#customise-button"),
    customise_menu: $("#customise-menu"),
    experimental: $("#experimental"),
    export: $("#export"),
    game_option: $("#game-option"),
    game_type: $("#game-type"),
    link: $("#link"),
    num_cols:  $("#num-cols"),
    num_players: $("#num-players"),
    num_rows:  $("#num-rows"),
    pass: $("#pass"),
    redo: $("#redo"),
    restart: $("#restart"),
    full_width: $("#full-width"),
    online_status: $("#online-status"),
    scores: $("#scores"),
    status_message: $("#status-message"),
    player1_score: $("#player1-score"),
    player2_score: $("#player2-score"),
    undo: $("#undo"),
}

// Sanity check
for (const [ key, value ] of Object.entries(jq)) {
    if(value.length != 1)
    {
        throw Error(key + " matched " + value.length + " elements");
    }
}

const game_option_custom_string = "custom";

var game_control = new NetworkGameControl();
game_control.connect(window.location.search);

jq.game_type.change(function() {
    var name = this.options[this.selectedIndex].value;
    game_control.game_name(name);
});

jq.game_option.change(function() {
    var name = this.options[this.selectedIndex].value;
    game_control.game_option(name);
});

jq.restart.click(() => {
    game_control.restart();
});

jq.undo.click(() => {
    game_control.undo();
});

jq.redo.click(() => {
    game_control.redo();
});

jq.pass.click(function(){
    game_control.next_player();
});

jq.customise_button.click(() => {
    var custom = !game_control.customise_mode();
    game_control.customise_mode(custom);
});

jq.clear.click(()=>game_control.clear());


jq.num_rows.change(()=>{
    var n_rows = parseInt(jq.num_rows.val())
    game_control.rows(n_rows);
});

jq.num_cols.change(()=>{
    var n_cols = parseInt(jq.num_cols.val())
    game_control.cols(n_cols);
});

jq.num_players.change(()=>{
    var n_rows = parseInt(jq.num_players.val())
    game_control.num_players(n_rows);
});

jq.export.click(()=>{
    var stringified = stringify_array(
        game_control.board_status(),
        (elem) => elem === null ? "" : elem
        );
        
    var new_window = window.open("", "");
    new_window.document.write("<p>" + stringified + "</p>");
});

jq.link.click(() => {
    if (true) {
        alert("Making a game link is not currently working");
    } else {
        let urlParams = new URLSearchParams();
        urlParams.set("g", game_control.game_name());

        const status = game_control.board_status();
        urlParams.set("b", convert_board_status_for_url(status));

        window.open(window.location.pathname + "?" + urlParams.toString());
    }
});

// To do: Consider tidying thia full width code
function set_full_width_options()
{
    var full_width = game_control.full_width();
    $("body").css("width", full_width ? "100%" : "auto");
    jq.full_width.toggleClass("button-pressed", full_width);
}

set_full_width_options();

jq.full_width.click(function()
{
    game_control.full_width(!game_control.full_width()); //toggle
    set_full_width_options();

});

function convert_board_status_for_url(board_status) {
    let str = "";
    board_status.forEach(row => {
        // console.log(row);
        row.forEach(sq =>{
            assert(sq == null || (sq >= 0 && sq <= 9));
           str += sq === null ? "." : sq; 
        })
        str += "-";
    });

    // Remove the final "-"
    return str.slice(0, -1);
}  

function convert_row_from_url(row)
{
    let result = [];
    row.split('').forEach(c => {
        if(c == ".")
            result.push(null);
        else
        {
            const sq = parseInt(c);
            assert(!isNaN(sq), "bad character: " + c);
            result.push(sq);
        }
    });
    return result;
}

function convert_board_status_from_url(str)
{
    let result = [];
    str.split("-").forEach(row => {
        result.push(convert_row_from_url(row));
    });
 
    return result;
}