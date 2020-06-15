'use strict';

class NetworkGameControl {
    constructor() {
        this.game_control = new GameControl();
        this.game_socket = new gameSocket(this);
        this.game_control.board.clickBoardSquare(
            square => this.square_clicked(square));
    }
    

    async connect(urlParams) {
        this.online_status("Connecting ...");
        try {
            let data = await this.game_socket.connect(urlParams);
            this.online_status( "Connected: Game ID " +  data.group_id);
        } catch (error) {
            console.log("Connect failed:", error);
            this.online_status("Connect failed: " + error.message);
        } 
    }

    online_status(...args) {
        //kludge?
        this.game_control.page_display.online_status(...args); 
    }


    receiveTranscient(player_id, data) {
        alert(`Uxpected transcient data received - ${player_id} - ${data}`)
    }

    receiveState(player_id, data) {
        if (player_id) { // Ignore state that was sent locally
            if (data.board) {
                this.game_control.board_status(data.board);
            }
            if (data.current_player) {
                this.game_control.current_player(data.current_player);
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
        this.game_socket.sendState({
            board: this.game_control.board_status(),
            current_player: this.game_control.current_player(),
        });
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
