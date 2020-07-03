"use strict";

function div_with_title_and_text(text) {
    let div = $("<div>");
    div.text(text); // jQuery makes the text safe for use in html.
    div.attr("title", text);
    return div;

}

// Extract an number from the input string.  Return on of
// - null if no number is found
// - The number if exactly one number is found
// - An Error if more than one number is found
function extract_number_from_string(str) {
    // Look for a numbers in the input string.
    let match = str.match(/-?\d+/g);
    if (match && match.length > 1) {
        // Kludge: An alert might be always be apporpriate.
        return new Error('More than one number found in "'
            + input_text + '"');
    }

    if (match) {
        let number = parseInt(match);
        assert(!isNaN(number));

        return number;
    }

    return null;
}

const default_score_playholder = "Enter score";
const score_pad_html = `
<input type="text" class="player-name">
<input type="text" class="partial-score">
<input type="text" class="enter-score" placeholder="${default_score_playholder}">
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

        this.player_name_elem = this.user_elem.children(".player-name");
        this.partial_score_elem = this.user_elem.children(".partial-score");
        this.enter_score_elem = this.user_elem.children(".enter-score");
        this.current_score_elem = this.user_elem.find(".current-score");
        this.total_score_elem = this.user_elem.find(".total-score");
        this.acculumated_partial_score = 0;
        this.resetScores();
        
        Object.seal(this);
 
        if (player_no !== undefined) {
            const default_name = "Player " + (player_no + 1);
            this.player_name_elem.attr("placeholder", default_name);

            // Simulate placeholder, but use a value for ease of formatting
            // this.player_name_elem.val(default_name);
            // this.player_name_elem.click(function(event) {
            //     let jq_this = $(this);
            //     jq_this.val("");
            //     jq_this.unbind(event);
            // });
        }

        var pad = this;
        this.enter_score_elem.change(function() {
            pad.enter_score_text(this.value);
            this.value = "";
        });

        this.enter_score_elem.keypress(function (event) {
            if (event.key == 'Enter') {
                pad.enter_score_text(this.value);
                this.value = "";
            }
        });

        this.enter_score_elem.click(function() {
            if(pad.callbacks) {
                pad.callbacks.score_selected(pad.player_no);
            }
        });

        this.partial_score_elem.change(function() {
            let number = extract_number_from_string(this.value);
            if(typeof number == "number") {
                pad.enter_partial_score(number);
                this.value = null;
            }
        });
    }

    player_name(...Args) {
        return this.player_name_elem.val(...Args);
    }

    score_expected(on_off) {
        return this.user_elem.toggleClass("score-expected", on_off);
    }

    score_placeholder(message){
        return this.enter_score_elem.attr("placeholder", message);
    }

    allow_partial_scores(allow, placeholder) {
        this.partial_score_elem.css("display", allow ? "initial" : "none");
        this.partial_score_elem.attr("placeholder", placeholder);
    }

    // The input text is typically a number, but can be text like e.g. '-' or 'pass' 
    // or '1235 bah!'
    enter_score_text(input_text) {
        if (!input_text.trim()) {
            // Ignore string is emtpy other than whitespace.
            return;
        }

        let number = extract_number_from_string(input_text);
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

    enter_score(input_text) {
        assert(typeof number == "number");

        this.total_score += number;
        this.current_score_elem.append(div_with_title_and_text(input_text));
        this.total_score_elem.append(div_with_title_and_text(this.total_score));
        this.acculumated_partial_score = 0;
    }

    enter_partial_score(number) {
        assert(typeof number == "number");

        this.acculumated_partial_score += number;
        this.enter_score_elem.val(this.acculumated_partial_score);
    }

    resetScores()
    {
        this.total_score = 0;

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

    score_placeholder(player_no, message) {
        this.score_pad_action(player_no, sp => {
            sp.score_placeholder(message);
        });
    }
    allow_partial_scores(player_no, allow, placeholder) {
        this.score_pad_action(player_no, sp => {
            sp.allow_partial_scores(allow, placeholder);
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




