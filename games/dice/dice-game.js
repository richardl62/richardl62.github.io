"use strict";

var dice_set = new diceSet(document.querySelector("#dice")); 

var score_pads = new scorePads(document.querySelector("#score-pads")); 

function changeNumOfDice()
{
    var num_dice = $("#num-dice").val();
    dice_set.n_dice(num_dice);
}

function changeNumOfPlayers()
{
    var num_player = $("#num-players").val();
    score_pads.n_players(num_player);   
}


$("#restart").click(() => {
    dice_set.initialise_all();
    score_pads.resetScores()
});

$("#shuffle-players").click(() => {
    score_pads.shuffle_player_names();
});


//score_pads.n_players(4);

$("#roll-all").click(() => dice_set.roll_all());
$("#roll-unheld").click(() => dice_set.roll_unheld());

var options_shown;
function show_options(show)
{
    options_shown = show;
    $("#options-button").toggleClass("pressed-button", show);
    $("#options-menu").toggle(show);
}

$("#options-button").click(() => show_options(!options_shown));

$("#num-dice").change(changeNumOfDice);
$("#num-players").change(changeNumOfPlayers); 

show_options(false);

changeNumOfDice(); // kludge ?
changeNumOfPlayers(); // kludge ?