'use strict';

// Comment out the line below (or set value to false) before pushing to server.
// const default_to_local_server = true;

window.onerror = () => {
  alert("Internal error: See console log for details");
}

(function(){

const debug_only_elems = document.querySelectorAll('.debug-only');
const game_name_elems = document.querySelectorAll('input[name="game"]');
const game_id_elem = getElementById_Checked("game-id");
const local_server_elem = getElementById_Checked("local-server");
const play_offline_elem = getElementById_Checked("play-offline");
const start_elem = getElementById_Checked("start");
const list_online_games_elem = getElementById_Checked("list-online-games");
const clear_games_elem = getElementById_Checked("clear-games");
const open_games_info_elem = getElementById_Checked("open-games-info");
const working_message_elem = getElementById_Checked("working-message");
const misc_elem = getElementById_Checked("misc");

function display_working_message(on) {
  if (on) {
    working_message_elem.classList.remove(display_none_class);
  } else {
    working_message_elem.classList.add(display_none_class);
  }
}
display_working_message(false);

function use_local_server() {
  return local_server_elem.checked;
}

if(typeof default_to_local_server != "undefined") {
  local_server_elem.checked = default_to_local_server;
}

function show_debug_only_elems(show) {
  const vis = show ? "initial" : "hidden";
  for (let elem of debug_only_elems) {
    elem.style.visibility = vis;
  }
}
// KLUDGE?: If id is undefined, this implies that the game is offline.
function game_href(game, id) {
  assert(game);

  let href; // relative href
  let search_params = new URLSearchParams();

  if (game == "dropdown" || game == "othello") {
    search_params.set("game", game);
    href = "gridgames/gridgames.html";
  } else if (game == "dicegame") {
    href = "dicegame/dicegame.html";
  } else if (game == "cantstop") {
    href = "cantstop/cantstop.html";
  }
  assert(href);

  if (id !== undefined) {
    search_params.set("id", id);

    //KLUDGE?
    if (use_local_server()) {
      search_params.set("local", 1);
    }
  }

  if (search_params.toString()) {
    href += "?" + search_params.toString();
  }

  return href;
}

let oneline_game_info = new class  {
  constructor() {
    this.reset();
  }

  reset(class_name) {
    open_games_info_elem.innerHTML = "";
    open_games_info_elem.className = class_name ? class_name : "";
  }


  message(text) {
    this.reset('open-games-message');
    $(open_games_info_elem).text(text);
  }

  error(...lines) {
    this.reset('open-games-error');

    for (let line of lines) {
      open_games_info_elem.innerHTML += `<div>${line}</div>\n`;
    }
  }

  add_first_game(id, game, local) {
    if (open_games_info_elem.className != 'open-games-list') {
      this.reset('open-games-list');
    }

    const href = game_href(game, id);
    const display_name = game_display_name(game);

    const link = `<a href="${href}">${id}</a>`;
    const span = `<span>${display_name}</span>\n`;

    open_games_info_elem.innerHTML = link + span + open_games_info_elem.innerHTML;
  }
}();


async function show_all_open_games() {
  oneline_game_info.reset();
  display_working_message(true);

  try {
    let data = await game_server_fetch('open-games', use_local_server());

    let game_found = false;
    for (let [id, game] of data) {
      oneline_game_info.add_first_game(id, game, use_local_server());
      game_found = true;
    }

    if (!game_found) {
      oneline_game_info.message("No games found");
    }
  }
  catch (err) {
    oneline_game_info.error("Can't retrieve open games", err);
  } finally {
    display_working_message(false);
  }
}

async function start_game(id, game_type) {

  display_working_message(true);
  let server_data = null;
  try {
    server_data = await start_online_game(id, game_type, use_local_server());
  }
  catch (err) {
    oneline_game_info.error("Cannot start game", err);
  }
  finally {
   if(server_data) {
       assert(server_data.id);
       oneline_game_info.add_first_game(server_data.id, game_type);
     }
    display_working_message(false);
  }
}

function clear_all_games() {
  game_server_fetch('clear', use_local_server())
    .then(data => {
      oneline_game_info.reset();
    })
    .catch((error) => {
    });
}

function selected_game() {
  for (let elem of game_name_elems) {
    if (elem.checked)
      return elem.value;
  }
  assert(false);
}

start_elem.addEventListener("click", (e) => {
  start_game(game_id_elem.value.trim(), selected_game());
  game_id_elem.value = "";
});

list_online_games_elem.addEventListener("click", (e) => {
  show_all_open_games();
});

clear_games_elem.addEventListener("click", (e) => {
  clear_all_games();
});

play_offline_elem.addEventListener("click", (e) => {
  const id = null;
  const game = selected_game();
  window.location.href = game_href(game);
});

local_server_elem.addEventListener("change", (e) => {
  oneline_game_info.reset();
});

misc_elem.addEventListener("change", function (e) {
  const text = this.value.trim();
  console.log(text);

  // A far-from-foolproof attempt to stop people doing things that I don't wnat
  // them to.
  if(text == 'debug22') {
    show_debug_only_elems(true);
    this.value = "";
  }
});

})();
