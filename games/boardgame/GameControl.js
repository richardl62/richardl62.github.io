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

        var game_control = this;
        
        this.board.clickBoardSquare(function(square){game_control.game_move(square)});
        
        this.reset();
    }

    reset()
    {
        this.game_play = this.game_options.new_game_play(this.board);
        const init_stat = this.game_options.initial_status();
        this.board.status(init_stat);

        this.current_player = 1;
        this.n_players = 2;

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

    initial_status_index(index)
    {
        this.game_options.initial_status_index(index);
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
    initial_status_names() {return this.game_options.initial_status_names();}

    undo()
    {
        this.game_history.undo();
        this.current_player = this.game_history.user_data();
    }

    redo()
    {
        this.game_history.redo();
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
        if(square.status().is_disabled())
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
}
