'use strict';

const server_connection_timeout = 10000; // milliseconds

const elems = {
    chat_text: getElementById_Checked("chat-text"),
    chat_send: getElementById_Checked("chat-send"),

    connect: getElementById_Checked("connect"),
    connection_setup: getElementById_Checked("connection-setup"),
    connection_established: getElementById_Checked("connection-established"),
    disconnect: getElementById_Checked("disconnect"),
    group_id_input: getElementById_Checked("group-id-input"),
    group_id_display: getElementById_Checked("group-id-display"),
    minus_button: getElementById_Checked("minus-button"),
    name: getElementById_Checked("name"),
    participant_link: getElementById_Checked("participant-link"),
    plus_button: getElementById_Checked("plus-button"),
    test_mode: getElementById_Checked("test-mode"),
}

function startup() {
    const url = new URL(window.location.href);
    let gid = parseInt(url.searchParams.get("group_id"));
    let test_mode = url.searchParams.has("test_mode");

    elems.test_mode.checked = test_mode;
    game_socket.sendState(number_state(0));
    if (gid) {
        connect_to_server(gid, test_mode);
    }
}

function new_player_link() {
    let url = new URL(window.location.href);
    assert(group_id());
    url.search = "";
    url.searchParams.set("group_id", group_id());
    if (test_mode())
        url.searchParams.set("test_mode", 1);

    return url.href;
}

function test_mode() {
    return elems.test_mode.checked;
}

function group_id() {
    return parseInt(elems.group_id_input.value);
}

function set_group_id(gid) {
    if (gid) {
        assert(typeof gid == "number");
        elems.group_id_display.innerText = gid.toString();
        elems.group_id_input.value = gid.toString();
    } else {
        elems.group_id_display.innerText = "";
        elems.group_id_input.value = "";
    }
}

var game_manager = new gameManager;
var game_socket = new gameSocket(game_manager);

function number_state(num) {
    assert(typeof num == "number")
    return { number: num };
}

function get_number() {
    let num = game_socket.state().number;
    assert(typeof num == "number")
    return num;
}

async function connect_to_server(in_group_id /*can be null*/, local) {
    const server = local ? gameServer_localserver : gameServer_webserver;

    const options = {
        server: server,
        timeout: server_connection_timeout,
    }

    if (in_group_id) {
        //Don't send state when connecting to an existing group.
        options.group_id = in_group_id;
    } else {
        // Send local state that has accumlated so far.
        options.state = game_socket.state();
    }

    let id = null;
    try {
        if (local) {
            game_manager.showMessage("Using local server\n");
        }
        game_manager.showMessage("Connecting to server");

        let p = game_socket.connect(options);
        await p;
        game_manager.showMessage(": Success\n");

        p.then(server_response => {
            assert(server_response.player_id);
            assert(server_response.group_id);
            assert(server_response.group_state);
  
            set_group_id(server_response.group_id);

            game_manager.receiveState(null, server_response.group_state);

            let default_name = game_socket.getPlayerName(server_response.player_id);
            elems.name.placeholder = default_name;

            elems.connection_setup.style.display = "none";
            elems.connection_established.style.display = "initial";
        })
    } catch (err) {
        //console.log("connect_to_server failed:", err);

        if (err instanceof PromiseTimeout) {
            game_manager.showMessage(": Timed out\n");
        } else {
            console.log(err);
            game_manager.showMessage(`: ${err.name}\n${err.message}\n`)
        }
    }
}

elems.plus_button.addEventListener("click", () =>
    game_socket.sendState(number_state(get_number() + 1)));

elems.minus_button.addEventListener("click", () =>
    game_socket.sendState(number_state(get_number() - 1)));

elems.chat_send.addEventListener("click", () => {
    let message = elems.chat_text.value.trim();
    if (message != "") {
        game_socket.sendTranscient({ chat: message });
    }
    elems.chat_text.value = "";
});

elems.connect.addEventListener("click", function (event) {
    event.preventDefault();
    connect_to_server(group_id(), test_mode());
});

elems.participant_link.addEventListener("click", function (event) {

    navigator.clipboard.writeText(new_player_link()).then(function () {
        game_manager.showMessage('Link copied to clipboard\n');
    }, function (err) {
        game_manager.showMessage(err);
    });
});

elems.name.addEventListener("change", function (event) {
    let player_id = game_socket.playerId();
    let name = this.value;
    //console.log("name change", player_id, name);
    game_socket.setPlayerName(player_id, name);
});

elems.disconnect.addEventListener("click", function (event) {
    game_socket.disconnect();
    game_manager.showMessage("Disconnected\n");
    set_group_id(null);
    elems.connection_setup.style.display = "initial";
    elems.connection_established.style.display = "none";
});

startup();

