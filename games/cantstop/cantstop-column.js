"use strict";

const sq_empty = 0;
const sq_provisonally_precommitted = 1;
const sq_precommitted = 2;
const sq_committed = 3;
const sq_in_owned_column = 4; // Used when the column is filled by any player.

const in_play_column_limit = 3;

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

class CantStopColumn {
    constructor(options) {
        const n_squares = options.n_squares;

        this.square_elems = new Array(n_squares);
        if (n_squares > 0) {
            this.make_html_elements(options);
        }

        this.m_is_owned = false;
        this.m_in_play = false;
        this.player_squares = null; // [player-number][square] - set in num_players() 
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


    allow_manual_control(allow) {
        this.manual_control_allowed = allow;
    }
}
