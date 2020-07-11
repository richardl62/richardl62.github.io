"use strict";

var game_controller = new DicegameControl(
    document.querySelector("#dice"),
    document.querySelector("#score-pads")
);

function setNumOfDice() {
    var num_dice = $("#num-dice").val();
    game_controller.n_dice(num_dice);
}

function setNumOfPlayers() {
    var num_players = $("#num-players").val();
    game_controller.n_player(num_players);
}

var options_shown;
function show_options(show) {
    options_shown = show;
    $("#options-button").toggleClass("pressed-button", show);
    $("#options-menu").toggle(show);
}
show_options(false);

setNumOfDice(); // kludge ?
setNumOfPlayers(); // kludge ?

$("#restart").click(() => {
    game_controller.restart()
});

$("#shuffle-players").click(() => {
    game_controller.shuffle_player_names();
});

$("#roll-all").click(() => {
    game_controller.roll_all();
});

$("#roll-unheld").click(() => {
    game_controller.roll_unheld();
});


$("#options-button").click(() => show_options(!options_shown));

$("#num-dice").change(setNumOfDice);
$("#num-players").change(setNumOfPlayers);


