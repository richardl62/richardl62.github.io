"use strict";

// Members of startup_options should be commented out when this file is pushed.
const startup_options = {
     manual_filling: true,
     show_options_div: true,
     dont_catch_load_errors: true,
};

const in_play_column_limit = 3;
const max_move_options = 6;
const n_dice = 4;
const default_num_players = 2;
const cant_stop_extra_checks = true; // For now, at least

// Cant stop play numbers start at 0, but player colors start at 1.
function get_cantstop_player_color(player_number) {
    return get_default_player_color(player_number + 1);
}

if (startup_options.dont_catch_load_errors) {
    // Make board visible before setup as seeing a partial contructed board might 
    // help with debugging
    $_checked('#main').css('visibility', 'initial');
    cantstop_setup();
    $_checked('#loading').css('display', 'none');
} else {
    // Alert users about uncaught errors. (At the function does not return true, the default
    // error handler will be invoked, and so details of the error will be written to the 
    // console.) 
    window.onerror = () => {
        alert("INTERNAL ERROR: See console log for details");
    };

    try {
        // Make board visible after setup to avoid 'messy' display if there is an error
        cantstop_setup();
        $_checked('#main').css('visibility', 'initial');
    } catch (error) {
        console.log('Load error:', error);
        $_checked('#load-error').css('display', 'initial');
        $_checked('#load-error-description').text(error.stack);
    }
    $_checked('#loading').css('display', 'none');
}

