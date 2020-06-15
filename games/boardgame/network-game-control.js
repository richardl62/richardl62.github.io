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
            this.game_control.page_display.online_status(data); 
            console.log("Connected", data);
        } catch (error) {
            console.log("Connect failed:", error);
            this.game_control.page_display.online_status(null,error); 
            alert("Connect failed: " + error.message);
        } 
    }


    receiveTranscient(player_id, data) {
        if(data.square_clicked) {
            let [row, col] = data.square_clicked;
            this.game_control.square_clicked(row, col);
        }
    }

    receiveState() {
        alert("unexpected state change");
    }

    playerJoined() {
        // Do nothing for now
    }

    playerLeft() {
        // Do nothing for now
    }

    square_clicked(square) {
        const row = square.getRow();
        const col = square.getCol();

        this.game_socket.sendTranscient({
            square_clicked: [row, col]
        });
    }


    game_name(name) {this.game_control.game_name(name);}
    game_option(name) {this.game_control.game_option(name);}
    restart() {this.game_control.restart();}
    undo() {this.game_control.undo();}
    redo() {this.game_control.redo();}
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