'use strict';

const sq_empty = -1;
const sq_provisonally_precommitted = -2;
const sq_precommitted = -3;
const sq_committed = -4;

// A status of x >= 0 indicates that the square is owned by player x.
function is_owned_by(status) {
    return status >= 0 ? status : null;
}
function make_owning_status(owning_player) {
    return owning_player;
}

class CantStopPlayerSquare {
    constructor(board_square, player_number, board) {
        this.player_elem = $('<div></div>');
        this.player_elem.addClass('cs-player-square');
        
        if (player_number == 0)
            this.player_elem.addClass('cs-player0-square');
        
        this.player_elem.click(elem => board.player_square_clicked(this));
        
        board_square.append(this.player_elem);
        this.precommit_elem = null;

        this.player_number = player_number;
        this.status = sq_empty;
    }


    // Return to the starting state
    reset() {
        if (this.precommit_elem) {
            this.precommit_elem.remove();
            this.precommit_elem = null;
        }

        this.player_elem.removeClass('cs-owned-player-square'); 
        this.player_elem.css("background-color", "var(--games-board-background-colour)");
        this.status = sq_empty;
    }

    make_provisional_precommitted() {
        this.make_precommit();
        this.precommit_elem.addClass("cs-provisional-precommit");

        this.status = sq_provisonally_precommitted;
    }

    make_precommit() {
        this.reset();

        this.precommit_elem = $("<div>");
        this.precommit_elem.addClass("cs-precommit");
        this.player_elem.append(this.precommit_elem);

        this.status = sq_precommitted;
    }

    make_commit() {
        this.reset();

        this.player_elem.css("background-color", get_cantstop_player_color(this.player_number));
        this.status = sq_committed;
    }

    make_owned_by(owning_player) {
        assert(typeof owning_player == "number");
        this.reset();

        this.status = make_owning_status(owning_player);

        this.player_elem.addClass('cs-owned-player-square');
        this.player_elem.css("background-color", get_cantstop_player_color(owning_player));
    }

    is_owned_by() {
        return is_owned_by(this.status);
    }

    is_owned() {
        return this.is_owned_by() != null;
    }

    is_provisional_precommit() {
        return this.status == sq_provisonally_precommitted;
    }

    is_precommitted() {
        return this.status == sq_precommitted || this.status == sq_provisonally_precommitted;
    }

    is_committed() {
        return this.status == sq_committed;
    }

    is_empty() {
        return this.status == sq_empty;
    }

    elem() {
        return this.player_elem;
    }

    state(input_state) {
        if (input_state == undefined) {
            return this.status;
        }
        else {
            if (input_state == sq_empty) {
                this.reset();
            } else if (input_state == sq_provisonally_precommitted) {
                this.make_provisional_precommitted();
            } else if (input_state == sq_precommitted) {
                this.make_precommit();
            } else if (input_state == sq_committed) {
                this.make_commit();
            } else if (is_owned_by(input_state) != null) {
                this.make_owned_by(is_owned_by(input_state));
            } else {
                assert(false);
            }
        }
    }
}
