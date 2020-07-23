"use strict";

function new_CantStopOnlineControl() {

    let control = new_CantStopControl();
    let networking = new OnlineGameSupport();

    
    class OnlineControl {

        roll() {
            control.roll();
        } 

        select_move_option(index) {
            control.select_move_option(index);
        }

        undo() {
            control.undo();
        }

        commit() {
            control.commit();
        }
        
        next_player() {
            control.next_player();
        }

        start_game(num_players) {
            control.start_game(num_players);
        }

        remove_player(player) {
            control.remove_player(player);
        }

        manual_filling_set(on) {
            control.manual_filling_set(on);
        }

        get current_player() {
            return control.current_player;
        }
    };


    return new OnlineControl();
}