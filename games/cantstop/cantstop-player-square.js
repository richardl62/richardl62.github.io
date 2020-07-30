'use strict';

const sq_empty = 1;
const sq_provisonally_precommitted = 2;
const sq_precommitted = 3;
const sq_committed = 4;
const sq_owned = 5;

class CantStopPlayerSquare {
    constructor(board_square, player_number, board) {
        this.player_elem = $('<div></div>');
        this.player_elem.addClass('cs-player-square');
        
        if (player_number == 0)
            this.player_elem.addClass('cs-player0-square');

        board_square.append(this.player_elem);
        this.precommit_elem = null;

        this.player_number = player_number;
        this.status = sq_empty;

        Object.seal(this);
    }

    destroy() {
        this.player_elem.remove();
        this.remove_precommit_elem();
    }

    onClick(callback) {
        this.player_elem.click(() => {
            callback({
                player_number: this.player_number,
                square_empty: this.is_empty(),
            });
        });
    }

    remove_precommit_elem() {
        if (this.precommit_elem) {
            this.precommit_elem.remove();
            this.precommit_elem = null;
        }
    }

    // Return to the starting state
    reset() {
        this.remove_precommit_elem();

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

    make_owned() {
        this.reset();
        this.player_elem.addClass('cs-owned-player-square');
    }

    is_owned() {
        return this.status == sq_owned;
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
            } else if (input_state == sq_owned) {
                this.make_owned();
            } else {
                assert(false);
            }
        }
    }
}
