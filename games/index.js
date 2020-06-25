'use strict'

const debug_only_elems = document.querySelectorAll('.debug-only');
const debug_options_elem  = getElementById_Checked("debug-options");
const game_name_elems = document.querySelectorAll('input[name="game"]');
const game_id_elem  = getElementById_Checked("game-id");
const local_server_elem  = getElementById_Checked("local-server");
const play_offline_elem = getElementById_Checked("play-offline");
const start_elem = getElementById_Checked("start");
const refresh_open_games_elem = getElementById_Checked("refresh-open-games");
const clear_open_games_elem = getElementById_Checked("clear-open-games");
const open_games_info = getElementById_Checked("open-games-info"); 

const online_games = [ "dropdown", "othello" ];
    
function local_server() {
   return local_server_elem.checked;
}

function first_online_game() {
  for (let game of game_name_elems) {
    if (online_games.includes(game.value)) {
      return game;
    }
  }
  assert(false)
}

function show_online_games_only() {
  for (let game of game_name_elems) {
    if (!online_games.includes(game.value)) {
      game.parentElement.style.display = "none";
      if (game.selected) {
        first_online_game().selected = true;
      }
    }
  }
}
function show_debug_only_elems(show) {
  const vis = show ? "initial" : "hidden";
  for (let elem of debug_only_elems) {
    elem.style.visibility = vis;
  }
}
// id is optional. If not wanted can be suppied as null
function game_href(id, game) {
  assert(game);
  
  let href;
  if (game == "dropdown" || game == "othello") {
    href = "boardgame/boardgame.html"
  } else if (game == "dice") {
    href = "dice/dice-game.html"
  } else if (game == "cantstop") {
    href = "cant-stop/cant-stop.html"
  } else if (game == "plusminus") {
    game_display_name = "Plus/Minus"
  }
  assert(href);

  let search_params = new URLSearchParams;
  search_params.set("game", game);

  if (id) {
    search_params.set("id", id);
  }

  href += "?" + search_params.toString();

  return href;
}

function game_display_name(game) {
  assert(game);

  let display_name;
  
  if (game == "cantstop") {
    display_name = "Can't Stop"
  } else if (game == "plusminus") {
    display_name = "Plus/Minus"
  } else {
    // Capitalise the first letter - This is the default
    display_name = game.charAt(0).toUpperCase() + game.slice(1);
  }

  return display_name;
}

class OnlineGameInfo {
  constructor() {
    this.reset();
  }

  reset(class_name) {
    open_games_info.innerHTML = "";
    open_games_info.className = class_name ? class_name : "";
  }


  message(text) {
    this.reset('open-games-message');
    $(open_games_info).text(text);
  }

  error(...lines) {
    this.reset('open-games-error');

    for (let line of lines) {
      open_games_info.innerHTML += `<div>${line}</div>\n`;
    }
  }

  add_first_game(id, game) {
    if(open_games_info.className != 'open-games-list') {
      this.reset('open-games-list');
    }

    const href = game_href(id, game);
    const display_name = game_display_name(game);

    const link = `<a href="${href}">${id}</a>`;
    const span = `<span>${display_name}</span>\n`;

    open_games_info.innerHTML = link + span + open_games_info.innerHTML;
  }
}

let oneline_game_info = new OnlineGameInfo;


function show_all_open_games() {
  oneline_game_info.message("Working ...");
  game_server_fetch('GET', 'open-games', local_server())
    .then(function (data) {
      if (!data) {
        oneline_game_info.message("No games found");
      } else {
        for (let [id, game] of data) {
          oneline_game_info.add_first_game(id, game);
        }
      }
    })
    .catch(err => {
      oneline_game_info.error("Can't retrieve open games", err);
    })
}

function start_game(id, game_type) {
  const data = { 
    id: id,
    game: game_type, 
  };
 
  game_server_fetch('POST', 'start-game', local_server(), data)
    .then(data => {
      oneline_game_info.add_first_game(id, game_type);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
}


function selected_game() {
  for(let elem of game_name_elems) {
    if(elem.checked)
      return elem.value;
  }
  assert(false);
}

start_elem.addEventListener("click", (e) => {
  start_game(game_id_elem.value, selected_game());
})

refresh_open_games_elem.addEventListener("click", (e) => {
  show_all_open_games();
})

clear_open_games_elem.addEventListener("click", (e) => {
  fetch(get_server() + '/clear')
    .then(response => {
      console.log("response", response)
      return response.text();
    })
    .then(data => {
      console.log("data", data)
      show_all_open_games()
    })
    .catch(err => {
      console.log("err", err)
      oneline_game_info.error("Problem clearing open games", err);
    })
})

play_offline_elem.addEventListener("click", (e) => {
    const id = null;
    const game = selected_game();
    window.location.href  = game_href(id, game);
});

local_server_elem.addEventListener("change", (e) => {
  oneline_game_info.reset();
});

game_id_elem.addEventListener("click", (e) => {
  show_online_games_only();
});

debug_options_elem.addEventListener("change", function(e) {
  show_debug_only_elems(this.checked);
});

//show_debug_only_elems(true);

//local_server_elem.checked = true;
//show_all_open_games();




