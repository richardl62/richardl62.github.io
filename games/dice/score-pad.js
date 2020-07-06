"use strict";

function div_with_title_and_text(text) {
    let div = $("<div>");
    div.text(text); // jQuery makes the text safe for use in html.
    div.attr("title", text);
    return div;

}


const score_placeholder_default = "Enter score";
const score_placeholder_with_partials = "Total score";

const score_pad_html = `
<input type="text" class="player-name">

<input type="text" class="enter-partial-score" placeholder="Partial score">
<input type="text" class="enter-score" placeholder="${score_placeholder_default}">
<div class="score-finished-div" > <!-- Outer div helps with formatting borders -->
    <input type="button" class="score-finished" value="Finished">
</div>
<div class="scores">
    <div class="current-score"></div>
    <div class="total-score"></div>
</div>
`

class scorePad {

    constructor(elem, player_no, callbacks)
    {
        this.player_no = player_no;

        if (callbacks) {
            assert(typeof callbacks.score_entered == "function");
            assert(typeof callbacks.score_selected == "function");
            this.callbacks = callbacks;
        }

        this.user_elem = $(elem);
        this.user_elem.html(score_pad_html);
        this.user_elem.addClass("score-pad");

        const find_elem = selector => {
            let found = this.user_elem.find(selector);
            if(found.length != 1)
                console.log(`${selector} matches ${found.length} elements`, found);
            return found;
        }

        this.player_name_elem = find_elem(".player-name");
        this.enter_partial_score_elem = find_elem(".enter-partial-score");
        this.enter_score_elem = find_elem(".enter-score");
        this.score_finished_button = find_elem(".score-finished");
        this.current_score_elem = find_elem(".current-score");
        this.total_score_elem = find_elem(".total-score");
        this.acculumated_partial_score = 0;

        this.score_finished_div_hidden = new SetHidden(find_elem(".score-finished-div"));
        this.enter_partial_score_hidden = new SetHidden(this.enter_partial_score_elem);

        this.resetScores();
        
        Object.seal(this);
 
        if (player_no !== undefined) {
            const default_name = "Player " + (player_no + 1);
            this.player_name_elem.attr("placeholder", default_name);
        }
    
        // Eek. There are lots different triggers for entering the score.
        this.enter_score_elem.change(() => this.enter_score_from_elem());
        this.score_finished_button.click(()=>this.enter_score_from_elem()());

        this.enter_score_elem.keypress(event => {
            if (event.key == 'Enter') {
                this.enter_score_from_elem()
            }
        });

        var pad = this;
        this.enter_partial_score_elem.change(function() {
            let num = strictParseInt(this.value);
            if(isNaN(num)) {
                alert("Partial scores must be numbers");
            } else {
                pad.enter_partial_score(num);
            }
            this.value = "";
        });

        this.enter_score_elem.click(function() {
            if(pad.callbacks) {
                pad.callbacks.score_selected(pad.player_no);
            }
        });
    }

    player_name(...Args) {
        return this.player_name_elem.val(...Args);
    }

    score_expected(on_off) {
        if(!on_off) {
            this.enter_score_from_elem();
        }
        return this.user_elem.toggleClass("score-expected", on_off);
    }

    allow_partial_scores(allow) {
        this.enter_partial_score_hidden.hidden(!allow);

        // The score done button (and div) is shown only when a partial score
        // is entered.
        this.score_finished_div_hidden.hidden(true);

        this.enter_score_elem.attr("placeholder", allow ? 
            score_placeholder_with_partials : score_placeholder_default
        );
    }

    // The input text is typically a number, but can be text like e.g. '-' or 'pass' 
    // or '1235 bah!'
    enter_score_from_elem() {
        const input_text = this.enter_score_elem.val();
        this.enter_score_elem.val("");

        if (!input_text.trim()) {
            // Ignore string is emtpy other than whitespace.
            return;
        }

        let number = findAndParseInt(input_text);
        if (number instanceof Error) {
            alert(number.message);
        } else {
            if (number !== null) {
                this.total_score += number;
            }
            this.current_score_elem.append(div_with_title_and_text(input_text));
            this.total_score_elem.append(div_with_title_and_text(this.total_score));
            this.acculumated_partial_score = 0;

            if (this.callbacks) {
                this.callbacks.score_entered(this.player_no);
            }
        }
    }


    enter_partial_score(number) {
        assert(typeof number == "number");

        this.score_finished_div_hidden.off();
        this.acculumated_partial_score += number;
        this.enter_score_elem.val(this.acculumated_partial_score);
    }

    resetScores()
    {
        
        this.total_score = 0;

        // reseting the enter score elements is defensive.  They should never
        // be left with a value.
        this.enter_score_elem.val(""); 
        this.enter_partial_score_elem.val(""); 

        this.current_score_elem.html("<div class='score-column-header'>Score</div>"); 
        this.total_score_elem.html("<div class='score-column-header'>Total</div>"); 
    }
}

class scorePads {

    constructor(elem)
    {
        this.input_elem = elem;
        $(this.input_elem).addClass("score-pads");

        this.score_pads = [];
        this.callbacks = null;
    }

    n_players(n_players)
    {
        if(n_players === undefined)
        {
            return this.score_pads.length;
        }

        this.score_pads.forEach(pad => pad.user_elem.remove());

        this.score_pads = new Array(n_players);
        for(var player_no = 0; player_no < n_players; player_no++)
        {
            var node = $("<div></div>");
            $(this.input_elem).append(node);
            this.score_pads[player_no] = new scorePad(node, player_no, this.callbacks);
        }

        this.resetScores();
    }

    resetScores()
    {
        this.score_pads.forEach(elem => {
            elem.resetScores()
        });
    }

    score_pad_action(player, action) {
        if(player == "all") {
            this.score_pads.forEach(action);
        }
        else {
            assert(typeof player == "number");
            action(this.score_pads[player]);
        }
    }
    
    score_expected(player_no, on_off) {
        this.score_pad_action(player_no, sp => {
            sp.score_expected(on_off);
        });
    }

    allow_partial_scores(player_no, allow) {
        this.score_pad_action(player_no, sp => {
            sp.allow_partial_scores(allow);
        });
    }

    set_score_callback(cb) {
        assert(this.score_pads.length == 0);
        this.callbacks = cb;
    }

    shuffle_player_names()
    {
        // Show dummy name values for a short time before showing the shuffled
        // names. This is intended to make it clear that the shuffle has
        // happened in cases where the order does not change
        const delay = 500; //ms

        const n_players = this.score_pads.length;
        let names = new Array(n_players);

        for(let i = 0; i < n_players; ++i) {
            names[i] = this.score_pads[i].player_name();
            this.score_pads[i].player_name(" ");
        }

        setTimeout(() => {
            shuffleArray(names);
            for (let i = 0; i < n_players; ++i) {
                this.score_pads[i].player_name(names[i]);
            }
        }, delay);
    }


}




