"use strict";

class CantStopBoard {
    constructor()
    {
    }

    add_column(column_number, 
        elems // Array of divs or similar, starting with the lowest.
              // i.e. the first to be filled by pre_commit() and commit().
    )
    {
    }

    // Clear any existing game state and start a new game
    start_game(n_players) {

    }

    // Return an array with the options available for the given dice_numbers.
    // This will be an array with each element being an array of
    // 0 1 or 2 column numbers.
    options(dice_numbers /*array */)
    {
        return [];
    }


    // 'pre-commit' the given dice numbers. 
    pre_commit(
        dice_numbers // Array of columns numbers, typically one of the
                     // sub-arrays returned by options()
    ) {
        
    }

    // Make the pre-committed numbers permanent.
    commit() {

    }

    // You can guess what this does.
    clear_last_pre_commit() {

    }

    // And this.
    clear_last_pre_commit() {

    }

}