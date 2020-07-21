"use strict";
const max_column_number = 12; //Kludge??

class CantStopBoard {
    constructor(board_elem) {
        this.board_elem = $(board_elem);
        this.board_elem.addClass("cs-board");
        this.m_columns = new Array;
    }

    add_column(column_number, n_squares) {
        // Pad with empty columns as necessary before added the requested column
        if (this.m_columns.length < column_number) {
            this.add_column(column_number-1, 0); // recursive.
        }

        assert(this.m_columns.length == column_number);

        let col = new CantStopColumn({
            column_number: column_number,
            n_squares: n_squares,
            left_side: column_number <= 7,
            right_side: column_number >= 7,
        });

        this.m_columns.push(col);
        this.board_elem.append(col.top_elem());
    }

    // Must be called after last column is added
    num_players(number)
    {
        for(let col of this.m_columns)
        {
            col.num_players(number);
        }
    }

    // Clear any existing game state and start a new game
    reset() {
        for (let col of this.m_columns) {
            col.reset();
        }
    }

    // Return an array with the options available for the given dice_numbers.
    // This will be an array with each element being an array of
    // 0 1 or 2 column numbers.
    options(player_number, dice_numbers/* array of numbers */) {

        let in_play = new Set;
        let is_full = new Set;
        for (let cn = 0; cn < this.m_columns.length; ++cn) {
            let col = this.m_columns[cn];
            if (col && col.in_play()) {
                in_play.add(cn);
            }

            if (col && col.is_full(player_number)) {
                is_full.add(cn);
            }
        }

        let accumulator_OLD = new CantStopOptionAccumulator_OLD(in_play, is_full);
        let accumulator = new CantStopOptionAccumulator(in_play, is_full);
        let options = new Array;
        function add_option(index1a, index1b, index2a, index2b) {
            let s1 = dice_numbers[index1a] + dice_numbers[index1b];
            let s2 = dice_numbers[index2a] + dice_numbers[index2b];

            accumulator_OLD.candidate_pair(s1, s2);
            const old_opts = accumulator_OLD.get_options();

            accumulator.candidate_pair(s1, s2);
            const new_opts = accumulator.get_options();

            if (!manual_filling()) {
                if (JSON.stringify(old_opts) != JSON.stringify(new_opts)) {
                    console.log("Old", old_opts);
                    console.log("New", new_opts);
                    alert("Self check of scoring options failed\n" +
                     "Possible issue with tempory use of manual mode");
                }
            }
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
            this.m_columns[d].add_provisional_precommit(player_number);

    }

    // 'pre-commit' the given dice numbers. 
    add_precommit(
        player_number,
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        for (let d of dice_numbers)
            this.m_columns[d].add_precommit(player_number);

    }

    remove_precommit(
        player_number,
        dice_numbers // Array of m_columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        for (let d of dice_numbers)
            this.m_columns[d].precommits(player_number)[0].clear();
    }

    promot_all_provisional_precommits(player_number) {
        for (let c of this.m_columns)
            c.promot_all_provisional_precommits(player_number);
    }

    remove_all_provisional_precommits(player_number) {
        for (let c of this.m_columns)
            c.remove_all_provisional_precommits(player_number);
    }

    remove_all_precommits(player_number) {
        for (let c of this.m_columns)
            c.remove_all_precommits(player_number);
    }

    // Make the pre-committed numbers permanent.
    commit(player_number) {
        for (let c of this.m_columns)
        {
            c.commit(player_number);
        }
    }

    // Return the Column class for selected column
    column(column_number)
    {
        return this.m_columns[column_number];
    }

    columns()
    {
        return this.m_columns;
    }

    state(input_state) {
        const n_colums = this.m_columns.length;

        if(input_state === undefined) {
            let st = new Array(n_colums);
            for(let i = 0; i < n_colums; ++i) {
                st[i] = this.m_columns[i].state();
            }
            return st;
        } else {
            assert(input_state instanceof Array && input_state.length == n_colums);
            for(let i = 0; i < n_colums; ++i) {
                this.m_columns[i].state(input_state[i]);
            }
        }
    }

    allow_manual_control(allow) {
        for (let c of this.m_columns)
        {
            c.allow_manual_control(allow);
        }
    }
}
