/*
Class gamesBoardSquare presenets a class on a names board.

TO DO:  Consider reviewing and simplifying this code.
*/

"use strict";

function next_player(player, num_players = 2)
{
    if (player == num_players)
        return 1;
    else
        return player + 1;
}

function gamesBoardPlayerColor(player)
{
    var css_var = '--game-board-player-colours-' + player;
    
    var bodyStyles = window.getComputedStyle(document.body); 
    var color = bodyStyles.getPropertyValue(css_var);
    
    if(!color)
        throw new Error("Cannot get colour for player " + player + " - "
             + css_var + " was not found");

    return color;
}

const gbs_disabled = 0;

// Is it worth having this a a separate class?
class gamesBoardSquareStatus
{
    constructor(
        status_value // player number, gbs_disabled or undefined for empty square
    ) {
        this.status_value = status_value;
        
        if(!this.valid())
        {
            throw new Error("bad status value: " + status_value);
        }
    }

    valid()
    {
        return this.player() || this.is_disabled() || this.is_empty();
    }   

    player(new_player)
    {
        if(new_player === undefined)
        {
            return this.status_value == gbs_disabled ? undefined : this.status_value;
        }
        else
        {
            if(!gamesBoardPlayerColor(new_player))
            {
                throw new Error("bad player: " + player);
            }
            this.status_value = new_player;
        }
    }

    make_empty()
    {
        this.status_value = undefined;
    }

    is_empty()
    {
        return this.status_value === undefined;
    }

    disable()
    {
        this.status_value = gbs_disabled;
    }

    is_disabled()
    {
        return this.status_value == gbs_disabled;
    }
    
    // for limited use
    value(val)
    {
        if(val === undefined)
        {
            return this.status_value;
        }
        else
        {
            this.status_value = val;
        }
    }
};

class gamesBoardSquare {
    constructor(elem, row, col) {
        this.elem = $(elem);

        this.row = row;
        this.col = col;

        this.gbs_status = new gamesBoardSquareStatus(); // default to empty
    }

    getRow() {return this.row;}
    getCol() {return this.col;}

    status(new_status) {
        if (new_status === undefined) {
            return this.gbs_status;
        }
        else {
            // Remove any existing counter.
            if (this.counter) {
                this.counter.remove();
                this.counter = undefined;
            }

            // Set the disabled status
            this.elem.toggleClass("game-board-square-disabled", new_status.is_disabled());

            // Re-add the counter of necessary. 
            // kludge?  Reply on player() returning false if the new status is empty or disabled
            var player = new_status.player();
            if (player) {
                this.counter = $('<div class="game-board-counter"></div>');
                this.counter.css("background-color", gamesBoardPlayerColor(player));

                this.elem.append(this.counter);
            }

            this.gbs_status = new_status;
        }
    }

    status_value(value) {
        if (value === undefined) {
            return this.gbs_status.value();
        }
        else {
            this.status(new gamesBoardSquareStatus(value));
        }
    }

    player(player)
    {
        if(player === undefined)
        {
            return this.status().player();
        }

        this.status(new gamesBoardSquareStatus(player));
    }

    next_player(num_players)
        {
        const p = this.player();
        assert(p, "No player currently selected");
        this.player(next_player(p));
        }
        
    make_empty()
    {
        this.status(new gamesBoardSquareStatus());
    }

    disable()
    {
        this.status(new gamesBoardSquareStatus(gbs_disabled));
    }

    is_disabled()
    {
        return this.status().is_disabled();
    }
};



