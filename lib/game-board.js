//"use strict";
'use strict';


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

const gbs_empty = -1;
const gbs_disabled = -2;

class gamesBouardSquareStatus
{

    //
    constructor(
        status_value // player number, gbs_emtpy gbs_disabled
    ) {
        if(status_value === undefined)
        {
            throw new Error("status value is not defined")
        }

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
            return this.status_value > 0 ? this.status_value : undefined;
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
        this.status_value = gbs_empty;
    }

    is_empty()
    {
        return this.status_value == gbs_empty;
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
    constructor(elem, row, col)
    {
        this.elem = $(elem);

        this.row = row;
        this.col = col;

        this.counter = $('<div class="game-board-counter"></div>');
        this.elem.append(this.counter);

        this.gbs_status = new gamesBouardSquareStatus(gbs_empty);
    }

    status(new_status)
    {
        if(new_status === undefined)
            {
            return this.gbs_status;    
            }
        else
        {
            this.gbs_status = new_status;


            if(!this.gbs_status.is_disabled())
            {
                var player = this.gbs_status.player();
                if (!player) {
                    // Kludge? If might be better to remove the counter (and
                    // readd later if required).
                    this.counter.css("background-color", "inherit");
                }
                else {
                    this.counter.css("background-color", gamesBoardPlayerColor(player));
                }
            }
        }
    }

    status_value(value) {
        if (value === undefined) {
            return this.gbs_status.value();
        }
        else {
            this.status(new gamesBouardSquareStatus(value));
        }
    }

    player(player)
    {
        if(player === undefined)
        {
            return this.status().player();
        }

        this.status(new gamesBouardSquareStatus(player));
    }

    make_empty()
    {
        this.status(new gamesBouardSquareStatus(gbs_empty));
    }

    disable()
    {
        this.status(new gamesBouardSquareStatus(gbs_disabled));
    }
};


class GamesBoard {
    constructor(elem /*div or simiiar*/)
    {
        this.user_supplied_elem = $(elem);
    }
     
    reset(n_rows, n_cols)
    {
        this.n_rows = n_rows;
        this.n_cols = n_cols;

        if(this.board)
            this.board.remove();

        this.board = $('<div class="game-board"></div>');

        this.user_supplied_elem.append(this.board);

        this.board.css({
            display: "grid",
            gridTemplateRows: "repeat(" + n_rows + ", 1fr)",
            gridTemplateColumns: "repeat(" + n_cols + ", 1fr)",
        });

        this.squares = new Array(n_rows); 
        for (var row = 0; row < n_rows; ++row)
        {
            this.squares[row] = new Array(n_cols);

            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="game-board-square"></div>');
                
                var style = {
                    borderBottom: "none",
                    borderRight: "none",
                    gridRow: row+1,
                    gridColumn: col+1,
                };

                if(row == 0)
                    style["borderTop"] = "none";

                if(col == 0)
                    style["borderLeft"] = "none"; 

                elem.css(style);

                this.board.append(elem);
    

                this.squares[row][col] = new gamesBoardSquare(elem, row, col);
            }
        }

        this.apply_click_callback();
        this.resize();
    }
    
    resize() {
        var user_w = this.user_supplied_elem.innerWidth();
        var user_h = this.user_supplied_elem.innerHeight();

        // Size of squares to exactly fit the user width or hieght.
        var ws = user_w / this.n_cols;
        var hs = user_h / this.n_rows;
        var ss = Math.min(ws, hs);

        var board_w = (100.0 * ss/ws).toString() + "%";
        var board_h = (100.0 * ss/hs).toString() + "%";

        // Set the outer width/height of the board based on calculations
        // using the inner width/height of the user supplied element.
        this.board.outerWidth(board_w);
        this.board.outerHeight(board_h);

        //console.log(user_w, user_h, board_w, board_h);
    }

    outerHeight()
    {
        return this.board.outerHeight();
    }

    outerWidth()
    {
        return this.board.outerWidth();
    }

    // Return undefined if row or col are out of range.
    getSquare(row, col)
    {

        var s_row = this.squares[row];
        return s_row ? s_row[col] : undefined;
    }
    
    getSquareFromElem(elem, type) 
    {
        var row = parseInt($(elem).css("grid-row-start")) - 1 ;
        var col = parseInt($(elem).css("grid-column-start")) - 1 ;
        return this.getSquare(row, col);
    }

    click(callback) {

        var games_board = this; // record 'outer' this.
        this.click_callback = function () { 
            callback(games_board.getSquareFromElem(this)); 
        };

        this.apply_click_callback();
    }

    apply_click_callback()
    {
        var the_callback = this.click_callback;

        this.for_each_square(function(square) {

            //only 1 callback is supported
            square.elem.off("click");
            
            if (the_callback) 
            {
                square.elem.click(the_callback);
            }
        });
    }

    status(new_status)
    {
        if(new_status === undefined)
        {
            var squares = new Array(this.n_rows);
            for(var row = 0; row < this.n_rows; ++row)
            {
                squares[row] = new Array(this.n_cols);
                for(var col = 0; col < this.n_cols; ++col)
                {
                    squares[row][col] = this.squares[row][col].status_value();
                }
            }

            return [this.n_rows, this.n_cols, squares];
        }
        else {
            let new_n_rows, new_n_cols, new_squares;
            [new_n_rows, new_n_cols, new_squares] = new_status;
            if(new_n_rows != this.n_rows || new_n_cols != this.n_cols)
                this.reset(new_n_rows, new_n_cols);
            
            for (var row = 0; row < this.n_rows; ++row) {
                for (var col = 0; col < this.n_cols; ++col) {
                    var sq = this.squares[row][col];
                    var sta = new_squares[row][col];
                    sq.status_value(sta);
                }
            }
        }

    }
    static getPlayerColor(player_number)
        {
        return GamesBoardcolors[player_number-1];
        }

    for_each_square(func)
    {
        for(var row = 0; row < this.n_rows; ++row)
        {
            for(var col = 0; col < this.n_cols; ++col)
            {
                func(this.squares[row][col]);
            }
        }
    }
}
