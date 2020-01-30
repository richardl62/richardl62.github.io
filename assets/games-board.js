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
    }

    empty()
    {
        return this.getCounter().length == 0;
    }

    addCounter(player_number)
    {
        if(!this.empty())
        {
            return false;
        }

        this.counter = $('<div class="gamesBoardCounter"></div>');
  
        this.setPlayerNumber(player_number);
   
        this.elem.append(this.counter);
        return true;
    }

    getPlayerNumber()
    {
        return this.player_number;
    }

    setPlayerNumber(player_number)
    {
        this.player_number = player_number;

        this.counter.css("background",  GamesBoard.getPlayerColor(player_number));
    }

    getCounter() {
        return this.elem.children();
    }
};


class GamesBoard {
    constructor(board /*div or simiiar*/, n_cols, n_rows)
    {
        this.board = $(board);
        this.n_cols = n_cols;
        this.n_rows = n_rows;
        
        this.squares = new Array(n_rows); 

        board.css("display", "grid");

        for (var row = 0; row < n_rows; ++row)
        {
            this.squares[row] = new Array(n_cols);

            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="gamesBoardSquare"></div>');
                board.append(elem);
    
                if (row != 0)
                    elem.css("border-top", "none");
                if (col != 0)
                    elem.css( "border-left", "none");

                elem.css("grid-row", row+1);
                elem.css("grid-column", col+1);

                this.squares[row][col] = new gamesBoardSquare(elem, row, col);
            }
        }
    
        board.css("grid-template-rows", "repeat(" + n_rows + ", 1fr)");
        board.css("grid-template-columns", "repeat(" + n_cols + ", 1fr)");
    

        this.resizeSquares();
    }

    resizeSquares() {
        // Size of squares to exactly fit the width
        var ws = this.board.innerWidth() / this.n_cols;

        // Size of squares to exactly fit the hieght
        var hs = this.board.innerHeight() / this.n_rows;

        if (ws > hs) {
            this.board.innerWidth(hs * this.n_cols);
        }
        else {
            this.board.innerHeight(ws * this.n_rows);
        }
    }

    getSquare(row, col)
    {
        console.log("getting square " + row + " " + col); 
        return this.squares[row][col];
    }
    clickSquare(callback) {
        var games_board = this;
        $(".gamesBoardSquare").click(function(){

            var row = parseInt($(this).css("grid-row-start")) - 1 ;
            var col = parseInt($(this).css("grid-column-start")) - 1 ;
            callback(games_board.getSquare(row, col));
        });
    }

    static getPlayerColor(player_number)
        {
        if(player_number < 1 || player_number > GamesBoardcolors.length)
            throw "Invalid player numbeer " + player_number;

        return GamesBoardcolors[player_number-1];
        }
}