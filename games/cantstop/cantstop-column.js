"use strict";
class CantStopPlayerColumn {
    constructor(square_elems, player_number, parent_column) {
        this._squares = [];

        for (let elem of square_elems) {
            this._squares.push(new CantStopPlayerSquare(elem, player_number, parent_column));
        }

        Object.seal(this);
    }

    // Free resources (i.e. html elements) allocated to the column.
    destroy() {
        for(let sq of this._squares) {
            sq.destroy();
        }
    }

    // Return column to it's starting state
    reset() {
        for(let sq of this._squares) {
            sq.reset();
        }
    }

    make_owned() {
        for(let sq of this._squares) {
            sq.make_owned();
        }
    }

    is_full() {
        for (const sq of this._squares) {
            if (sq.is_empty()) {
                return false;
            }
        }

        return true;
    }

    has_precommits() {
        for (const sq of this._squares) {
            if (sq.is_precommitted()) {
                return true;
            }
        }

        return false;
    }

    add_precommit() {
        for (const sq of this._squares) {
            if (sq.is_empty()) {
                sq.make_precommit();
                break;
            }
        }
    }

    add_provisional_precommit() {
        for (const sq of this._squares) {
            if (sq.is_empty()) {
                sq.make_provisional_precommitted();
                break;
            }
        }
    }

    promot_all_provisional_precommits() {
        for (const sq of this._squares) {
            if (sq.is_provisional_precommit()) {
                sq.make_precommit();
            }
        }
    }

    remove_all_provisional_precommits() {
        for (const sq of this._squares) {
            if (sq.is_provisional_precommit()) {
                sq.reset();
            }
        }
    }

    remove_all_precommits() {
        for (const sq of this._squares) {
            if (sq.is_precommitted()) {
                sq.reset();
            }
        }
    }

    precommits() {
        let result = new Array;
        for (let i = this._squares.length - 1; i >= 0; --i) {
            let sq = this._squares[i];

            if (sq.is_precommitted()) {
                result.push(sq);
            }
        }

        return result;
    }

    commit() {
        for (const sq of this._squares) {
            if (sq.is_precommitted())
                sq.make_commit();
        }
    }

    // For use with manual column filling.
    // Commits the first non-committed square.
    commit_noncommited_square() {
        for (const sq of this._squares) {
            assert(!sq.is_owned());
            if (!sq.is_committed()) {
                sq.make_commit();
                break;
            }
        }
    }

    // For use with manual column filling
    // Clears the final non-empty square
    clear_nonempty_square() {
        for (let ind = this._squares.length - 1; ind >= 0; --ind) {
            let sq = this._squares[ind];
            assert(!sq.is_owned());
            if (!sq.is_empty()) {
                sq.reset();
                break;
            }
        }
    }

    state(input_state) {
        const n_squares = this._squares.length;

        if (input_state === undefined) {
            let st = new Array(n_squares);
            for (let i = 0; i < n_squares; ++i) {
                st[i] = this._squares[i].state();
            }
            return st;
        } else {
            assert(input_state instanceof Array && input_state.length == n_squares);
            for (let i = 0; i < n_squares; ++i) {
                this._squares[i].state(input_state[i]);
            }
        }
    }

    onPlayerSquareClick(callback)  {
        for (let s of this._squares) {
            s.onClick(callback);
        }
    }
}

class CantStopColumn {
    constructor(options) {
        const n_squares = options.n_squares;

        this.square_elems = new Array(n_squares);
        if (n_squares > 0) {
            this.make_html_elements(options);
        }

        this.m_owned_by = null;
        this.m_in_play = false;

        this.player_columns = null; // [player-number][square] - set in num_players() 
        this.manual_control_allowed = false;

        Object.seal(this);

        this.reset_non_column_state();
    }

    reset_non_column_state() {
        this.decorate_owned_square_elems(null);
        this.m_owned_by = null;
        this.in_play(false);
    }

    make_html_elements(options) {
        let opt = (name) => {
            const val = options[name];
            assert(val !== undefined);
            return val;
        }

        /*
         * Create the elements
         */
        this.m_top_elem = $("<div class='cs-column'></div>");
        
        this.top_number = $("<div class='cs-top-number'>" + opt('column_number') + "</div>");
        this.bottom_number = $("<div class='cs-bottom-number'>" + opt('column_number') + "</div>");

        for (let i = 0; i < this.square_elems.length; ++i) {
            let elem = $('<div></div>');
            if (opt('left_side'))
                elem.addClass('cs-square-left-side');
            if (opt('right_side'))
                elem.addClass('cs-square-right-side');
            if (i == 0)
                elem.addClass('cs-square-bottom')
            this.square_elems[i] =  elem;
        }

        /*
         * Append internal elements to m_top_elem in the approrpriate order
         */
        
        this.m_top_elem.append(this.top_number);
        

        for (let i = this.square_elems.length-1; i >= 0; --i) {
            this.m_top_elem.append(this.square_elems[i]);
        }

        this.m_top_elem.append(this.bottom_number);

    }

