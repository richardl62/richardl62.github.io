//"use strict";
'use strict';

class gamesBoardSquare {
    constructor(elem)
    {
        this.elem = $(elem);

        this.row = parseInt(this.elem.css("grid-row-start")) - 1 ;
        this.col = parseInt(this.elem.css("grid-column-start")) - 1 ;
    }

    empty()
    {
        return this.getCounter().length == 0;
    }

    addCounter(player1 = true)
    {
        if(!this.empty())
        {
            return false;
        }

        var counter = $('<div class="gamesBoardCounter"></div>');
        if(!player1)
        {
            counter.addClass("gamesBoardPlayer2");
        }
        this.elem.append(counter);
        return true;
    }

    isPlayer1()
    {
        return !this.getCounter().hasClass("gamesBoardPlayer2");
    }

    togglePlayer()
    {
        this.getCounter().toggleClass("gamesBoardPlayer2");
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

        board.css("display", "grid");

        for (var row = 0; row < n_rows; ++row)
            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="gamesBoardSquare"></div>');
                board.append(elem);
    
                if (row != 0)
                    elem.css("border-top", "none");
                if (col != 0)
                    elem.css( "border-left", "none");

                elem.css("grid-row", row+1);
                elem.css("grid-column", col+1);
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

    clickSquare(callback) {
        $(".gamesBoardSquare").click(function(){
            callback(new gamesBoardSquare(this));
        });
    }
}