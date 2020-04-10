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
"use strict";

class GridOfSquares {

    constructor(elem /*div or similar*/, n_rows, n_cols) {
        this.user_supplied_elem = $(elem);
        this.fixed_width_squares = true;

        if (n_cols)
            this.reset(n_rows, n_cols);
    }

    // Intended for internal use.
    setGridColunmTemplate()
    {
        if (this.fixed_width_squares) {
            this.board.css({
                width: "auto",
                gridTemplateColumns: "repeat(" + this.n_cols + ", var(--game-square-size))",
            });
        }
        else {
            // Expand the squares to fit the width of the container
            this.board.css({
                width: "100%",
                gridTemplateColumns: "repeat(" +  this.n_cols + ", 1fr)",
            });
        }
    }  

    reset(n_rows, n_cols) {
        this.n_rows = n_rows;
        this.n_cols = n_cols;
        if (this.board)
            this.board.remove();
        this.board = $('<div class="grid-of-squares"></div>');
        this.user_supplied_elem.append(this.board);

        this.setGridColunmTemplate();
        this.board.css("gridTemplateRows", "repeat(" + n_rows + ", auto)");

        this.grid_elements = new Array(n_rows);
        for (var row = 0; row < n_rows; ++row) {
            this.grid_elements[row] = new Array(n_cols);
            for (var col = 0; col < n_cols; ++col) {
                var elem = $('<div class="grid-square"></div>');
                var style = {
                    gridRow: row + 1,
                    gridColumn: col + 1,
                };
                elem.css(style);
                this.board.append(elem);
                this.grid_elements[row][col] = elem;
            }
        }

        // re-apply any previous callback
        this.clickGridSquare(this.callback);
    }

    fixedWidthSquares(on) {
        if (on === undefined) {
            return this.fixed_width_squares;
        }
        else {
            this.fixed_width_squares = on;
            this.setGridColunmTemplate();
        }
    }

    rows() { return this.n_rows; }
    cols() { return this.n_cols; }

    outerHeight() {
        return this.board.outerHeight();
    }

    outerWidth() {
        return this.board.outerWidth();
    }

    getElement(row, col) {
        var s_row = this.grid_elements[row];
        return s_row ? s_row[col] : undefined;
    }

    getPosition(elem) {
        var row = parseInt($(elem).css("grid-row-start")) - 1;
        var col = parseInt($(elem).css("grid-column-start")) - 1;
        return [row, col];
    }

    // Add a click callback, if supplied, to each of the grid squares. 
    // Any previous click callbacks are cleared.
    // The callback is called as callback(row-number, col-number).
    // The callback is applied to any new grid squares that are created when
    // resizing.
    clickGridSquare(callback) {
        this.callback = callback;

        var grid = this;

        // Allow of the callback being set before the grid is sized.
        if (this.grid_elements) {
            // My version of Edge does not support [].flat()
            flatten(this.grid_elements).forEach(elem => {
                elem.off("click");
                if (callback) {
                    elem.click(function () {
                        var [row, col] = grid.getPosition(this);
                        callback(row, col);
                    });
                }
            });
        }
    }
}
