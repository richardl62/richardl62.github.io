const score_pad_html = `
<input type="text" class="player-name" placeholder="Player name">
<input type="text" class="enter-score" placeholder="Enter score">
<div class="scores">
    <div class="current-score">Score<br></div>
    <div class="total-score">Total<br></div>
</div>
`

class scorePad {

    constructor(elem)
    {
        this.user_elem = $(elem);
        this.total_score = 0;

        this.user_elem.html(score_pad_html);
        this.user_elem.addClass("score-pad");

        this.player_name = this.user_elem.children(".player-name");
        this.enter_score = this.user_elem.children(".enter-score");
        this.current_score = this.user_elem.find(".current-score");
        this.total_score_elem = this.user_elem.find(".total-score");

        console.log(this.player_name, this.enter_score,
            this.current_score, this.total_score);
   

        var pad = this;
        this.enter_score.change(function() {
            pad.enter_score_text(this.value);
            this.value = "";
        });
    }

    enter_score_text(value /* text - typically a number, but can be text like e.g. '-' or 'pass' */)
    {
        var score = parseInt(value);
        if (!isNaN(score)) {
            this.total_score += score;
            this.current_score.append(score + "<br>");
        }
        else {
            this.current_score.append(value + "<br>");
        }
        
        this.total_score_elem.append(this.total_score + "<br>");
    }

    defaultPlayerName(name) {
        this.player_name.attr("placeholder", name);
    }
}

class scorePads {

    constructor(elem)
    {
        this.user_elem = $(elem);
        this.user_elem.addClass("score-pads");
    }

    n_players(n_players)
    {
        if(n_players === undefined)
        {
            return this.score_pads.length();
        }

        this.score_pads = new Array(n_players);
        for(var i = 0; i < n_players; i++)
        {
            var node = $("<div></div>");
            this.user_elem.append(node);
            this.score_pads[i] = new scorePad(node); 
            this.score_pads[i].defaultPlayerName("Player " + (i+1)); 
        }
    }

    reset()
    {
        this.score_pads.forEach(elem => elem.reset());
    }
}




