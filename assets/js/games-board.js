"use strict";

function gamesBoardSetup(board, n_cols, n_rows) {
    board.css("display", "grid");

    for (var row = 0; row < n_rows; ++row)
        for (var col = 0; col < n_cols; ++col) {
            var elem = $('<div class="square"><div class="counter"></div></div>');
            board.append(elem);

            if (row != 0)
                elem.css("border-top", "none");
            if (col != 0)
                elem.css( "border-left", "none");
        }

    board.css("grid-template-rows", "repeat(" + n_rows + ", 1fr)");
    board.css("grid-template-columns", "repeat(" + n_cols + ", 1fr)");

    gamesBoardResize(board, n_cols, n_rows);
}

function gamesBoardResize(board, n_cols, n_rows) {
    // Size of squares to exactly fit the width
    var ws = board.innerWidth() / n_cols;

    // Size of squares to exactly fit the hieght
    var hs = board.innerHeight() / n_rows;

    if (ws > hs) {
        board.innerWidth(hs * n_cols);
    }
    else {
        board.innerHeight(ws * n_rows);
    }
}