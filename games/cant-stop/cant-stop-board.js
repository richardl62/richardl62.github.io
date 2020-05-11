"use strict";
const max_column_number = 12; //Kludge??

class CantStopBoard {
    constructor(board_elem) {
        this.board_elem = $(board_elem);
        this.board_elem.addClass("cs-board");
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
    reset() {
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
    add_provisional_precommit(
        player_number,
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        for (let d of dice_numbers)
            this.columns[d].add_provisional_precommit(player_number);

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
            this.columns[d].precommits(player_number)[0].clear();
    }

    promot_all_provisional_precommits(player_number) {
        for (let c of this.columns)
            c.promot_all_provisional_precommits(player_number);
    }

    remove_all_provisional_precommits(player_number) {
        for (let c of this.columns)
            c.remove_all_provisional_precommits(player_number);
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
                 c.mark_column_as_owned(player_number);
            }
        }
    }

    // Return the Column class for selected column
    column(column_number)
    {
        return this.columns[column_number];
    }
}
