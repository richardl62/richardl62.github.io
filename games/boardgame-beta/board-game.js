"use strict";

function player_color_css(player)
{
    return "var(--game-board-player-colours-" + player + ")";
}

function status_span(text,
    player,  // Player number - determines color
    underline // Optional - text is underlined if true
) {
    var sp = '<span style="' + player_color_css(player) + ';';

    if (underline)
        sp += ';text-decoration:underline';

    return sp + '">' + text + '</span>';
}

class PageDisplay
{
    constructor(game_control)
    {
        this.game_control = game_control;

        this.undo_button = $("#undo");
        this.redo_button = $("#redo");
        this.status_elem = $("#status");
        this.customise_button = $("#customise-button");
        this.customise_menu = $("#customise-menu");
        this.game_types = $("#game-type");
        this.game_options = $("#game-option");
        
        this.set_game_types();
        this.set_game_options();

        this.update();
    }

    update() {
        this.undo_button.prop('disabled',
            !this.game_control.undo_available()
        );

        this.redo_button.prop('disabled',
            !this.game_control.redo_available()
        );

        this.update_status_message(this.game_control.get_game_status());
    }

    update_status_message(status) {
        const player = this.game_control.current_player;

        if (status === undefined) {
            this.status_elem.html("Player " + player); // default
            this.status_elem.css("color", player_color_css(player));
        }
        else if (typeof status === 'string') {
            this.status_elem.html(status);
            this.status_elem.css("color", player_color_css(player));
        }
        else {
            var [s1, s2] = status;

            var html = status_span(s1, 1, player == 1)
                + "-"
                + status_span(s2, 2, player == 2);
                
            this.status_elem.html(html);
        }
    }

    customise_mode(custom)
    {
        this.customise_button.toggleClass("button_pressed", custom);
        this.customise_menu.css('display', custom ? 'block' : 'none');
    }

    set_game_types() {
        this.game_types.html(inner_html_for_select(
            game_control.game_names()
        ));
    }
    
    set_game_options()
    {
        this.game_options.html(inner_html_for_select(
            game_control.game_option_names()
        ));
    }
}

var game_control = new GameControl();
var page_display = new PageDisplay(game_control);

game_control.move_callback(function(){
    page_display.update();
});

page_display.game_types.change(function() {
    game_control.game_index(this.selectedIndex);
    page_display.set_game_options();
});

page_display.game_options.change(function() {
    game_control.game_option_index(this.selectedIndex);
});

$("#restart").click(() => {
    game_control.restart();
    page_display.update();
});

$("#undo").click(() => {
    game_control.undo();
    page_display.update();
});

$("#redo").click(() => {
    game_control.redo();
    page_display.update();
});

$("#customise-button").click(() => {
    var custom = !game_control.customise_mode();
    game_control.customise_mode(custom);
    page_display.customise_mode(custom);
});

$("#clear").click(()=>game_control.clear());

$("#num-rows").change(()=>{
    var n_rows = parseInt($("#num-rows").val())
    game_control.rows(n_rows);
});

$("#num-cols").change(()=>{
    var n_cols = parseInt($("#num-cols").val())
    game_control.cols(n_cols);
});

$("#json").click(function(){
    var json = JSON.stringify(game_control.board_status());
    var new_window = window.open("", "");
    new_window.document.write("<p>" + json + "</p>");
});

// To do: Consider tidying the scale to fit code
function set_fixed_width_options()
{
    var fixed_width = game_control.fixed_width_squares();
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
    game_control.fixed_width_squares(!game_control.fixed_width_squares()); //toggle
    set_fixed_width_options();

});
