"use strict";

const max_column_number = 12; //Kludge??

const sq_empty = 0;
const sq_precommitted = 1;
const sq_committed = 2;
const sq_in_owned_column = 3; // Used when the column is filled by any player.

const precommitted_column_limit = 3;

// Record the status in a board square for a particular player
class CantStopPlayerSquare {
    constructor(square_elem, player_number) {

        this.square_elem = square_elem;
        this.player_number = player_number;
        this.status = sq_empty;

        this.elem = $("<div class='cs-player-square'></div>");
        this.square_elem.append(this.elem);

        let css = {};

        if (player_number == 0)
            css["borderLeft"] = "none";
        css["borderRight"] = "none";
        css["borderBottom"] = "none";
        css["borderTop"] = "none";

        this.elem.css(css);

    }

    remove_added_elements()
    {
        if(this.elem)
        {
            this.elem.remove();
            this.elem = null;
        }
    }

    make_precommit() {
        this.elem.css("background-color", "gray"); // For now, at least
        this.status = sq_precommitted;
    }

    make_commit() {
        this.elem.css("background-color", get_default_player_color(this.player_number)); 
        this.status = sq_committed;
    }

    make_empty() {
        this.elem.css("background-color", "var(--board-game-background-color)");
        this.status = sq_empty;
    }

    make_in_owned_column()
    {
        this.status = sq_in_owned_column;
//         this.elem.css({
//             backgroundColor: get_default_player_color(owning_player_number),
//             border: "none",
//             });
    }

    is_precommit() {
        return this.status == sq_precommitted;
    }

    is_commit() {
        return this.status == sq_committed;
    }

    is_empty() {
        return this.status == sq_empty;
    }
}

function make_columm_and_square_elems(n_squares, column_number) {
    let squares = new Array(n_squares);

    let col = $("<div class='column'></div>");

    col.append("<div class='top-number'>" + column_number + "</div>");
    

    for (let i = 0; i < n_squares; ++i)
        {
        squares[i] = $("<div class='square'></div>");
        col.append(squares[i]);
        }

    col.append("<div class='bottom-number'>" + column_number + "</div>");

    return [col, squares];
}

class CantStopColumn {
    constructor(column_number,column_elem, square_elems) {
        assert((column_elem === null) == (square_elems === null));


        this.column_number = column_number; // To help with debugging
        this.column_elem = column_elem;
        this.square_elems = square_elems;
        this.m_is_owned = false;

        this.player_squares = null; // set in num_players() 
    }

    num_players(n_players)
    {
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
                    ps.push(new CantStopPlayerSquare(elem, player_number));
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
            if (sq.is_precommit()) {
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

    remove_all_precommits(player_number) {
        for (const sq of this.squares(player_number)) {
            if (sq.is_precommit()) {
                sq.make_empty();
            }
        }
    }

    remove_last_precommit(player_number) {
        for (let i = this.squares(player_number).length - 1; i >= 0; --i) {
            let sq = this.squares(player_number)[i];

            if (sq.is_precommit()) {
                sq.make_empty();
                return;
            }
        }
    }

    commit(player_number) {
        let squares = this.squares(player_number);
        for (const sq of squares) {
            if (sq.is_precommit())
                sq.make_commit();
        }
    }

    // Record that the colum is 'owned' by the given player
    // and update elements to reflect this.
    mark_column_as_owned(owning_player_number) {

        for (let psq of this.player_squares) {
            for (let sq of psq) {
                sq.make_in_owned_column(owning_player_number);
            }
        }

        if(this.column_elem !== null)
        {
            let color = get_default_player_color(owning_player_number);
            for(let elem of this.square_elems)
            {
                elem.empty();
                elem.css("background-color", color);
            }
        }

        this.m_is_owned = true;
    }

    is_owned()
    {
        return this.m_is_owned;
    }

    // Return to starting state for all player.
    reset() {
        if (this.player_squares) {
            for (const psq of this.player_squares) {
                for (let sq of psq) {
                    sq.make_empty();
                }
            }
        }
    }
}

class CantStopBoard {
    constructor(board_elem) {
        this.board_elem = board_elem;
        this.columns = new Array;
    }

    add_column(column_number, n_squares)
    {
        //TO DO:  Review and tidy up this code

        let [col, square_elems] =  make_columm_and_square_elems(n_squares, column_number);
        
        function array_css(arr, property, value)
        {
            arr.forEach((s)=>s.css(property, value));
        }
        
        if (column_number < 7)
            array_css(square_elems, "border-right-style", "none");
        if (column_number > 7)
            array_css(square_elems, "border-left-style", "none");

        array_css(square_elems, "border-top-style", "none");
            
        square_elems[0].css("border-top-style", "solid");

        // Pad with empty columns as necessary before added the requested column
        assert(this.columns.length <= column_number);
        while (this.columns.length < column_number) {
            this.columns.push(new CantStopColumn(this.columns.length, null, null));
        }
        this.columns.push(new CantStopColumn(column_number, col, square_elems.reverse()));

        this.board_elem.append(col);
    }

    // Must be called after last column is added
    num_players(number)
    {
        for(let col of this.columns)
        {
            col.num_players(number);
        }
    }

    // Clear any existing game state and start a new game
    start_game() {
        for (let col of this.columns) {
            col.reset();
        }
    }

    // Return an array with the options available for the given dice_numbers.
    // This will be an array with each element being an array of
    // 0 1 or 2 column numbers.
    options(player_number, dice_numbers/* array of numbers */) {

        let has_precommits = new Set;
        let is_full = new Set;
        for (let cn = 0; cn < this.columns.length; ++cn) {
            let col = this.columns[cn];
            if (col && col.has_precommits(player_number)) {
                has_precommits.add(cn);
            }

            if (col && col.is_full(player_number)) {
                is_full.add(cn);
            }
        }

        let accumulator = new CantStopOptionAccumulator(has_precommits, is_full);

        let options = new Array;
        function add_option(index1a, index1b, index2a, index2b) {
            let s1 = dice_numbers[index1a] + dice_numbers[index1b];
            let s2 = dice_numbers[index2a] + dice_numbers[index2b];


            accumulator.candidate_pair(s1, s2);
        }

        add_option(0, 1, 2, 3);
        add_option(0, 2, 1, 3);
        add_option(0, 3, 1, 2);


        function compare(o1, o2) {
            if (o1.lenght != o2.lenght) {
                // Put Longer array first
                return o2.length - o1.length;
            }

            if (o1[0] != o2[0]) {
                return o1[0] - o2[0];
            }

            if (length > 1) {
                return o1[1] - o2[1];
            }

            return 0;
        }

        return sort_unique(accumulator.get_options(), compare);
    }


    // 'pre-commit' the given dice numbers. 
    add_precommit(
        player_number,
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        for (let d of dice_numbers)
            this.columns[d].add_precommit(player_number);

    }

    remove_precommit(
        player_number,
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        for (let d of dice_numbers)
            this.columns[d].remove_last_precommit(player_number);
    }

    remove_all_precommits(player_number) {
        for (let c of this.columns)
            c.remove_all_precommits(player_number);
    }

    // Make the pre-committed numbers permanent.
    commit(player_number) {
        for (let c of this.columns)
        {
            c.commit(player_number);


            if(c.is_full(player_number) && !c.is_owned())
            {   
                console.log("column", c.column_number, "owned by player", player_number);
                c.mark_column_as_owned(player_number);
            }
        }
    }
}