function cantstop_setup() {
    /*
     * Get and sanity-check the jQuery elements that are used in this file.
     */
    const jq = { // For use only in this file
        // Should be in alphabetical order
        automatic_filling: $_checked("#automatic-filling"),
        board: $_checked("#board"),
        bust: $_checked("#bust"),
        commit: $_checked("#commit"),
        debug_input: $_checked("#debug-input"),
        dice: $_checked(".csdice"),
        disconnect: $_checked("#disconnect"),
        move_options: $_checked(".move-option"), // Expect 6 matches
        dont: $_checked("#dont"),
        game: $_checked("#game"),
        game_id: $_checked("#game-id"),
        game_over: $_checked("#game-over"),
        leave: $_checked("#leave"),
        loading: $_checked("#loading"),
        manual_filling: $_checked("#manual-filling"),
        more_button: $_checked("#more-button"),
        more_div: $_checked("#more-div"),
        move_option_div: $_checked("#move-options-div"),
        networking_info: $_checked("#networking-info"),
        num_players: $_checked("#num-players"),
        pass: $_checked("#pass"),
        player_name: $_checked("#player-name"),
        required_roll: $_checked("#required-roll"),
        refresh_connection: $_checked("#refresh-connection"),
        restart: $_checked("#restart"),
        roll: $_checked("#roll"),
        status_message: $_checked("#status-message"),
        undo: $_checked("#undo"),
    };

    const url_params = new URLSearchParams(window.location.search);

    assert(jq.move_options.length == max_move_options);
    assert(jq.dice.length == n_dice);

    function disable_roll_and_dont_buttons(disable) {
        jq.roll.prop("disabled", disable);
        jq.dont.prop("disabled", disable);
    }

    function set_css_player_color(color) {
        jq.game.get(0).style.setProperty("--player-color", color);
    }

    function set_displayed_player_name(player_number) {
        const recorded_name = control.get_player_name(player_number);
        const display_name = recorded_name ? recorded_name :
            "Player " + (player_number + 1);

        jq.player_name.val(display_name);
    }
    function make_dice_array() {
        let arr = new Array(n_dice);

        for (let i = 0; i < n_dice; i++) {
            arr[i] = new dice(jq.dice.get(i));
            arr[i].roll(false /* don't spin */);
        }

        return arr;
    }

    let dice_array = make_dice_array();

    const display_stage_elements = [jq.bust, jq.game_over, jq.required_roll, jq.move_option_div];
    let game_display = new class {
        constructor() {
            this.game_id(null);
        }
        // Make exactly one of the game-stage elements visible
        stage(input_stage) {
            //console.log("input stage:", input_stage)
            // Restore default
            display_stage_elements.forEach(elem => elem.addClass(visibility_hidden_class));

            jq.pass.prop("disable", false);
            jq.leave.prop("disable", false);

            // Make changes to reflect the input stage                       
            let make_visible = elem => elem.removeClass(visibility_hidden_class);
            if (input_stage == "roll") {
                make_visible(jq.move_option_div);
                
                for (let d of dice_array) {
                    d.spin();
                }
            } else if (input_stage == "move_options") {
                make_visible(jq.move_option_div);
            } else if (input_stage == "required_roll") {
                make_visible(jq.required_roll);
            } else if (input_stage == "bust") {
                make_visible(jq.bust);
            } else if (input_stage == "game_over") {
                make_visible(jq.game_over);

                set_css_player_color("var(--games-board-non-player-color)");
                jq.pass.prop("disable", true);
                jq.leave.prop("disable", true);
            } else {
                throw Error(`Unrecognised display stage: ${input_stage}`);
            } 
        }

        game_id(id, connected = true) {
            assert(id !== undefined);
            jq.networking_info.toggleClass(display_none_class, id === null);

            jq.disconnect.toggleClass(display_none_class, !connected);

            jq.game_id.text(id);
            jq.game_id.toggleClass("game-disconneted", !connected);
        }

        move_options(move_options) {
            //console.log("move options to display:", move_options);

            function option_string(opt) {
                assert(opt.length == 1 || opt.length == 2);
                let str = "" + opt[0];
                if (opt.length == 2)
                    str += " & " + opt[1];

                return str;
            }

            for (let n = 0; n < max_move_options; ++n) {
                let str = " "; // NOTE: Non-empty because, rather annoyingly, an
                               // an empty string is ignored to jQuery text().
                if (n < move_options.length)
                    str = option_string(move_options[n]);

                $(jq.move_options[n]).text(str);
            }

            this.selected_move(null);

            if (control.automatic_filling && !control.manual_filling) {
                disable_roll_and_dont_buttons(true);
            }
        }

        selected_move(index /*integer or null */) {
            assert(index !== undefined);
            jq.move_options.removeClass("selected-move");
            if (index !== null) {
                $(jq.move_options[index]).addClass("selected-move");
            }

            disable_roll_and_dont_buttons(false);
        }

        current_player(player_number) {
            set_css_player_color(get_cantstop_player_color(player_number));

            set_displayed_player_name(player_number);
        }

        automatic_filling(on) {
            jq.automatic_filling.prop('checked', on);
        }

        manual_filling(on) {
            jq.manual_filling.prop('checked', on);
        }

        // An alert which may or may not need an action.
        player_name_changed(player_number) {
            if (player_number == control.current_player) {
                set_displayed_player_name(player_number);
            }
        }

        num_players(num) {
            jq.num_players.val(num);
        }

        status_message(text) {
            jq.status_message.text(text);
        }
    }();

    let control = new CantStopControl(new CantStopBoard(jq.board), dice_array,
        game_display);

    control.set_num_players(default_num_players);

    function toggle_display_options_div(display /*optional*/) {
        if (display === undefined) {
            // Display if currently not displayed.
            display = jq.more_div.hasClass(display_none_class);
        }

        jq.more_div.toggleClass(display_none_class, !display);
        jq.more_button.toggleClass("in-out-button-pressed", display);
    }

    jq.more_button.click(function (elem) {
        toggle_display_options_div();
    });

    jq.required_roll.click(function (elem) {
        control.roll();
    });

    jq.roll.click(function (elem) {
        control.roll();
    });

    jq.move_options.click(function (elem) {
        let move_index = jq.move_options.index(this);
        control.select_move_option(move_index);
    });

    jq.dont.click(function (elem) {
        control.finished_rolling();
    });

    jq.bust.click(function (elem) {
        control.pass(); // kludge?? Reuse pass()
    });

    jq.pass.click(function (elem) {
        control.pass();
    });

    jq.restart.click(function (elem) {
        control.restart();
    });

    jq.num_players.change(function (elem) {
        control.set_num_players(parseInt(this.value));
    });

    jq.leave.click(function () {
        control.remove_player(control.current_player);
    });

    jq.player_name.change(function (elem) {
        const name_to_record = this.value.trim();
        control.set_player_name(control.current_player, name_to_record);
    });

    jq.player_name.focusin(function (elem) {
        // Clear any default name
        const recorded_name = control.get_player_name(control.current_player);
        if (!recorded_name) {
            jq.player_name.val("");
        }
    });

    jq.player_name.focusout(function (elem) {
        const recorded_name = control.get_player_name(control.current_player);
        if (!recorded_name) {
            // Re-apply any default name. This is done mainly because it many have been
            // removed by focusin.
            // The method is a kludge.
            set_displayed_player_name(control.current_player);
        }
    });

    jq.undo.click(function (elem) {
        control.undo();
    });

    jq.commit.click(function (elem) {
        control.commit();
    });

    jq.manual_filling.change(function (elem) {
        const manual_filling_on = $(this).prop('checked');

        control.manual_filling = manual_filling_on;
    });

    jq.automatic_filling.change(function (elem) {
        control.automatic_filling = $(this).prop('checked');
    });

    jq.disconnect.click(function (elem) {
        control.disconnect();
    });

    jq.refresh_connection.click(function (elem) {
        control.refresh_connection();
    });

    // The reason (such as it is)for not doing the 'control.on' stuff entirely
    // in 'control' is to allow for future error handing, logging etc.
    control.onPlayerSquareClick(
        info => control.process_player_square_click(info)
    );

    control.onInPlayColumnClick(
        column => control.in_play_column_clicked(column)
    );

    control.automatic_filling = true;
    control.manual_filling = startup_options.manual_filling;
    toggle_display_options_div(startup_options.show_options_div);

    // Do last so that any state that is set during startup is avialable to
    // record on the server.
    if (url_params.has('id')) {
        let online_support = new OnlineGameSupport(url_params);
        control.join_game(online_support);
    } 
}