    top_elem() { // Is this used?
        return this.m_top_elem;
    }

    has_elements() {
        return Boolean(this.m_top_elem);
    }

    num_players(n_players)
    {
        if(n_players === undefined)
        {
            return this.player_columns.length;
        }

        if (this.player_columns) {
            this.reset();
            for (let col of this.player_columns) {
                col.destroy();
            }
        }

        this.player_columns = new Array(n_players);
        for(let player_number = 0; player_number < n_players; ++player_number)
        {
            this.player_columns[player_number] = new CantStopPlayerColumn (
                this.square_elems, player_number, this);
        }
    }

    has_precommits(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].has_precommits();
    }

    add_precommit(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].add_precommit();
    }

    add_provisional_precommit(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].add_provisional_precommit();
    }

    promot_all_provisional_precommits(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].promot_all_provisional_precommits();
    }

    remove_all_provisional_precommits(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].remove_all_provisional_precommits();
    }

    remove_all_precommits(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].remove_all_precommits();
    }

    precommits(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].precommits()
    }

    commit(player_number) {
        this.player_columns[player_number].commit()
        this.process_if_full(player_number);
    }

    // For use with manual column filling
    // Clears the final non-empty square
    clear_nonempty_square(player_number) {
        // The 'return' was added automatically and might not be necessary.
        return this.player_columns[player_number].clear_nonempty_square()
    }

    // For use with manual column filling
    // Clears the final non-empty square
    commit_noncommited_square(player_number) {
        // The 'return' was added automatically and might not be necessary.
        this.player_columns[player_number].commit_noncommited_square();
        this.process_if_full(player_number);
    }

    decorate_owned_square_elems(owning_player) {
        if(owning_player === null) {
            for (let sq of this.square_elems) {
                sq.removeClass('cs-square-owned');
                sq.css("background-color", get_css_variable('--games-board-background-colour'));
            }
        } else {
            assert(typeof owning_player == "number");
            for (let sq of this.square_elems) {
                sq.addClass('cs-square-owned');
                sq.css("background-color", get_cantstop_player_color(owning_player));
            }
        }
    }
    make_owned_by(owning_player) {

        for (let pc of this.player_columns) {
            pc.make_owned();
        }

        this.decorate_owned_square_elems(owning_player);

        this.m_owned_by = owning_player;
    }

    // Record that the colum is 'owned' by the given player
    process_if_full(player_number) {
        assert(player_number !== undefined);
        if (this.player_columns[player_number].is_full() && !this.is_owned() &&
            this.square_elems.length > 0) {
            this.make_owned_by(player_number);
        }
    }

    is_full(player_number) {
        return this.player_columns[player_number].is_full() || this.is_owned(); 
    }

    is_owned()
    {
        assert(this.m_owned_by === null || typeof this.m_owned_by == "number");
        return this.m_owned_by !== null;
    }

    // Return to starting state for all players.
    reset() {
        this.reset_non_column_state();
        for (let pc of this.player_columns) {
            pc.reset();
        }
    }

    // Return to starting state for a single player.
    reset_player(player_number) {
        this.player_columns[player_number].reset();
    }

    // Return the top-level HTML element for this column
    elem()
    {
        return this.m_column_elem;
    }

    onInPlayClick(callback) {
        if (this.has_elements()) {
            this.top_number.click(()=>callback(this));
            this.bottom_number.click(()=>callback(this));
        }
    }

    onPlayerSquareClick(callback) {
        if(callback) {
            for (let pc of this.player_columns) {
                pc.onPlayerSquareClick(info => {
                    let extended = Object.assign({column: this}, info);
                    callback(extended);
                });
            }
        }
    }

    in_play(on_off) {
        if(on_off === undefined) {
            return this.m_in_play;
        }

        this.m_in_play = Boolean(on_off);

        if (this.has_elements()) {
            this.top_number.toggleClass("cs-in-play-column", on_off);
            this.bottom_number.toggleClass("cs-in-play-column", on_off);
        }
    }    

    state(input_state) {
        const n_player = this.player_columns.length;

        if(input_state === undefined) {
            if (this.m_owned_by !== null) {
                assert(typeof this.m_owned_by == "number" )
                return { owned_by: this.m_owned_by }
            } else {
                let squares = new Array(n_player);
                for (let i = 0; i < n_player; ++i) {
                    squares[i] = this.player_columns[i].state();
                }
                return {
                    squares: squares,
                    in_play: this.in_play(),
                };
            }
        } else {
            if (input_state.owned_by !== undefined) {
                this.make_owned_by(input_state.owned_by);
            } else {
                this.reset_non_column_state(); // Hmm
                for (let p = 0; p < n_player; ++p) {
                    this.player_columns[p].state(input_state.squares[p]);
                }
                this.in_play(input_state.in_play);
            }
        }
    }

    allow_manual_control(allow) {
        this.manual_control_allowed = allow;
    }
}
