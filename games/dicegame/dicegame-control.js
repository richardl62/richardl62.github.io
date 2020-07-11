'use strict';

class currentPlayerControl {
    //KLUDGE: Mix of callbacks and 'ordinary' functions

    constructor(score_pads) {
        this.current_player = null;
        this.score_pads = score_pads;

        Object.seal(this);
    }

    set_current_player(player_no) {
        assert(typeof player_no == "number");

        this.current_player = player_no;

        //console.log("current player: ", player_no);

        this.score_pads.score_expected("all", false);
        this.score_pads.allow_partial_scores("all", false);

        this.score_pads.score_expected(player_no, true);
    }

    // Callback - but also used below (kludge?)
    score_selected(player_no) {
        if (this.current_player !== player_no) {
            this.set_current_player(player_no);
        }
    }

    // Callback
    score_entered(player_no) {
        const num_players = score_pads.n_players();

        // Re-use the callback above (kludge?)
        this.set_current_player((player_no + 1) % num_players);
    }

    // Callback
    dice_rolled() {
        assert(this.current_player !== null);

        this.score_pads.allow_partial_scores(this.current_player, true);
    }
}


class DicegameControl {
    constructor (dice_set_elem, score_pads_elem) {
        //this.game_support = new GameSupport();
        this.dice_set = new diceSet(dice_set_elem);
        this.score_pads = new scorePads(score_pads_elem);

        this.current_player_control = new currentPlayerControl(this.score_pads);
        //this.score_pads.set_score_callback(this.current_player_control);
    }

    n_dice(num_dice) {
        this.dice_set.n_dice(num_dice);
    }

    n_player(num_players) {
        this.score_pads.n_players(num_players);
        this.current_player_control.set_current_player(0);
    }

    restart() {
        this.dice_set.initialise_all();
        this.score_pads.resetScores()
        this.current_player_control.set_current_player(0);
    }

    shuffle_player_names() {
        this.dice_set.shuffle_player_names();
    }

    roll_all() {
        this.dice_set.roll_unheld();
        this.current_player_control.dice_rolled();
    }

    roll_unheld() {
        this.dice_set.roll_unheld();
        this.current_player_control.dice_rolled();
    }
}