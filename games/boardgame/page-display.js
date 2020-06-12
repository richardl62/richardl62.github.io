class PageDisplay {
    constructor(game_control) {
        this.game_control = game_control;
        this.set_game_types();
        this.set_game_options();

        this.update();
    }

    // Set the select element with the list of games (e.g. 'dropdown' or
    // 'othello')
    set_game_types() {
        jq.game_type.html(inner_html_for_select(game_control.game_names()));
    }

    // Set the select element with the list of game options (e.g. '8x8' or
    // '7x7')
    set_game_options() {
        var names = game_control.game_option_names();
        jq.game_option.html(inner_html_for_select(names));
    }

    // Update the non-board part of game (e.g. enable or disable buttons)
    update() {
        const custom = this.game_control.customise_mode();
        jq.undo.prop('disabled', custom || !this.game_control.undo_available());
        jq.redo.prop('disabled', custom || !this.game_control.redo_available());
        jq.num_rows.val(game_control.rows());
        jq.num_cols.val(game_control.cols());
        jq.pass.prop('disabled', custom);
        this.update_status_message_INTERNAL();
        this.update_custom_elements_INTERNAL();
    }

    // update the display of scores etc.
    update_status_message_INTERNAL() {
        let show_score = false;
        if (this.game_control.customise_mode()) {
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

    update_custom_elements_INTERNAL() {
        const custom = this.game_control.customise_mode();
        jq.customise_button.toggleClass("button-pressed", custom);
        // Kludge: Hard code that custom menu has type flex.
        jq.customise_menu.css('display', custom ? "flex" : 'none');
        jq.experimental.css('display', custom ? "flex" : 'none');
        if (custom) {
            // To include 'custom' option
            this.set_game_options();
            this.add_custom_game_option();
        }
    }

    // Add and select a 'custom' game option
    add_custom_game_option() {
        // Kludge? Recreate the whole menu
        var names = game_control.game_option_names();
        names.push(game_option_custom_string);
        jq.game_option.html(inner_html_for_select(names));
        jq.game_option.val(game_option_custom_string);
    }
    game_type(name) {
        if (name !== undefined) {
            game_control.game_type(name);
            this.set_game_options();
            this.update();
            jq.game_type.val(name);
        }
        return jq.game_type.val();
    }
    game_option(name) {
        if (name !== undefined) {
            game_control.game_option_name(name);
            if (!this.game_option.customise_mode()) {
                page_display.remove_custom_game_option();
            }
            this.update();
            jq.game_option.val(name);
        }
        return jq.game_option.val();
    }
    board_status_url(status_from_url) {
        if (status_from_url === undefined) {
            return convert_board_status_for_url(game_control.board_status());
        }
        game_control.board_status(convert_board_status_from_url(status_from_url));
        this.add_custom_game_option();
    }
    remove_custom_game_option() {
        // This implementation is a kludge.
        const val = jq.game_option.val();
        this.set_game_options();
        jq.game_option.val(val);
    }
}
