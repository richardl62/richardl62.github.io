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
        //TO DO - prune options to reflect the game status
        
        //BIG KLUDGE: Use JSON to simplify sorting and removing duplicates
        let raw_options = new Set;
        function add_option(index1a, index1b, index2a, index2b)
        {
            let s1 = dice_numbers[index1a] +  dice_numbers[index1b];
            let s2 = dice_numbers[index2a] +  dice_numbers[index2b];
            
            raw_options.add(JSON.stringify([s1,s2].sort()));
        }

        add_option(0, 1, 2, 3);
        add_option(0, 2, 1, 3);
        add_option(0, 3, 1, 2);

        let result = new Array;
        [...raw_options].sort().forEach((opt) => result.push(JSON.parse(opt)));    
        
        return result;
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