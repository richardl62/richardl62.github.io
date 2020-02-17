//"use strict";
'use strict';

function gamesBoardPlayerColor(player)
{
    const colors = [  
    "red",
    "blue",
    "green",
    "orange",
    "purple",
    "brown",
    "gold", // Yellow was a bit to light for text to be readable against a white background
    "black",
    ];

    return colors[player-1];
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

        this.counter = $('<div></div>');
        this.counter.css({
            margin: "10%",
            height: "80%",
            width: "80%",
            borderRadius: "50%"
        });
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

            var player = this.gbs_status.player();

            var elem_color = this.gbs_status.is_disabled() ? "black" : "white";
            var counter_color = player ? gamesBoardPlayerColor(player) : elem_color;

            this.elem.css("background-color", elem_color);
            this.counter.css("background-color", counter_color);
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

        this.board = $('<div></div>');

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
                var elem = $('<div class="gamesBoardSquare"></div>');
                
                var border_style = "2px solid black";
                var style = {
                    width: "100%",
                    height: "100%",
                    backgroundColor: "white",
                    borderBottom: border_style,
                    borderRight: border_style,
                    gridRow: row+1,
                    gridColumn: col+1,
                };

                if(row == 0)
                    style["borderTop"] = border_style;

                if(col == 0)
                    style["borderLeft"] = border_style; 

                elem.css(style);

                this.board.append(elem);
    

                this.squares[row][col] = new gamesBoardSquare(elem, row, col);
            }
        }

        this.apply_callback();
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

        this.board.innerWidth(board_w);
        this.board.innerHeight(board_h);
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

        this.apply_callback();
    }

    apply_callback()
    {
        var squares = $(".gamesBoardSquare");

        //only 1 callback is supported
        squares.off("click");
        
        if (this.click_callback) 
        {
            squares.click(this.click_callback);
        }
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
