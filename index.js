// const form = getElementById_Checked("form");
const game_id  = getElementById_Checked("game-id");
const new_game  = getElementById_Checked("new-game");
const play = getElementById_Checked("play");

const games = document.querySelectorAll('input[name="game"]');

const onlineGames = [ "dropdown", "othello" ];


function UpdateGameVisibilty() {
    const online_only = new_game.checked || game_id.value != "";

    let default_checked = false;
    for (let game of games) {
        const show = !online_only || onlineGames.includes(game.value);
        game.parentElement.style.display = show ? "initial" : "none";

        if(show && !default_checked)
        {
            game.checked = true;
            default_checked = true;
        }

    }
}

play.addEventListener("click", (e) => {
    const game = document.querySelector('input[name="game"]:checked').value;
    if(game == "dropdown" || game == "othello") {
        form.action = "games/boardgame/boardgame.html" 
    } else if (game == "dice") {
        form.action = "games/dice/dice-game.html"
    } else if (game == "cantstop") {
        form.action = "games/cant-stop/cant-stop.html"
    } else if (game == "plusminus") {
        form.action = "games/plus-minus/plus-minus.html"
    } else {
        alert(`game "${game}" is not recognised`);
        e.preventDefault();
    }
});

game_id.onchange = function(event) {
    console.log("game_id", game_id.value);
    if(game_id.value) {
        new_game.checked = false;
    }
    UpdateGameVisibilty();
};

new_game.onchange = function(event) {
    if(new_game.checked) {
        game_id.value = "";
    }

    UpdateGameVisibilty();
};

