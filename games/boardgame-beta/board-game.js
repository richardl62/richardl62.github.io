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

const jq = { // Get the jQuery elements that are used in this file.
    undo: $("#undo"),
    redo: $("#redo"),
    pass: $("#pass"),
    status: $("#status"),
    customise_button: $("#customise-button"),
    customise_menu: $("#customise-menu"),
    clear: $("#clear"),
    num_rows:  $("#num-rows"),
    num_cols:  $("#num-cols"),
    game_types: $("#game-type"),
    game_options: $("#game-option"),
    restart: $("#restart"),
    json: $("#json"),
    scale_to_fit: $("#scale-to-fit"),
}
const game_option_custom_string = "custom";

class PageDisplay
{
    constructor(game_control)
    {
        this.game_control = game_control;

        this.set_game_types();
        this.set_game_options();

        this.update();
    }

    update() {
        const custom = this.customise_mode();

        jq.undo.prop('disabled',
            custom || !this.game_control.undo_available()
        );

        jq.redo.prop('disabled',
            custom || !this.game_control.redo_available()
        );

        jq.num_rows.val(game_control.rows());
        jq.num_cols.val(game_control.cols());

        jq.pass.prop('disabled', custom);

        this.update_status_message();
    }

    update_status_message() {

        if(this.customise_mode()) {
            jq.status.html("Customising");
            jq.status.css("color", "inherit");
        }
        else {
	    const status = this.game_control.get_game_status();
            const player = this.game_control.current_player;

            if (status === undefined) {
                jq.status.html("Player " + player); // default
                jq.status.css("color", player_color_css(player));
            }
            else if (typeof status === 'string') {
                jq.status.html(status);
                jq.status.css("color", player_color_css(player));
            }
            else {
                var [s1, s2] = status;

                var html = status_span(s1, 1, player == 1)
                    + "-"
                    + status_span(s2, 2, player == 2);

                jq.status.html(html);
            }
        }
    }

    customise_mode(custom)
    {
        if (custom !== undefined) {
            game_control.customise_mode(custom);

            jq.customise_menu.toggleClass("button_pressed", custom);
            jq.customise_menu.css('display', custom ? 'block' : 'none');
            if (!custom) {
                // To include 'custom' option
                this.set_game_options(true /*add and select 'custom' */);
            }
        }

        return game_control.customise_mode();
    }

    set_game_types() {
        jq.game_types.html(inner_html_for_select(
            game_control.game_names()
        ));
    }
    
    set_game_options(add_and_select_custom)
    {
        if(add_and_select_custom === undefined)
            add_and_select_custom = false;  // Just to be explicit

        var names = game_control.game_option_names();
        if(add_and_select_custom)
            names.push(game_option_custom_string);

        jq.game_options.html(inner_html_for_select(names));

        if(add_and_select_custom)
            jq.game_options.val(game_option_custom_string);
    }
    remove_custom_game_option()
    {
        // This implementation is a kludge.
        const val = jq.game_options.val();
        this.set_game_options();
        jq.game_options.val(val);
    }
}

var game_control = new GameControl();
var page_display = new PageDisplay(game_control);

game_control.move_callback(function(){
    page_display.update();
});

jq.game_types.change(function() {
    game_control.game_index(this.selectedIndex);
    page_display.set_game_options();
    page_display.update();
});

jq.game_options.change(function() {
    game_control.game_option_index(this.selectedIndex);

    if(!page_display.customise_mode())
    {
        page_display.remove_custom_game_option();
    }
    page_display.update();
});

jq.restart.click(() => {
    game_control.restart();
    page_display.update();
});

jq.undo.click(() => {
    game_control.undo();
    page_display.update();
});

jq.redo.click(() => {
    game_control.redo();
    page_display.update();
});

jq.pass.click(function(){
    game_control.next_player();
    page_display.update();
});

jq.customise_button.click(() => {
    var custom = !game_control.customise_mode();
    page_display.customise_mode(custom);
    page_display.update();
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

jq.json.click(function(){
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
        jq.scale_to_fit.css({
            border: "outset",
            // color: "black"
        });
    }
    else
    {
        $("body").css("width", "100%");
        jq.scale_to_fit.css({
            border: "inset",
            // color: "red"
        });
    }
}
set_fixed_width_options();

jq.scale_to_fit.click(function()
{
    game_control.fixed_width_squares(!game_control.fixed_width_squares()); //toggle
    set_fixed_width_options();

});
