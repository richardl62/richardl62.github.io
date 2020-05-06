"use strict";

function div_with_title_and_text(text) {
    let div = $("<div>");
    div.text(text); // jQuery makes the text safe for use in html.
    div.attr("title", text);
    return div;

}

const score_pad_html = `
<input type="text" class="player-name" placeholder="Player name">
<input type="text" class="enter-score" placeholder="Enter score">
<div class="scores">
    <div class="current-score"></div>
    <div class="total-score"></div>
</div>
`

class scorePad {

    constructor(elem)
    {
        this.user_elem = $(elem);

        this.user_elem.html(score_pad_html);
        this.user_elem.addClass("score-pad");

        this.player_name = this.user_elem.children(".player-name");
        this.enter_score = this.user_elem.children(".enter-score");
        this.current_score = this.user_elem.find(".current-score");
        this.total_score_elem = this.user_elem.find(".total-score");

        var pad = this;
        this.enter_score.change(function() {
            pad.enter_score_text(this.value);
            this.value = "";
        });

        this.resetScores();
    }

    // The input text is typically a number, but can be text like e.g. '-' or 'pass' 
    // or '1235 bah!'
    enter_score_text(input_text)
    {
        // Look for a numbers in the input string.
        let match = input_text.match(/-?\d+/g);
        if(match && match.length > 1) {
            alert('More than one number found in "'
              +input_text+'"');
        }
        else {
            if(match) {
                let number = parseInt(match);
                assert(!isNaN(number));
                this.total_score += number;
            }

            this.current_score.append(div_with_title_and_text(input_text));
            this.total_score_elem.append(div_with_title_and_text(this.total_score));
        }
    }

    resetScores()
    {
        this.total_score = 0;

        this.current_score.html("<div class='score-column-header'>Score</div>"); 
        this.total_score_elem.html("<div class='score-column-header'>Total</div>"); 
    }

    defaultPlayerName(name) {
        this.player_name.attr("placeholder", name);
    }
}

class scorePads {

    constructor(elem)
    {
        this.input_elem = elem;
        $(this.input_elem).addClass("score-pads");


        this.score_pads = [];
    }

    n_players(n_players)
    {
        if(n_players === undefined)
        {
            return this.score_pads.length();
        }

        this.score_pads.forEach(pad => pad.user_elem.remove());

        this.score_pads = new Array(n_players);
        for(var i = 0; i < n_players; i++)
        {
            var node = $("<div></div>");
            $(this.input_elem).append(node);
            this.score_pads[i] = new scorePad(node); 
            this.score_pads[i].defaultPlayerName("Player " + (i+1)); 
        }
    }

    resetScores()
    {
        this.score_pads.forEach(elem => elem.resetScores());
    }
}




