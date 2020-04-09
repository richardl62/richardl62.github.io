"use strict";
class GameControl {
    constructor()
    {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(this.board);
        this.game_options = new GameOptions;
        
        this.game_play = undefined; // set in reset()
        this.current_player = undefined; // set in reset()

        this.reset();
    }

    reset()
    {
        this.game_play = this.game_options.new_game_play(this.board);
        const init_stat = this.game_options.initial_status();
        this.board.status(init_stat);

        this.current_player = 1;
        this.game_history.clear();
        this.history_record();
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

    history_record()
    {
        this.game_history.record(this.current_player);
    }

    // If make_change is false (but not undefined) check if an undo is possible
    // but don't actually make the change.
    undo(make_change)
    {
        this.game_history.undo(make_change);
    }

    // Analogous to undo()
    redo(make_change)
    {
        this.game_history.redo(make_change);
    }

    game_move(square, player)
    {
        this.game_play.move(square, player);
    }

    clickBoardSquare(callback) {
        this.board.clickBoardSquare(callback);
    }

    fixedWidthSquares(opt)
    {
        return this.board.fixedWidthSquares(opt);
    }
}
