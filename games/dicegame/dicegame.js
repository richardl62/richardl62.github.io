"use strict";

var game_support = new GameSupport();
var dice_set = new diceSet(document.querySelector("#dice"), game_support);
var score_pads = new scorePads(document.querySelector("#score-pads"), game_support);

class currentPlayerControl {
    //KLUDGE: Mix of callbacks and 'ordinary' functions

    constructor() {
        this.current_player = null;

        Object.seal(this);
    }

    set_current_player(player_no) {
        assert(typeof player_no == "number");

        this.current_player = player_no;

        //console.log("current player: ", player_no);

        score_pads.score_expected("all", false);
        score_pads.allow_partial_scores("all", false);

        score_pads.score_expected(player_no, true);
    }

    // Callback - but also used below (kludge?)
    score_selected(player_no) {
        if (this.current_player !== player_no) {
            this.set_current_player(player_no);
        }
    }

    // Callback
    score_entered(player_no) {
        const num_players = score_pads.n_players();

        // Re-use the callback above (kludge?)
        this.set_current_player((player_no + 1) % num_players);
    }

    // Used below
    dice_rolled() {
        assert(this.current_player !== null);

        score_pads.allow_partial_scores(this.current_player, true);
    }
}

let current_player_control = new currentPlayerControl;
score_pads.set_score_callback(current_player_control);

function setNumOfDice() {
    var num_dice = $("#num-dice").val();
    dice_set.n_dice(num_dice);
}

function setNumOfPlayers() {
    var num_players = $("#num-players").val();
    score_pads.n_players(num_players);
    current_player_control.set_current_player(0);
}

$("#restart").click(() => {
    dice_set.initialise_all();
    score_pads.resetScores()
    current_player_control.set_current_player(0);
});

$("#shuffle-players").click(() => {
    score_pads.shuffle_player_names();
});

$("#roll-all").click(() => {
    dice_set.roll_all();
    current_player_control.dice_rolled();
});

$("#roll-unheld").click(() => {
    dice_set.roll_unheld();
    current_player_control.dice_rolled();
});

var options_shown;
function show_options(show) {
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
