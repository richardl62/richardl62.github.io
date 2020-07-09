'use strict';

class GridgamesControlOnline {
    constructor() {
        this.game_control = new GridgamesControl();
        this.game_socket = new gameSocket(this);
        this.game_control.board.clickBoardSquare(
            square => this.square_clicked(square));
        
        // Members used in online play - set in connect
        this.group_id = null;

        // Used until connect() is called.
        this.online_status("Offline");
    }
    
    async connect(url) {
        const urlParams = new URLSearchParams(url);
        if (urlParams.has('id')) {
            this.online_status("Connecting ...");
            try {
                const local = urlParams.get("local");
                const id = urlParams.get("id");
                const url = get_game_server(local);
                this.game_socket.connect(url);

                let data = await this.game_socket.joinGame(id);

                assert(data.state);
                assert(data.game_id);
                this.online_status("Online: Game ID " + data.game_id);

                // TO DO: Standardise on game_id
                this.group_id = data.game_id;

                console.log(data.state);

                this.setBoard(data.state);
            } catch (error) {
                console.log("Connect failed:", error);
                this.online_status("Connect failed: " + error)
            }
        }
    }

    online_status(message) {
        //kludge?
        this.game_control.page_display.online_status(
            `<div>${message}</div>`); 
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
