'use strict';

class NetworkGameControl {
    constructor() {
        this.game_control = new GameControl();
        this.game_socket = new gameSocket(this);
        this.game_control.board.clickBoardSquare(
            square => this.square_clicked(square));
    }
    

    async connect(urlParams) {
        const new_game = urlParams.get("new-game");
        const game_id = urlParams.get('game-id');
        if (new_game || game_id) {
            this.online_status("Connecting ...");
            try {
                let data = await this.game_socket.connect(urlParams);
                this.online_status("Connected: Game ID " + data.group_id);

                console.log(data.group_state);
                assert(data.group_state);
                this.setBoard(data.group_state);
            } catch (error) {
                console.log("Connect failed:", error);
                this.online_status("Connect failed: " + error.message);
            }
        } else {
            console.log("Offline play");
            this.online_status("Offline");
        }
    }

    online_status(...args) {
        //kludge?
        this.game_control.page_display.online_status(...args); 
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

    game_name(name) {this.game_control.game_name(name);}
    game_option(name) {this.game_control.game_option(name);}

    next_player() {this.game_control.next_player();}
    customise_mode() {this.game_control.customise_mode();}
    customise_mode(custom) {this.game_control.customise_mode(custom);}
    clear() {this.game_control.clear();}
    rows(n_rows) {this.game_control.rows(n_rows);}
    cols(n_cols) {this.game_control.cols(n_cols);}
    num_players(n_rows) {this.game_control.num_players(n_rows);}
    board_status() {this.game_control.board_status();}
    full_width() {this.game_control.full_width();}
}
