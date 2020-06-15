"use strict";

class GameControl {
    constructor(urlParams) {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(this.board);

        // Default to the first listed game, and first listed
        // initial state
        this.m_game_name = game_names()[0]; // defa
        this.m_game_type = get_game_type(this.m_game_name);
        this.intitial_state_name = undefined; // set in reset()
        this.game_play = undefined; // set in reset()
        this.m_current_player = undefined; // set in reset()
        this.n_players = 2;

        this.in_customise_mode = false;

        this.process_URL_parameters(urlParams);

        this.reset();

        this.page_display = new PageDisplay(this);
    }

    process_URL_parameters(urlParams) {
        // To do - test and fix

        // const game = urlParams.get("game");
        // const option = urlParams.get("o");
        // const board = urlParams.get("b");

        // if(game)
        // {
        //     this.game_name(game);
        // }

        // if(option)
        // {
        //     this.game_option(option);
        // }

        // if(board)
        // {
        //     this.status(convert_board_status_from_url(board));
        // }
    }

    reset() {
        // Default to the first state name
        if (this.initial_state_name === undefined) {
            this.initial_state_name = this.m_game_type.state_names()[0];
        }

        this.game_play = this.m_game_type.new_controller(this.board);
        const state_name = this.m_game_type.state(this.initial_state_name);

        this.board.status(state_name);

        this.reset_other_than_board();
    }

    reset_other_than_board() // Hmm, bad name.
    {
        this.m_current_player = 1;
        this.game_history.clear();
        this.game_history.record(this.m_current_player);

        if (this.page_display) // allow for call in constructor
            this.page_display.update();
    }

    game_name(name) {
        if (name !== undefined) {
            this.m_game_name = name;
            this.m_game_type = get_game_type(name);
            this.initial_state_name = undefined;

            // If the game has changed, there will be a new set of options
            // to display.
            this.page_display.set_game_options();

            this.reset();
        }
        return this.the_game_name;
    }

    game_option(name) {
        if (name !== undefined) {
            this.initial_state_name = name;
            this.reset();
        }
        return this.initial_state_name;
    }

    num_players(num) {
        if (num !== undefined) {
            this.n_players = num;
        }

        return this.n_players;
    }

    next_player() {
        this.m_current_player = next_player(this.m_current_player, this.n_players);
        this.page_display.update();
    }

    current_player(player) {
        if (player) {
            this.m_current_player = player;
            this.page_display.update();
        }

        return this.m_current_player;
    }

    game_names() { return game_names(); }
    game_option_names() { return this.m_game_type.state_names(); }

    restart() {
        this.game_history.restart();
        this.m_current_player = this.game_history.user_data();
        this.page_display.update();
    }

    redo() {
        this.game_history.redo();
        this.m_current_player = this.game_history.user_data();
        this.page_display.update();
    }

    undo() {
        this.game_history.undo();
        this.m_current_player = this.game_history.user_data();
        this.page_display.update();
    }

    undo_available() {
        return this.game_history.undo_available();
    }

    redo_available() {
        return this.game_history.redo_available();
    }

    full_width(opt) {
        return this.board.fullWidth(opt);
    }

    square_clicked(square) {
        if (this.in_customise_mode)
            square_click_custom_mode(square, this.n_players);
        else if (this.game_play.move(this.m_current_player, square)) {
            // Change the player before recoding this position in history
            // as we want the new player to be recorded.
            this.next_player();
            this.game_history.record(this.m_current_player);
        }
        this.page_display.update();
    }


    customise_mode(on_off) {
        if (on_off !== undefined) {
            this.in_customise_mode = on_off;

            // Check if we are leaving custom mode
            if (!this.in_customise_mode) {
                this.game_history.clear();
                this.game_history.record(1);
                this.page_display.select_custom_game_option();
            }
            this.page_display.update();
        }

        return this.in_customise_mode;
    }

    rows(num) {
        if (num !== undefined) {
            this.board.reset(num, this.board.cols());
            this.reset_other_than_board();
        }
        return this.board.rows();
    }

    cols(num) {
        if (num !== undefined) {
            this.board.reset(this.board.rows(), num);
            this.reset_other_than_board();
        }
        return this.board.cols();
    }

    clear() {
        this.board.reset(this.board.rows(), this.board.cols()); // inefficient
        this.reset_other_than_board();
    }

    board_status(status) {
        return this.board.status(status);
    }

    // Get info for the on-page status display
    get_game_status() {
        if (this.game_play.get_game_status) {
            return this.game_play.get_game_status();
        }

        return undefined;
    }
}

function square_click_custom_mode(square, n_players) {
    var status = square.status();

    if (status.is_disabled()) {
        status.make_empty();
    }
    else if (status.is_empty()) {
        status.player(1);
    }
    else {
        var player = status.player() + 1;
        if (player > n_players)
            status.disable();
        else
            status.player(player);
    }

    square.status(status);
}

function setup_board(game, board) {
    console.log(game, board);
}
