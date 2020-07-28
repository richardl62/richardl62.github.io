"use strict";

// Members of startup_options should be commented out when this file is pushed.
const startup_options = {
    // manual_filling: true,
    // show_options_div: true,
    // catch_load_errors: true,
};

const in_play_column_limit = 3;
const max_move_options = 6;
const n_dice = 4;

// Cant stop play numbers start at 0, but player colors start at 1.
function get_cantstop_player_color(player_number) {
    return get_default_player_color(player_number + 1);
};

(function () {
    /*
     * Get and sanity-check the jQuery elements that are used in this file.
     */
    const jq = { // For use only in this file
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
    };

    // Run the setup function with optional error handling
    if (startup_options.catch_load_errors) {
        // Visibility fixed to help show errors
        jq.main.css('visibility', 'initial');
        do_cantstop_setup(jq);
    } else {
        try {
            // Visibility second to help hide errors
            do_cantstop_setup(jq);
            jq.main.css('visibility', 'initial');
        } catch (error) {
            console.log('Load error:', error);
            jq.load_error.css('display', 'initial');
            jq.load_error_description.text(error.stack);
        }
    }
    jq.loading.css('display', 'none');


    async function do_cantstop_setup(jq) {
        const url_params = new URLSearchParams(window.location.search);

        let online_support = new OnlineGameSupport;
        if (url_params.has('id')) {
            await online_support.joinGame(url_params);
        }

        assert(jq.dice_options.length == max_move_options);
        assert(jq.dice.length == n_dice);

        function disable_roll_and_dont_buttons(disable) {
            jq.roll.prop("disabled", disable);
            jq.dont.prop("disabled", disable);
        }

        function set_css_player_color(color) {
            jq.game.get(0).style.setProperty("--player-color", color);
        }

        function set_displayed_player_name(player_number) {
            const recorded_name = control.player_name(player_number);
            const display_name = recorded_name ? recorded_name :
                "Player " + (player_number + 1);

            jq.player_name.val(display_name);
        }


        let game_display = new class {

            // Make exactly one of the game-stage elements visible
            stage(current_stage) {

                const stage_map = {
                    bust: jq.bust,
                    game_over: jq.game_over,
                    required_roll: jq.required_roll,
                    move_options: jq.move_options,
                }
                assert(stage_map[current_stage]);

                for (let s in stage_map) {
                    let elem = stage_map[s];
                    let visible = current_stage == s;

                    elem.toggleClass(visibility_hidden_class, !visible);
                }

                // Disable some elements at the end of a game
                const end_of_game = current_stage == "game_over";
                jq.pass.prop("disable", end_of_game);
                jq.leave.prop("disable", end_of_game);

                if (end_of_game) {
                    set_css_player_color("var(--games-board-non-player-color)");
                }
            }

            move_options(move_options) {
                function option_string(opt) {
                    assert(opt.length == 1 || opt.length == 2);
                    let str = "" + opt[0];
                    if (opt.length == 2)
                        str += " & " + opt[1];

                    return str;
                }

                for (let n = 0; n < max_move_options; ++n) {
                    let str = "";
                    if (n < move_options.length)
                        str = option_string(move_options[n]);

                    $(jq.dice_options[n]).text(str);
                }

                this.selected_move(null);

                if (control.automatic_filling && !control.manual_filling) {
                    disable_roll_and_dont_buttons(true);

                    if (move_options.length == 1) {
                        control.select_move_option(0);
                    }
                }
            }

            selected_move(index /*integer or null */) {
                assert(index !== undefined);
                jq.dice_options.removeClass("selected-move");
                if (index !== null) {
                    $(jq.dice_options[index]).addClass("selected-move");
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
                if(player_number == control.current_player) {
                    set_displayed_player_name(player_number);
                }
            }
        }

        function make_dice_array() {
            let arr = new Array(n_dice);

            for (let i = 0; i < n_dice; i++) {
                arr[i] = new dice(jq.dice.get(i));
                arr[i].roll(false /* don't spin */);
            }

            return arr;
        }

        if (url_params.has('id')) {
            await online_support.joinGame(url_params);
        }
        let control = new CantStopControl(new CantStopBoard(jq.board), make_dice_array(),
            game_display, online_support);

        function start_game() {
            const n_players = parseInt(jq.num_players.val());
            assert(!isNaN(n_players));
            control.start_game(n_players);
        }
        start_game();

        function toggle_display_options_div(display /*optional*/) {
            if (display === undefined) {
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
            const name_to_record = this.value.trim();
            control.name_change(control.current_player, name_to_record);
        });
        
        jq.player_name.focusin(function (elem) {
            // Clear any default name
            const recorded_name = control.player_name(control.current_player);
            if(!recorded_name) {
                jq.player_name.val("");
            }
        });

        jq.player_name.focusout(function (elem) {
            // Re-apply any default name
            const recorded_name = control.player_name(control.current_player);
            if(!recorded_name) {
                set_displayed_player_name(control.current_player); // Kludge?
            }
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

        jq.automatic_filling.change(function (elem) {
            control.automatic_filling_set($(this).prop('checked'));
        });

        control.automatic_filling_set(true);
        control.manual_filling_set(startup_options.manual_filling);
        toggle_display_options_div(startup_options.show_options_div);
    }
})()
