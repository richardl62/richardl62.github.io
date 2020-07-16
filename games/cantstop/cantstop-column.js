"use strict";
class CantStopPlayerColumn {
    constructor(square_elems, player_number, parent_column) {
        this._squares = [];

        for (let elem of square_elems) {
            this._squares.push(new CantStopPlayerSquare(elem, player_number, parent_column));
        }
    }

    clear() {
        for(let sq of this._squares) {
            sq.clear();
        }
    }

    remove_added_elements() {
        for(let sq of this._squares) {
            sq.remove_added_elements();
        }
    }

    make_in_owned_column() {
        for(let sq of this._squares) {
            sq.make_in_owned_column();
        }
    }

    get squares() {
        return this._squares;
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
}

class CantStopColumn {
    constructor(options) {
        const n_squares = options.n_squares;

        this.square_elems = new Array(n_squares);
        if (n_squares > 0) {
            this.make_html_elements(options);
        }

        this.m_is_owned = false;
        this.m_in_play = false;
        this.player_columns = null; // [player-number][square] - set in num_players() 
        this.manual_control_allowed = false;

        Object.seal(this);

        //console.log("has_elems", this.has_elements(), "n_squares", n_squares, has_elems ? "t" :"f"); 
        if (this.has_elements()) {
            const number_clicked = () => {
                if (this.manual_control_allowed) {
                    this.in_play(!this.in_play());
                }
            }
            this.top_number.click(number_clicked);
            this.bottom_number.click(number_clicked);
        }
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
            this.square_elems[i] = $("<div class='cs-square'></div>");
        }

        /*
         * Append internal elements to m_top_elem in the approrpriate order
         */
        
        this.m_top_elem.append(this.top_number);
        

        for (let i = this.square_elems.length-1; i >= 0; --i) {
            this.m_top_elem.append(this.square_elems[i]);
        }

        this.m_top_elem.append(this.bottom_number);

        /* 
         * style the elements
         */
        let style_squares = (property, value) => {
            this.square_elems.forEach(s => s.css(property, value));
        }

        if (opt('left_side'))
            style_squares("border-right-style", "none");
        if (opt('right_side'))
            style_squares("border-left-style", "none");

        style_squares("border-top-style", "none");

        this.square_elems[this.square_elems.length-1].css("border-top-style", "solid");
    }


    top_elem() {return this.m_top_elem;}

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
            for (let pc of this.player_columns) {
                pc.remove_added_elements();
            }
        }

        this.player_columns = new Array(n_players);
        for(let player_number = 0; player_number < n_players; ++player_number)
        {
            this.player_columns[player_number] = new CantStopPlayerColumn (
                this.square_elems, player_number, this);
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    is_full(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_empty()) {
                return false;
            }
        }

        return true;
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    has_precommits(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_precommitted()) {
                return true;
            }
        }

        return false;
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    add_precommit(player_number) {
       for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_empty()) {
                sq.make_precommit();
                break;
            }
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    add_provisional_precommit(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_empty()) {
                sq.make_provisional_precommitted();
                break;
            }
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    promot_all_provisional_precommits(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_provisional_precommit()) {
                sq.make_precommit();
            }
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    remove_all_provisional_precommits(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_provisional_precommit()) {
                sq.clear();
            }
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    remove_all_precommits(player_number) {
        for (const sq of this.player_columns[player_number].squares) {
            if (sq.is_precommitted()) {
                sq.clear();
            }
        }
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    precommits(player_number) {
        let result = new Array;
        for (let i = this.player_columns[player_number].squares.length - 1; i >= 0; --i) {
            let sq = this.player_columns[player_number].squares[i];

            if (sq.is_precommitted()) {
                result.push(sq);
            }
        }

        return result;
    }

    // Kludge: This would better moved into CantStopPlayerColumn
    commit(player_number) {
        let squares = this.player_columns[player_number].squares;
        for (const sq of squares) {
            if (sq.is_precommitted())
                sq.make_commit();
        }
    
        this.process_if_full(player_number);
    }

    // For use with manual column filling.
    // Commits the first non-committed square.
    // Kludge: This would better moved into CantStopPlayerColumn
    commit_noncommited_square(player_number) {
        let squares = this.player_columns[player_number].squares;
        for (const sq of squares) {
            assert(!sq.is_owned());
            if (!sq.is_committed()) {
                sq.make_commit();
                break;
            }
        }

        this.process_if_full(player_number);
    }

    // For use with manual column filling
    // Clears the final non-empty square
    // Kludge: This would better moved into CantStopPlayerColumn
    clear_nonempty_square(player_number) {
        let squares = this.player_columns[player_number].squares;
        for (let ind = squares.length-1; ind >= 0; --ind) {
            let sq = squares[ind];
            assert(!sq.is_owned());
            if (!sq.is_empty()) {
                sq.clear();
                break;
            }
        }
    }

    set_internal_colors(background, border)
    {
        if(this.m_column_elem !== null)
        {
            for(let i = 0; i < this.square_elems.length; ++i)
            {
                let elem = this.square_elems[i];
                elem.css("background-color", background);

                if(i != 0)
                {
                    elem.css("border-bottom-color", border);
                }
            }

        }
    }

    // Record that the colum is 'owned' by the given player
    // and update elements to reflect this. 
    process_if_full(player_number) {
        if (this.is_full(player_number) && !this.is_owned()) {
            for (let pc of this.player_columns) {
                pc.make_in_owned_column(player_number);
                pc.remove_added_elements(); // KLUDGE/BUG - Leads to error on restart
            }


            let color = get_cantstop_player_color(player_number);
            this.set_internal_colors(color, color);

            this.m_is_owned = true;
        }
    }

    is_owned()
    {
        return this.m_is_owned;
    }

    // Return to starting state for all player.
    reset() {
        for (let pc of this.player_columns) {
            pc.clear();
        }
    }

    // Return to starting state for a single player.
    reset_player(player_number) {
        this.player_columns[player_number].clear();
    }

    // Return the top-level HTML element for this column
    elem()
    {
        return this.m_column_elem;
    }

    player_square_clicked(square) {
        if (this.manual_control_allowed && !square.is_owned()) {
            if (square.is_empty()) {
                this.commit_noncommited_square(square.player_number);
            } else {
                this.clear_nonempty_square(square.player_number);
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
            let st = new Array(n_player);
            for(let i = 0; i < n_player; ++i) {
                st[i] = this.player_columns[i].state();
            }
            return st;
        } else {
            assert(input_state instanceof Array && input_state.length == n_player);
            for(let i = 0; i < n_player; ++i) {
                this.player_columns[i].state(input_state[i]);
            }
        }
    }

    allow_manual_control(allow) {
        this.manual_control_allowed = allow;
    }
}
