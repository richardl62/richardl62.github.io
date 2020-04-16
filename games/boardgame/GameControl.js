"use strict";

class GameControl {
    constructor()
    {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(this.board);

        // Default to the first listed game, and first listed
        // initial state
        this.game_type = game_types[game_names()[0]];
        this.intitial_state_name = undefined; // set in reset()
        this.game_play = undefined; // set in reset()
        this.current_player = undefined; // set in reset()
        this.n_players = 2;

        this.the_move_callback = function(){}
        this.in_customise_mode = false;
        
        this.board.clickBoardSquare(square =>
            {
            if(this.in_customise_mode)
                square_click_custome_mode(square, this.n_players);
            else
                this.game_move(square);
            });
        
        this.reset();
    }

    reset()
    {
        // Default ot the first state name
        if(this.initial_state_name === undefined) {
            this.initial_state_name = this.game_type.state_names()[0];
        }
        
        this.game_play = this.game_type.new_controller(this.board);
        const state_name = this.game_type.state(this.initial_state_name);

        this.board.status(state_name);

        this.reset_other_than_board();
    }

    reset_other_than_board() // Hmm, bad name.
    {
        this.current_player = 1;
        this.game_history.clear();
        this.game_history.record(this.current_player);
    }

    // Callback to be run after a  move.  This is intended to allow
    // the display to be updated.
    move_callback(callback)
    {
        if(callback !== undefined)
            this.the_move_callback = callback;

        return this.the_move_callback;
    }

    game_name(name)
    {
        this.game_type = game_types[name];
        this.initial_state_name = undefined;
        this.reset();
    }

    game_option_name(name)
    {
        this.initial_state_name = name;
        this.reset();
    }
    
    num_players(num)
    {
        if(num !== undefined)
        {
            this.n_players = num;
        }

        return this.n_players;
    }
    
    next_player()
    {
        this.current_player = next_player(this.current_player, this.n_players);
    }

    game_names() {return game_names();}
    game_option_names() {return this.game_type.state_names();}

    restart()
    {
        this.game_history.restart();
        this.current_player = this.game_history.user_data();
    }

    redo()
    {
        this.game_history.redo();
        this.current_player = this.game_history.user_data();
    }

    undo()
    {
        this.game_history.undo();
        this.current_player = this.game_history.user_data();
    }

    undo_available()
    {
        return this.game_history.undo_available();
    }

    redo_available()
    {
        return this.game_history.redo_available();
    }

    full_width(opt)
    {
        return this.board.fullWidth(opt);
    }

    game_move(square)  // For internal use
    {
        if (this.game_play.move(this.current_player, square)) {
            // Change the player before recoding this position in history
            // as we want the new player to be recorded.
            this.next_player();
            this.game_history.record(this.current_player);
        }

        this.the_move_callback();
    }


    customise_mode(on_off)
    {
        if(on_off !== undefined)
        {
            this.in_customise_mode = on_off;
            if(!this.in_customise_mode)
            {
                this.game_history.clear();
                this.game_history.record(1);
            }
        }

        return this.in_customise_mode;
    }

    rows(num)
    {
        if(num !== undefined)
        {
            this.board.reset(num, this.board.cols());
            this.reset_other_than_board();
        }
        return this.board.rows();
    }

    cols(num)
    {
        if(num !== undefined)
        {
            this.board.reset(this.board.rows(), num);
            this.reset_other_than_board();
        }
        return this.board.cols();
    }

    clear()
    {
        this.board.reset(this.board.rows(), this.board.cols()); // inefficient
        this.reset_other_than_board();  
    }

    board_status()
    {
        return this.board.status();
    }

    // Get info for the on-page status display
    get_game_status()
    {
        if(this.game_play.get_game_status)
        {
            return this.game_play.get_game_status();
        }

        return undefined;
    }
}

function square_click_custome_mode(square, n_players)
{
    var status = square.status();

    if(status.is_disabled())
    {
        status.make_empty();
    }
    else if(status.is_empty())
    {
        status.player(1);
    }
    else {
        var player = status.player() + 1;
        if(player > n_players)
            status.disable();
        else
            status.player(player);
    }

    square.status(status);
}
