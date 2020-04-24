"use strict";

const max_column_number = 12; //Kludge??

class CantStopSquare
{
    constructor(elem)
    {
        this.elem = elem;
    }

    precommit()
    {
        this.elem.css("background-color", "red"); // Tmp
    }

    clear()
    {
        this.elem.css("background-color", "cornsilk"); // Tmp
    }
}

class CantStopColumn
{
    constructor(elems) 
    {
        this.squares = new Array;
        elems.forEach(elem => this.squares.push(new CantStopSquare(elem)));
    }

    add_precommit()
    {
        this.squares[0].precommit();
    }

    remove_precommit()
    {
        this.clear(); // For now;
    }

    commit()
    {
        this.clear(); // For now 
    }

    clear()
    {
        this.squares.forEach((sq) => sq.clear());  
    }

}
class CantStopBoard {
    constructor()
    {
        this.columns = Array(12);
    }

    add_column(column_number, 
        elems // Array of divs or similar, starting with the lowest.
              // i.e. the first to be filled by pre_commit() and commit().
    )
    {
        this.columns[column_number] = new CantStopColumn(elems);
    }

    // Clear any existing game state and start a new game
    start_game(/*n_players*/) {
        this.columns.forEach(col => {
            if(col) 
                col.clear();
        });
    }

    // Return an array with the options available for the given dice_numbers.
    // This will be an array with each element being an array of
    // 0 1 or 2 column numbers.
    options(dice_numbers /*array */)
    {
        //TO DO - prune options to reflect the game status
        
        let options = new Array;
        function add_option(index1a, index1b, index2a, index2b)
        {
            let s1 = dice_numbers[index1a] +  dice_numbers[index1b];
            let s2 = dice_numbers[index2a] +  dice_numbers[index2b];
            
            options.push([s1,s2].sort());
        }

        add_option(0, 1, 2, 3);
        add_option(0, 2, 1, 3);
        add_option(0, 3, 1, 2);  
        //options.push([12]); // TEMPORARY - to help initial testing

        function compare(o1, o2) {
            if(o1.lenght != o2.lenght)
            {
                // Put Longer array first
                return o2.length - o1.length;
            }

            if(o1[0] != o2[0])
            {
                return o1[0] - o2[0];
            }

            if(length > 1)
            {
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
        dice_numbers.forEach(d => this.columns[d].remove_precommit());

    }

    remove_all_precommit()
    {
        this.columns.forEach((c) => {
            if(c) 
                c.commit();
        });
    }
    
    // Make the pre-committed numbers permanent.
    commit() {
        this.columns.forEach((c) => {
            if(c) 
                c.commit();
        });
    }


}