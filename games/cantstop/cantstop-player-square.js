'use strict';

const sq_empty = 0;
const sq_provisonally_precommitted = 1;
const sq_precommitted = 2;
const sq_committed = 3;
const sq_in_owned_column = 4; // Used when the column is filled by any player.

function validStatus(state) {
    return typeof state == "number" &&  Number. isInteger(state) &&
     state >= sq_empty && state <= sq_in_owned_column; 
}

// Record the status in a board square for a particular player
class CantStopPlayerSquare {
    constructor(input_elem, player_number, board) {

        this.player_elem = $("<div class='cs-player-square'></div>");
        input_elem.append(this.player_elem);


        let css = {};

        if (player_number == 0)
            css["borderLeft"] = "none";
        css["borderRight"] = "none";
        css["borderBottom"] = "none";
        css["borderTop"] = "none";

        this.player_elem.css(css);

        this.precommit_elem = null;

        this.player_number = player_number;
        this.status = sq_empty;

        this.player_elem.click(elem => board.player_square_clicked(this));
    }

    remove_added_elements() {
        if (this.player_elem) {
            this.player_elem.remove();
            this.player_elem = null;
        }
    }

    clear() {
        //assert((this.precommit_elem == null) == (this.status == sq_empty));
        if (this.precommit_elem) {
            this.precommit_elem.remove();
            this.precommit_elem = null;
        }
        this.player_elem.css("background-color", "var(--games-board-background-colour)");
        this.status = sq_empty;
    }

    make_provisional_precommitted() {
        this.make_precommit();
        this.precommit_elem.addClass("cs-provisional-precommit");

        this.status = sq_provisonally_precommitted;
    }

    make_precommit() {
        this.clear();

        this.precommit_elem = $("<div>");
        this.precommit_elem.addClass("cs-precommit");
        this.player_elem.append(this.precommit_elem);

        this.status = sq_precommitted;
    }

    make_commit() {
        this.clear();

        this.player_elem.css("background-color", get_cantstop_player_color(this.player_number));
        this.status = sq_committed;
    }

    make_in_owned_column() {
        this.status = sq_in_owned_column;
    }

    is_owned() {
        return this.status == sq_in_owned_column;
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
                this.clear();
            } else if (input_state == sq_provisonally_precommitted) {
                this.make_provisional_precommitted();
            } else if (input_state == sq_precommitted) {
                this.make_precommit();
            } else if (input_state == sq_committed) {
                this.make_commit();
            } else if (input_state == sq_in_owned_column) {
                this.make_in_owned_column();
            } else {
                assert(false);
            }
        }
    }
}
