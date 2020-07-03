"use strict";


const jq = { // Get the jQuery elements that are used in this file.
    clear: $("#clear"),
    customise_button: $("#customise-button"),
    customise_menu: $("#customise-menu"),
    game_option: $("#game-option"),
    game_type: $("#game-type"),
    num_cols:  $("#num-cols"),
    num_players: $("#num-players"),
    num_rows:  $("#num-rows"),
    pass: $("#pass"),
    redo: $("#redo"),
    restart: $("#restart"),
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

var game_control = new OnlineGameControl();
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

