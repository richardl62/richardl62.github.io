setup_for_game_play();


$("#game-option").change(function(param) {
    console.log("game-option");
    game_control.initial_status_index(this.selectedIndex);
});

function set_error_string(str)
{
    $("#error-box").text(str);
    $("#error-box").css("display","block");
}

function clear_error_string()
{
    $("#error-box").css("display","none");
}

function setup_for_customising()
{
    clear_error_string();

    $(".play-mode").css("display", "none");
    $(".setup-mode").css("display", "block");
    board.clickBoardSquare(on_click_setup);
}

function setup_for_game_play()
{
    clear_error_string();

    $(".play-mode").css("display", "block");
    $(".setup-mode").css("display", "none");
}



 



document.onkeydown = function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
        undo();

    if (e.keyCode == 89 && e.ctrlKey)
        redo();
};

$("#pass").click(function(){
    game_control.next_player();
    page_display.refresh();
});


$("#json").click(function(){
    var json = JSON.stringify(board.status());
    var new_window = window.open("", "");
    new_window.document.write("<p>" + json + "</p>");
});

function reset_board()
{
    var n_cols = parseInt($("#num-cols").val());
    board.reset(n_rows, n_cols);
    game_history.clear();
}



