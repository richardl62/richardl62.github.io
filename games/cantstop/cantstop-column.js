"use strict";

const sq_empty = 0;
const sq_provisonally_precommitted = 1;
const sq_precommitted = 2;
const sq_committed = 3;
const sq_in_owned_column = 4; // Used when the column is filled by any player.

const precommitted_column_limit = 3;

// Record the status in a board square for a particular player
class CantStopPlayerSquare {
    constructor(input_elem, player_number, board) {

        this.player_elem = $("<div class='cs-player-square'></div>");
        input_elem.append(this.player_elem)


        let css = {};

        if (player_number <= 1)
            css["borderLeft"] = "none";
        css["borderRight"] = "none";
        css["borderBottom"] = "none";
        css["borderTop"] = "none";

        this.player_elem.css(css);

        this.precommit_elem = null;

        this.player_number = player_number;
        this.status = sq_empty;

        this.player_elem.click(elem => board.player_square_clicked(this));
    }

    remove_added_elements()
    {
        if(this.player_elem)
        {
            this.player_elem.remove();
            this.player_elem = null;
        }
    }

    clear()
    {
        //assert((this.precommit_elem == null) == (this.status == sq_empty));
        if(this.precommit_elem)
        {
            this.precommit_elem.remove();
            this.precommit_elem = null;
        }
        this.player_elem.css("background-color", "var(--games-board-background-colour)");
        this.status = sq_empty;
    }

    make_provisional_precommitted() {
        this.make_precommit();
        this.precommit_elem.addClass("cs-provisional-precommit");
 
        this.status = sq_provisonally_precommitted;
    }

    make_precommit() {
        this.clear();

        this.precommit_elem = $("<div>");
        this.precommit_elem.addClass("cs-precommit");
        this.player_elem.append(this.precommit_elem);

        this.status = sq_precommitted;
    }

    make_commit() {
        this.clear();

        this.player_elem.css("background-color", get_default_player_color(this.player_number));
        this.status = sq_committed;
    }

    make_in_owned_column()
    {
        this.status = sq_in_owned_column;
    }

    is_owned() {
        return this.status == sq_in_owned_column;
    }

    is_provisional_precommit() {
        return this.status == sq_provisonally_precommitted;
    }
    
    is_precommitted() {
        return this.status == sq_precommitted || this.status == sq_provisonally_precommitted;
    }

    is_committed() {
        return this.status == sq_committed;
    }

    is_empty() {
        return this.status == sq_empty;
    }

    elem() {
        return this.player_elem;
    }
}

function make_columm_and_square_elems(n_squares, column_number) {
    let squares = new Array(n_squares);

    let col = $("<div class='cs-column'></div>");
    col.append("<div class='cs-top-number'>" + column_number + "</div>");
    

    for (let i = 0; i < n_squares; ++i)
        {
        squares[i] = $("<div class='cs-square'></div>");
        col.append(squares[i]);
        }

    col.append("<div class='cs-bottom-number'>" + column_number + "</div>");

    return [col, squares];
}

class CantStopColumn {
    constructor(column_number,column_elem, square_elems) {
        assert((column_elem === null) == (square_elems === null));


        this.column_number = column_number; // To help with debugging
        this.m_column_elem = column_elem;
        this.square_elems = square_elems;
        this.m_is_owned = false;

        this.player_squares = null; // [player-number][square] - set in num_players() 

        this.manual_filling_allowed = false;

        Object.seal(this);
    }

    clear_added_elements() {
        if (this.player_squares) {
            for (let psq of this.player_squares) {
                for (let sq of psq) {
                    sq.remove_added_elements();
                }
            }
        }
    }
    

    num_players(n_players)
    {
        if(n_players === undefined)
        {
            return this.player_squares.length - 1;
        }

        this.clear_added_elements();

        if(this.player_squares)
        {
            for(let psq of this.player_squares)
            {
                for(let sq of psq)
                {
                    sq.remove_added_elements();
                }
            }
        }

        this.player_squares = new Array(n_players+1);
        for(let player_number = 0; player_number <= n_players; ++player_number)
        {
            let ps = new Array();
            if (this.square_elems && player_number >= 1) {
                for (let elem of this.square_elems) {
                    ps.push(new CantStopPlayerSquare(elem, player_number, this));
                }
            }
            
            this.player_squares[player_number] = ps;
        }
    }

    squares(player_number)
    {
        assert(player_number);

        let s = this.player_squares[player_number]; // For now
        return s;
    }

    is_full(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_empty()) {
                return false;
            }
        }

        return true;
    }

    has_precommits(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_precommitted()) {
                return true;
            }
        }

        return false;
    }

    add_precommit(player_number) {
       for (const sq of this.squares(player_number)) {
            if (sq.is_empty()) {
                sq.make_precommit();
                break;
            }
        }
    }

    add_provisional_precommit(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_empty()) {
                sq.make_provisional_precommitted();
                break;
            }
        }
    }

    promot_all_provisional_precommits(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_provisional_precommit()) {
                sq.make_precommit();
            }
        }
    }

    
    remove_all_provisional_precommits(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_provisional_precommit()) {
                sq.clear();
            }
        }
    }
    remove_all_precommits(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_precommitted()) {
                sq.clear();
            }
        }
    }

    precommits(player_number) {
        let result = new Array;
        for (let i = this.squares(player_number).length - 1; i >= 0; --i) {
            let sq = this.squares(player_number)[i];

            if (sq.is_precommitted()) {
                result.push(sq);
            }
        }

        return result;
    }

    commit(player_number) {
        let squares = this.squares(player_number);
        for (const sq of squares) {
            if (sq.is_precommitted())
                sq.make_commit();
        }
    
        this.process_if_full(player_number);
    }

    // For use with manual column filling.
    // Commits the first non-committed square.
    commit_noncommited_square(player_number) {
        let squares = this.squares(player_number);
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
    clear_nonempty_square(player_number) {
        let squares = this.squares(player_number);
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
            for (let psq of this.player_squares) {
                for (let sq of psq) {
                    sq.make_in_owned_column(player_number);
                }
            }

            this.clear_added_elements();

            let color = get_default_player_color(player_number);
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
        for (let psq of this.player_squares) {
            for (let sq of psq) {
                sq.clear();
            }
        }
    }

    // Return to starting state for a single player.
    reset_player(player_number) {
        for(let sq of this.squares(player_number))
        {   
            sq.clear();
        }
    }

    // Return the top-level HTML element for this column
    elem()
    {
        return this.m_column_elem;
    }

    player_square_clicked(square) {
        if (this.manual_filling_allowed && !square.is_owned()) {
            if (square.is_empty()) {
                this.commit_noncommited_square(square.player_number);
            } else {
                this.clear_nonempty_square(square.player_number);
            }
        }
    }

    allow_manual_filling(allow) {
        this.manual_filling_allowed = allow;
    }
}