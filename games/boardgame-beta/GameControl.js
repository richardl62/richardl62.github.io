"use strict";


class GameControl {
    constructor()
    {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(this.board);
        this.game_options = new GameOptions;
        
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
        this.game_play = this.game_options.new_game_play(this.board);
        const init_stat = this.game_options.initial_status();
        this.board.status(init_stat);

        this.reset_other_than_board();
    }

    reset_other_than_board() // Hmm, bad name.
    {
        this.current_player = 1;
        this.game_history.clear();
        this.game_history.record(this.current_player);
    }

    move_callback(callback)
    {
        if(callback !== undefined)
            this.the_move_callback = callback;

        return this.the_move_callback;
    }

    game_index(index)
    {
        this.game_options.game_index(index);
        this.reset();
    }

    game_option_index(index)
    {
        this.game_options.game_option_index(index);
        this.reset();
    }

    current_player(player)
    {
        if(player)
        {
            this.current_player = player;
        }

        return this.current_player;
    }

    game_names() {return this.game_options.game_names();}
    game_option_names() {return this.game_options.game_option_names();}

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

    fixed_width_squares(opt)
    {
        return this.board.fixedWidthSquares(opt);
    }

    game_move(square)  // For internal use
    {
        if (square.status().is_disabled())
            return;

        if (this.game_play.move(this.current_player, square)) {
            // Change the player before recoding this position in history
            // as we want the new player to be recorded.
            this.next_player();
            this.game_history.record(this.current_player);

        }

        this.the_move_callback();
    }

    next_player()
    {
        ++this.current_player;
        if(this.current_player > this.n_players)
        {
            this.current_player = 1;
        }
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
