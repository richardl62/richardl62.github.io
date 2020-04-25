"use strict";

const max_column_number = 12; //Kludge??

const sq_empty = 0;
const sq_precommitted = 1;
const sq_committed = 2;


class CantStopSquare {
    constructor(elem) {
        this.elem = elem;
        this.status = sq_empty;
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
        this.squares = new Array;
        elems.forEach(elem => this.squares.push(new CantStopSquare(elem)));
    }

    is_full() {
        for (const sq of this.squares) {
            if (sq.is_empty()) {
                return true;
            }
        }

        return false;
    }

    add_precommit() {
        for (const sq of this.squares) {
            if (sq.is_empty()) {
                sq.make_precommit();
                break;
            }
        }
    }

    remove_all_precommits() {
        for (const sq of this.squares) {
            if (sq.is_precommit()) {
                sq.make_empty();
            }
        }
    }

    remove_last_precommit() {
        for (let i = this.squares.length - 1; i >= 0; --i) {
            let sq = this.squares[i];
            
            if (sq.is_precommit()) {
                sq.make_empty();
                return;
            }
        }
    }

    commit() {
        for (const sq of this.squares) {
            if (sq.is_precommit())
                sq.make_commit();
        }
    }

    clear() {
        for (const sq of this.squares) {
            sq.make_empty();
        }
    }
}

class CantStopBoard {
    constructor() {
        this.columns = Array(12);
    }

    add_column(column_number,
        elems // Array of divs or similar, starting with the lowest.
        // i.e. the first to be filled by pre_commit() and commit().
    ) {
        this.columns[column_number] = new CantStopColumn(elems);
    }

    // Clear any existing game state and start a new game
    start_game(/*n_players*/) {
        this.columns.forEach(col => {
            if (col)
                col.clear();
        });
    }

    // Return an array with the options available for the given dice_numbers.
    // This will be an array with each element being an array of
    // 0 1 or 2 column numbers.
    options(dice_numbers /*array */) {
        //TO DO - prune options to reflect the game status

        let options = new Array;
        function add_option(index1a, index1b, index2a, index2b) {
            let s1 = dice_numbers[index1a] + dice_numbers[index1b];
            let s2 = dice_numbers[index2a] + dice_numbers[index2b];

            options.push([s1, s2].sort());
        }

        add_option(0, 1, 2, 3);
        add_option(0, 2, 1, 3);
        add_option(0, 3, 1, 2);
        //options.push([12]); // TEMPORARY - to help initial testing

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

        return sort_unique(options, compare);
    }


    // 'pre-commit' the given dice numbers. 
    add_precommit(
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        dice_numbers.forEach(d => this.columns[d].add_precommit());

    }

    remove_precommit(
        dice_numbers // Array of columns numbers, typically one of the
        // sub-arrays returned by options()
    ) {
        dice_numbers.forEach(d => this.columns[d].remove_last_precommit());
    }

    remove_all_precommits() {
        this.columns.forEach((c) => {
            if (c)
                c.remove_all_precommits();
        });
    }

    // Make the pre-committed numbers permanent.
    commit() {
        this.columns.forEach((c) => {
            if (c)
                c.commit();
        });
    }
}