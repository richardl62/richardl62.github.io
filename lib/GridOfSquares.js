/*
GridOfSquares: Adds a grid of squares to an HTML element.

In more detail this class:
- Adds new div to the input element.
- Makes the new div a CSS grid with the required number of rows and columns.
- Resizes the new div to make the grid elements square.  The squares are as
  big as possible without overflowing the input element.  (Typically the grid
  of squares will smaller than the input element in either width or height.)
- Provides some helper functions.  (TO DO:  Consider if there are too many
  of these.)

NOTE: While the grid is responsive, the squareness of the grid elements will
  (in general) be lost if the input elemeent is resizes.  Howwever squareness
  are be re-established by call resize.  (So it is may be a good idea to call
  reize() when the window is resized.) 

*/
class GridOfSquares {
    constructor(elem /*div or simiiar*/, n_rows, n_cols) {
        this.user_supplied_elem = $(elem);
        if (n_cols)
            this.reset(n_rows, n_cols);
    }
    reset(n_rows, n_cols) {
        this.n_rows = n_rows;
        this.n_cols = n_cols;
        if (this.board)
            this.board.remove();
        this.board = $('<div class="grid-of-squares"></div>');
        this.user_supplied_elem.append(this.board);
        this.board.css({
            gridTemplateRows: "repeat(" + n_rows + ", 1fr)",
            gridTemplateColumns: "repeat(" + n_cols + ", 1fr)",
        });
        this.squares = new Array(n_rows);
        for (var row = 0; row < n_rows; ++row) {
            this.squares[row] = new Array(n_cols);
            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="grid-square"></div>');
                var style = {
                    gridRow: row + 1,
                    gridColumn: col + 1,
                };
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
        var board_w = (100.0 * ss / ws).toString() + "%";
        var board_h = (100.0 * ss / hs).toString() + "%";
        // Set the outer width/height of the board based on calculations
        // using the inner width/height of the user supplied element.
        this.board.outerWidth(board_w);
        this.board.outerHeight(board_h);
        //console.log(user_w, user_h, board_w, board_h);
    }
    outerHeight() {
        return this.board.outerHeight();
    }
    outerWidth() {
        return this.board.outerWidth();
    }
    // Return undefined if row or col are out of range.
    getSquare(row, col) {
        var s_row = this.squares[row];
        return s_row ? s_row[col] : undefined;
    }
    getSquareFromElem(elem, type) {
        var row = parseInt($(elem).css("grid-row-start")) - 1;
        var col = parseInt($(elem).css("grid-column-start")) - 1;
        return this.getSquare(row, col);
    }
    click(callback) {
        var games_board = this; // record 'outer' this.
        this.click_callback = function () {
            callback(games_board.getSquareFromElem(this));
        };
        this.apply_click_callback();
    }
    apply_click_callback() {
        var the_callback = this.click_callback;
        this.for_each_square(function (square) {
            //only 1 callback is supported
            square.elem.off("click");
            if (the_callback) {
                square.elem.click(the_callback);
            }
        });
    }
    status(new_status) {
        if (new_status === undefined) {
            var squares = new Array(this.n_rows);
            for (var row = 0; row < this.n_rows; ++row) {
                squares[row] = new Array(this.n_cols);
                for (var col = 0; col < this.n_cols; ++col) {
                    squares[row][col] = this.squares[row][col].status_value();
                }
            }
            return [this.n_rows, this.n_cols, squares];
        }
        else {
            let new_n_rows, new_n_cols, new_squares;
            [new_n_rows, new_n_cols, new_squares] = new_status;
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
    static getPlayerColor(player_number) {
        return GamesBoardcolors[player_number - 1];
    }
    for_each_square(func) {
        for (var row = 0; row < this.n_rows; ++row) {
            for (var col = 0; col < this.n_cols; ++col) {
                func(this.squares[row][col]);
            }
        }
    }
}
