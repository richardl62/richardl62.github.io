'use strict'
const game_id_elem  = getElementById_Checked("game-id");
const play_offline_elem = getElementById_Checked("play-offline");
const start_elem = getElementById_Checked("start");
const show_open_games_elem = getElementById_Checked("show-open-games");
const open_games_list = getElementById_Checked("open-games-list");



function start_game(id, type) {

  const data = { 
    id: id,
    type: type 
  };

  const fetch_options = {
    // method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json',
    // },
    // body: JSON.stringify(data),
  };

  fetch('http://localhost:5000/start-game', fetch_options)
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

//start_game("game1", "downfall")

function show_open_games() {
  fetch('http://localhost:5000/open-games').then(function(response) {
    return response.json()
  }).then(function(data) {
    let html = "";
    for(let [id, type] of data) {
      html += `<p>${id} ${type}<\p>\n`
    }
    
    open_games_list.innerHTML = html;
  }).catch(err => console.log("Error: ",err));
}
//show_open_games();

// start_elem.addEventListener("click", (e) => {
//   get_open_games();
// })

// const games = document.querySelectorAll('input[name="game"]');

// const onlineGames = [ "dropdown" ];


// function UpdateGameVisibilty() {
//     const online_only = new_game.checked || game_id.value != "";

//     let default_checked = false;
//     for (let game of games) {
//         const show = !online_only || onlineGames.includes(game.value);
//         game.parentElement.style.display = show ? "initial" : "none";

//         if(show && !default_checked)
//         {
//             game.checked = true;
//             default_checked = true;
//         }

//     }
// }

play_offline_elem.addEventListener("click", (e) => {
    const game = document.querySelector('input[name="game"]:checked').value;

    let path;
    if(game == "dropdown" || game == "othello") {
      path = "boardgame/boardgame.html" 
    } else if (game == "dice") {
      path = "dice/dice-game.html"
    } else if (game == "cantstop") {
      path = "cant-stop/cant-stop.html"
    } else if (game == "plusminus") {
      path= "plus-minus/plus-minus.html"
    }
    
 
    if(path) {
      let search_params = new URLSearchParams;
      search_params.set("game", game);

      window.location.href = path + "?" + search_params.toString();
    }
    else {
        alert(`game "${game}" is not recognised`);
    }
});

// game_id.onchange = function(event) {
//     console.log("game_id", game_id.value);
//     if(game_id.value) {
//         new_game.checked = false;
//     }
//     UpdateGameVisibilty();
// };

// new_game.onchange = function(event) {
//     if(new_game.checked) {
//         game_id.value = "";
//     }

//     UpdateGameVisibilty();
// };




