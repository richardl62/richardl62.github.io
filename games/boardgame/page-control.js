"use strict";

function player_color_css(player)
{
    return "var(--game-board-player-colours-" + player + ")";
}


const jq = { // Get the jQuery elements that are used in this file.
    clear: $("#clear"),
    customise_button: $("#customise-button"),
    customise_menu: $("#customise-menu"),
    experimental: $("#experimental"),
    game_options: $("#game-option"),
    game_types: $("#game-type"),
    json: $("#json"),
    num_cols:  $("#num-cols"),
    num_players: $("#num-players"),
    num_rows:  $("#num-rows"),
    pass: $("#pass"),
    redo: $("#redo"),
    restart: $("#restart"),
    full_width: $("#full-width"),
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

class PageDisplay
{
    constructor(game_control)
    {
        this.game_control = game_control;

        this.set_game_types();
        this.set_game_options();

        //kludge? Might be better doing this in css file.
        jq.player1_score.css("color", player_color_css(1));
        jq.player2_score.css("color", player_color_css(2));

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
        let show_score = false;

        if(this.customise_mode()) {
            jq.status_message.text("Customising");
            jq.status_message.css("color", "inherit");
        }
        else {
	        const status = this.game_control.get_game_status();
            const player = this.game_control.current_player;


            if (status === undefined) {
                jq.status_message.text("Player " + player); // default
                jq.status_message.css("color", player_color_css(player));
            }
            else if (typeof status === 'string') {
                jq.status_message.text(status);
 
            }
            else {
                show_score = true;

                jq.status_message.text("Score: ");
  
                var [s1, s2] = status;
                jq.player1_score.text(s1);
                jq.player2_score.text(s2);

                jq.player1_score.toggleClass("highlighted-score", player == 1);
                jq.player2_score.toggleClass("highlighted-score", player == 2);
            }

            jq.status_message.css("color", player_color_css(player));
        }
        make_hidden(jq.scores, !show_score);
    }

    customise_mode(custom)
    {
        if (custom !== undefined) {
            game_control.customise_mode(custom);

            jq.customise_button.toggleClass("button-pressed", custom);

            // Kludge: Hard code that custom menu has type flex.
            jq.customise_menu.css('display', custom ? "flex" : 'none');
            jq.experimental.css('display', custom ? "flex" : 'none');
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
    var name = this.options[this.selectedIndex].value;
    game_control.game_name(name);

    page_display.set_game_options();
    page_display.update();
});

jq.game_options.change(function() {
    var name = this.options[this.selectedIndex].value;
    game_control.game_option_name(name);

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


jq.num_players.change(()=>{
    var n_rows = parseInt(jq.num_players.val())
    game_control.num_players(n_rows);
});

jq.json.click(function(){
    var json = cjson_stringify(game_control.board_status());
    var new_window = window.open("", "");
    new_window.document.write("<p>" + json + "</p>");
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
