'use strict';
function make_div(str) {
    return "<div>" + str + "</div>";
}

function make_link(href, text) {
    if(!text) {
        text = href;
    }
    return `<a href="${href}">${text}</a>`;
}

class NetworkGameControl {
    constructor() {
        this.game_control = new GameControl();
        this.game_socket = new gameSocket(this);
        this.game_control.board.clickBoardSquare(
            square => this.square_clicked(square));
        
        // Members used in online play - set in connect
        this.group_id = null;
        this.url = null;
    }
    
    async connect(url) {
        assert(url instanceof URL);
        this.url = url;

        const urlParams = new URLSearchParams(url.search);
        const new_game = urlParams.get("new-game");
        const game_id = urlParams.get('game-id');
        if (new_game || game_id) {
            this.online_status(make_div("Connecting ..."));
            try {
                let data = await this.game_socket.connect(urlParams);
                this.group_id = data.group_id;

                this.online_status(make_div("Game ID: " + data.group_id) +
                make_link(this.participantLink(), "Participant link"));

                console.log(data.group_state);
                assert(data.group_state);
                this.setBoard(data.group_state);
            } catch (error) {
                console.log("Connect failed:", error);
                this.online_status(make_div("Connect failed: " + error.message));
            }
        } else {
            console.log("Offline play");
            this.online_status(make_div("Offline"));
        }
    }

    online_status(html) {
        //kludge?
        this.game_control.page_display.online_status(html); 
    }

    // return href which can be used to join this game, or null in original has
    // not been supplied
    participantLink() {
        let new_url = this.url;

        let searchParams = new_url.searchParams;
        searchParams.set("game-id", this.group_id);
        searchParams.delete("new-game");

        new_url.search = searchParams.toString();

        return new_url.href;
    }


    receiveData(player_id, state, info) {
        if (player_id) { // Ignore state that was sent locally
            if(state) {
                this.setBoard(state);
            }
        }
    }

    playerJoined() {
        // Do nothing for now
    }

    playerLeft() {
        // Do nothing for now
    }

    sendBoardState() {
        const state = {
            board: this.game_control.board_status(),
            current_player: this.game_control.current_player(),
        };

        this.game_socket.sendData(state, null/*info*/);
    }

    setBoard(state) {
        if (state.board) {
            this.game_control.board_status(state.board);
        }
        if (state.current_player) {
            this.game_control.current_player(state.current_player);
        }
    }

    square_clicked(square) {
        this.game_control.square_clicked(square);
        this.sendBoardState();
    }

    restart() {
        this.game_control.restart();
        this.sendBoardState();
    }
    undo() {
        this.game_control.undo();
        this.sendBoardState();
    }

    redo() {
        this.game_control.redo();
        this.sendBoardState();
    }

    next_player() {
        this.game_control.next_player();
        this.sendBoardState();
    }

    game_name(name) {this.game_control.game_name(name);}
    game_option(name) {this.game_control.game_option(name);}

    customise_mode() {this.game_control.customise_mode();}
    customise_mode(custom) {this.game_control.customise_mode(custom);}
    clear() {this.game_control.clear();}
    rows(n_rows) {this.game_control.rows(n_rows);}
    cols(n_cols) {this.game_control.cols(n_cols);}
    num_players(n_rows) {this.game_control.num_players(n_rows);}
    board_status() {this.game_control.board_status();}
    full_width() {this.game_control.full_width();}
}
