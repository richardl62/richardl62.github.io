const play = document.getElementById("play");
const form = document.getElementById("form");

play.addEventListener("click", (e) => {
    const game = document.querySelector('input[name="game"]:checked').value;
    if(game == "dropdown" || game == "othello") {
        form.action = "games/boardgame/boardgame.html" 
    } else if (game == "dice") {
        form.action = "games/dice/dice-game.html"
    } else if (game == "cant-stop") {
        form.action = "games/cant-stop/cant-stop.html"
    } else if (game == "plus-minus") {
        form.action = "games/plus-minus/plus-minus.html"
    } else {
        console.log(`game "${game}" is not recognised`);
        e.preventDefault();
    }
});
