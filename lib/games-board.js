//"use strict";
'use strict';

const GamesBoardcolors = [
    "red",
    "blue",
    "green",
    "orange",
    "purple",
    "brown",
    "gold", // Yellow was a bit to light for text to be readable against a white background
    "black",
];

class gamesBoardSquare {
    constructor(elem, row, col)
    {
        this.elem = $(elem);

        this.row = row;
        this.col = col;
        this.player_number = undefined;

        this.counter = $('<div></div>');
        this.counter.css({
            margin: "10%",
            height: "80%",
            width: "80%",
            borderRadius: "50%"
        });
        this.elem.append(this.counter);

        this.clear();
    }

    playerNumber(player_number)
    {
        var result = this.player_number;

        if(player_number === undefined)
            {
            // just return the result.    
            }
        else
        {
            var color = GamesBoard.getPlayerColor(player_number);
            if(!color)
            {
                throw "ERROR: Player number not recognised";
            }

            this.counter.css({
                background:  color,
                display: "block",
            });
            this.player_number = player_number;
        }


        return result;
    }

    clear()
    {
        this.player_number = undefined;
        this.counter.css("display",  "none");
    }
};


class GamesBoard {
    constructor(elem /*div or simiiar*/, n_cols, n_rows)
    {
        this.user_supplied_elem = $(elem);
        this.n_cols = n_cols;
        this.n_rows = n_rows;

        this.board = $('<div></div>');
        this.user_supplied_elem.append(this.board);

        
        this.board.css({
            display: "grid",
            gridTemplateRows: "repeat(" + n_rows + ", 1fr)",
            gridTemplateColumns: "repeat(" + n_cols + ", 1fr)",
        });
        //this.board.css(;
        //this.board.css("grid-template-columns", "repeat(" + n_cols + ", 1fr)");

        this.squares = new Array(n_rows); 
        for (var row = 0; row < n_rows; ++row)
        {
            this.squares[row] = new Array(n_cols);

            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="gamesBoardSquare"></div>');
                
                var border_style = "3px solid black";
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

    getSquare(row, col)
    {
        //console.log("getting square " + row + " " + col); 
        return this.squares[row][col];
    }
    
    getSquareFromElem(elem, type) 
    {
        var row = parseInt($(elem).css("grid-row-start")) - 1 ;
        var col = parseInt($(elem).css("grid-column-start")) - 1 ;
        return this.getSquare(row, col);
    }

    click(callback) {
        var games_board = this;
   
        $(".gamesBoardSquare").click(
            function(){callback(games_board.getSquareFromElem(this));}
        );
    }

    hover(in_cb, out_cb) {
        var games_board = this;
   
        var xxx = in_cb;
        $(".gamesBoardSquare").hover(
            function(){in_cb(games_board.getSquareFromElem(this));},
            function(){out_cb(games_board.getSquareFromElem(this));},
        );
    }

    static getPlayerColor(player_number)
        {
        return GamesBoardcolors[player_number-1];
        }
}
