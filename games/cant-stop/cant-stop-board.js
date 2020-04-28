"use strict";

const max_column_number = 12; //Kludge??

const sq_empty = 0;
const sq_precommitted = 1;
const sq_committed = 2;

const precommitted_column_limit = 3;

class CantStopOptionAccumulator {
    constructor(has_precommits, is_full) {
        this.has_precommits = has_precommits;
        this.is_full = is_full;
        this.options = new Array;
    }

    candidate_pair(a, b) {
        if (this.is_full.has(a)) {
            this.candidate_single(b);
        }
        else if (this.is_full.has(b)) {
            this.candidate_single(a);
        }
        else {
            // Find that number of columns that would be precommitted if both
            // a and b are accepted;
            let tp = this.has_precommits.size;
            if (!this.has_precommits.has(a))
                ++tp;
            if (a != b && !this.has_precommits.has(b))
                ++tp;

            if (tp <= precommitted_column_limit) {
                // Both a and b can be accepted
                this.options.push([a, b].sort());
            }
            else if (tp == precommitted_column_limit + 1) {
                // Both a and b can't be accepted, but it might be possible
                // to accept one of them.
                this.candidate_single(a);
                this.candidate_single(b);
            }
        }
    }

    candidate_single(a) {
        if (this.is_full.has(a)) {
            // do nothing
        }
        else if (this.has_precommits.has(a)) {
            this.options.push([a]);
        }
        else if (this.has_precommits.size < precommitted_column_limit) {
            this.options.push([a])
        }
    }

    // Unsorted, and could contain duplicates.
    // Individual pairs are sorted.
    get_options() {
        return this.options;
    }
}

// Record the status in a board square for a particular player
class CantStopSquare {
    constructor(square_elem) {

        this.square_elem = square_elem;
        this.player_elems = null; // set by n_players
    }

    num_players(n_players) {

        if(this.player_elems)
        {
            for(let elem of this.player_elems)
            {
                elem.remove();
            }
        }

        this.player_elems = new Array(n_players);

        for(let p = 0; p < n_players; ++p)
        {
            let elem = $("<div class='cs-player-square'></div>");
            this.square_elem.append(elem);

            this.elem = elem; // TEMPORARY

            let css = {};

            if(p == 0)
                css["borderLeft"] = "none";
            css["borderRight"] = "none";
            css["borderBottom"] = "none";
            css["borderTop"] = "none";

            elem.css(css);

            this.player_elems[p] = elem;
        }

        this.status = sq_empty;

        this.elem = this.player_elems[0]; // TEMPORARY;
    }

    make_precommit() {
        this.elem.css("background-color", "gray"); // Tmp
        this.status = sq_precommitted;
    }

    make_commit() {
        this.elem.css("background-color", "red"); // Tmp
        this.status = sq_committed;
    }

    make_empty() {
        this.elem.css("background-color", "cornsilk"); // Tmp
        this.status = sq_empty;
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

class CantStopColumn {
    constructor(elems) {
        this.player_squares = new Array;

        if (elems !== undefined) {
            for (let elem of elems) {
                this.player_squares.push(new CantStopSquare(elem));
            }
        }
    }

    num_players(number)
    {
        for (let psq of this.player_squares) {
            psq.num_players(number);
        }
    }

    squares(player_number)
    {
        assert(player_number);

        let s = this.player_squares; // For now
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
        for (const sq of this.squares(player_number)) {
            if (sq.is_precommit())
                sq.make_commit();
        }
    }

    // Return to starting state for all player.
    reset() {
        for (const sq of this.player_squares) {
            sq.make_empty();
        }
    }
}

class CantStopBoard {
    constructor() {
        this.columns = new Array;
    }

    add_column(column_number,
        elems // Array of divs or similar, starting with the lowest.
        // i.e. the first to be filled by pre_commit() and commit().
    ) {
        // Pad with empty columns as necessary
        while (this.columns.length < column_number) {
            this.columns.push(new CantStopColumn);
        }

        this.columns[column_number] = new CantStopColumn(elems);
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
            c.commit(player_number);
    }
}
