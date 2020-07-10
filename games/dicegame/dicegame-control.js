'use strict';

class currentPlayerControl {
    //KLUDGE: Mix of callbacks and 'ordinary' functions

    constructor() {
        this.current_player = null;

        Object.seal(this);
    }

    set_current_player(player_no) {
        assert(typeof player_no == "number");

        this.current_player = player_no;

        //console.log("current player: ", player_no);

        score_pads.score_expected("all", false);
        score_pads.allow_partial_scores("all", false);

        score_pads.score_expected(player_no, true);
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

    // Used below
    dice_rolled() {
        assert(this.current_player !== null);

        score_pads.allow_partial_scores(this.current_player, true);
    }
}


class DicegameControl {
    constructor (dice_set_elem, score_pads_elem) {
        this.game_support = new GameSupport();
        this.dice_set = new diceSet(dice_set_elem);
        this.score_pads = new scorePads(score_pads_elem);

        this.current_player_control = new currentPlayerControl;
        this.score_pads.set_score_callback(current_player_control);
    }

    n_dice(num_dice) {
        this.dice_set.n_dice(num_dice);
    }

    n_player(num_players) {
        this.score_pads.n_players(num_players);
        this.current_player_control.set_current_player(0);
    }

    restart() {
        dice_set.initialise_all();
        score_pads.resetScores()
        current_player_control.set_current_player(0);
    }

    shuffle_player_names() {
        dice_set.shuffle_player_names();
    }

    roll_all() {
        dice_set.roll_unheld();
        current_player_control.dice_rolled();
    }

    roll_unheld() {
        dice_set.roll_unheld();
        current_player_control.dice_rolled();
    }
}