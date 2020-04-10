"use strict";

class PageDisplay
{
    constructor(game_control)
    {
        this.game_control = game_control;

        this.undo_button = $("#undo");
        this.redo_button = $("#redo");

        this.update();
    }

    update()
    {
        this.undo_button.prop('disabled', 
            !this.game_control.undo_available()
        );

        this.redo_button.prop('disabled', 
            !this.game_control.redo_available()
        );

        // TO DO:  Display any error string
    }
}

var game_control = new GameControl();
var page_display = new PageDisplay(game_control);

game_control.move_callback(function(){
    page_display.update();
});


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

$("#undo").click(() => {
    game_control.undo();
    page_display.update();
});

$("#redo").click(() => {
    game_control.redo();
    page_display.update();
});
