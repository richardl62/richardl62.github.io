"use strict";

var dice_set = new diceSet(document.querySelector("#dice")); 

var score_pads = new scorePads(document.querySelector("#score-pads")); 
//score_pads.n_players(4);

$("#roll-all").click(() => dice_set.roll_all());
$("#roll-unheld").click(() => dice_set.roll_unheld());


function restart()
{
    for (var pos = 0; pos < dice_set.n_dice(); ++pos) 
    {
        var die = dice_set.die(pos);
        die.roll();
        die.hold(false);
    }
}

function reset()
{
    var num_dice = $("#num-dice").val();
    var num_player = $("#num-players").val();
    dice_set.n_dice(num_dice);
    score_pads.n_players(num_player);

     restart();   
}
$("#restart").click(() => score_pads.reset());


var options_shown;
function show_options(show)
{
    options_shown = show;
    $("#options-button").toggleClass("pressed-button", show);
    $("#options-menu").toggle(show);
}

$("#options-button").click(() => show_options(!options_shown));

$("#num-dice").change(reset);
$("#num-players").change(reset); 

show_options(false);
reset();
