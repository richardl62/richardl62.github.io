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
const max_move_options = 6;
assert(jq.dice_options.length == max_move_options);

const n_dice = 4;
assert(jq.dice.length == n_dice);

jq.automatic_filling.prop("checked", true);

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

function disable_roll_and_dont_buttons(disable)
{
    jq.roll.prop("disabled", disable);
    jq.dont.prop("disabled", disable);
}

let gameDisplay = new class {

    // Make exactly one of the game-stage elements visible
    stage(current_stage) {
 
        const stage_map = {
            bust: jq.bust,
            game_over: jq.game_over,
            required_roll: jq.required_roll,
            move_options: jq.move_options,
        }
        assert(stage_map[current_stage]);

        for(let s in stage_map) {
            let elem = stage_map[s];
            let visible = current_stage == s;

            elem.toggleClass(visibility_hidden_class, !visible);
        }

        // Disable some elements at the end of a game
        const end_of_game = current_stage = "game_over";
        jq.pass.prop("disable", end_of_game);
        jq.leave.prop("disable", end_of_game);
    }

    move_options(move_options)
    {
       function option_string(opt)
        {
           assert(opt.length == 1 || opt.length == 2);
           let str = "" + opt[0]; 
           if(opt.length == 2)
               str += " & " + opt[1];
   
           return str;
        }
   
        for(let n = 0; n < max_move_options; ++n)
        {
           let str = "";
           if(n < move_options.length)
              str = option_string(move_options[n]);
   
          $(jq.dice_options[n]).text(str);
        }

        this.selected_move(null);

        if (automatic_filling() && !manual_filling()) {
            disable_roll_and_dont_buttons(true);
 
            if (move_options.length == 1) {
                select_move_option(0);
            }
        }
    }

    selected_move(index /*integer or null */) {
        assert(index !== undefined);
        jq.dice_options.removeClass("selected-move");
        if(index !== null) {
             $(jq.dice_options[index]).addClass("selected-move");
        }

        disable_roll_and_dont_buttons(false);
    }

    current_player_name(name) {
        jq.player_name.val(name);
    }
}

function cantstop_setup() {

    let control = new_CantStopControl(new CantStopBoard(jq.board));

    function start_game() {
        const n_players = parseInt(jq.num_players.val());
        assert(!isNaN(n_players));
        control.start_game(n_players);
    }
    start_game();

    function toggle_display_options_div(display /*optional*/) {
        if(display === undefined) {
            // Display if currently not displayed.
            display = jq.options_div.hasClass(display_none_class);
        }

        jq.options_div.toggleClass(display_none_class, !display)
        jq.options_button.toggleClass("in-out-button-pressed", display);
    }

    jq.options_button.click(function (elem) {
        toggle_display_options_div();
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

    jq.manual_filling.prop("checked", manual_mode_on_by_default);
    control.manual_filling_set(manual_mode_on_by_default);
    toggle_display_options_div(manual_mode_on_by_default);
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
