"use strict";
const manual_mode_on_by_default = false;
const suppress_load_error_handling = false;

/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
const jq = { 
    // Should be in alphabetical order
    automatic_filling: $_checked("#automatic-filling"),
    board: $_checked("#board"),
    bust: $_checked("#bust"),
    commit: $_checked("#commit"),
    dice: $_checked(".csdice"),
    dice_options: $_checked(".dice-option"),
    dont: $_checked("#dont"),
    game: $_checked("#game"),
    game_over: $_checked("#game-over"),
    leave: $_checked("#leave"),
    loading: $_checked("#loading"),
    load_error: $_checked("#load-error"),
    load_error_description: $_checked("#load-error-description"),
    main: $_checked("#main"),
    manual_filling: $_checked("#manual-filling"), 
    move_options: $_checked("#move-options"),
    num_players: $_checked("#num-players"),
    options_button: $_checked("#options-button"),
    options_div: $_checked("#options-div"),
    pass: $_checked("#pass"),
    player_name: $_checked("#player-name"),
    required_roll: $_checked("#required-roll"),
    restart: $_checked("#restart"),
    roll: $_checked("#roll"),
    undo: $_checked("#undo"),
}

const in_play_column_limit = 3;

function automatic_filling() {
    return jq.automatic_filling.prop("checked");
}

function manual_filling() {
    return jq.manual_filling.prop("checked");
}

// Cant stop play numbers start at 0, but player colors start at 1.
function get_cantstop_player_color(player_number) {
    return get_default_player_color(player_number+1);
}

function cantstop_setup() {

    let control = new_CantStopControl();

    function start_game() {
        const n_players = parseInt(jq.num_players.val());
        assert(!isNaN(n_players));
        control.start_game(n_players);
    }
    start_game();

    let option_div_display = new CssDisplay(jq.options_div);
    option_div_display.none(true);

    jq.options_button.click(function (elem) {
        option_div_display.toggle();

        const div_hidden = option_div_display.none();
        $(this).toggleClass("in-out-button-pressed", !div_hidden);
    });

    jq.required_roll.click(function (elem) {
        control.roll();
    });

    jq.roll.click(function (elem) {
        control.roll();
    });

    jq.dice_options.click(function (elem) {
        let move_index = jq.dice_options.index(this);
        control.select_move_option(move_index);
    });

    jq.dont.click(function (elem) {
        control.commit();
        control.next_player();
    });

    jq.bust.click(function (elem) {
        control.undo();
        control.next_player();
    });

    jq.pass.click(function (elem) {
        control.undo();
        control.next_player();
    });

    jq.restart.click(function (elem) {
        start_game();
    });

    jq.num_players.change(function (elem) {
        start_game(); // start_game picked up the changed number of players
    });

    jq.leave.click(function () {
        control.remove_player(control.current_player);
        control.next_player();
    });

    jq.player_name.change(function (elem) {
        control.name_change(control.current_player, this.value);
    });
    jq.undo.click(function (elem) {
        control.undo();
    });

    jq.commit.click(function (elem) {
        control.commit();
    });

    jq.manual_filling.change(function (elem) {
        control.manual_filling_set($(this).prop('checked'));
    });


    if (manual_mode_on_by_default) {
        jq.manual_filling.prop("checked", true);
        control.manual_filling_set(true);
        option_div_display.none(false);
    }
}

// Run the setup function with optional error handling
if (suppress_load_error_handling) {
    // Visibility fixed to help show errors
    jq.main.css('visibility', 'initial');
    cantstop_setup();
} else {
    try {
        // Visibility second to help hide errors
        cantstop_setup();
        jq.main.css('visibility', 'initial');
    } catch (error) {
        console.log('Load error:', error);
        jq.load_error.css('display', 'initial');
        jq.load_error_description.text(error.stack);
    }
}
jq.loading.css('display', 'none');
