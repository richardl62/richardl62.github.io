"use strict";

var dice_set = new diceSet(document.querySelector("#dice")); 
var score_pads = new scorePads(document.querySelector("#score-pads")); 

class scoreCallback {
    score_selected(player_no) {
        console.log("Score selected for player", player_no);
        assert(!isNaN(player_no));
        score_pads.score_expected(player_no);
    }

    score_entered(player_no) {
        const num_players = score_pads.n_players();
        this.score_selected((player_no+1)%num_players);
    }
}

score_pads.set_score_callback(new scoreCallback);

function setNumOfDice()
{
    var num_dice = $("#num-dice").val();
    dice_set.n_dice(num_dice);
}

function setNumOfPlayers()
{
    var num_players = $("#num-players").val();
    score_pads.n_players(num_players);
    score_pads.score_expected(0);      
}

$("#restart").click(() => {
    dice_set.initialise_all();
    score_pads.resetScores()
    score_pads.score_expected(0);   
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

$("#num-dice").change(setNumOfDice);
$("#num-players").change(setNumOfPlayers); 

show_options(false);

setNumOfDice(); // kludge ?
setNumOfPlayers(); // kludge ?
