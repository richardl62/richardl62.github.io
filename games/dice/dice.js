'use strict';

const dot_patterns = [
    , //0
    [3], // 1
    [0, 6], // 2;
    [0, 3, 6], // 3
    [0, 2, 4, 6], // 4
    [0, 2, 3, 4, 6], // 5
    [0, 1, 2, 4, 5, 6] // 6
];
const n_dice_dots = 7;
class dice {
    constructor(input_elem)
    {
        $(input_elem).addClass("dice");
        this.dots = new Array(n_dice_dots);
        for (var i = 0; i < n_dice_dots; ++i)
        {
            var node = $("<div></div>");
            $(input_elem).append(node);
            node.addClass("dice-spot");
            node.addClass("spot" + i);

            this.dots[i] = node;  
        }
    }

    number(num) {
        // Kludge? Hid all the dots, then make selected dots visible
        if(num === undefined)
        {
            return this.num;
        }

        this.num = num;

        const dots_to_show = dot_patterns[num];
        for(var dn = 0; dn < n_dice_dots; ++dn)
        {
            var vis = dots_to_show.includes(dn) ? "visible" : "hidden";
            this.dots[dn].css("visibility", vis);
        }
    }

    roll()
    {
        var num = Math.floor((Math.random() * 6) + 1);
        this.number(num);
    }
}

// dice with a 'hold' option. The option is just cosmetic in that it does not
// affect roll function.  This class is intended for use as part of a diceSet.
class holdableDice extends dice 
{
    constructor(elem)
    {
        var raw_dice_elem = document.createElement("div");
        super(raw_dice_elem);

        this.input_elem = elem;

        this.top_elem = $(elem);
        this.dice_elem = $(raw_dice_elem);
        this.hold_elem = $(document.createElement("div"));

        this.hold_elem.addClass("hold-text");
        this.hold_elem.text("Held");
  
        $(elem).append(this.dice_elem, this.hold_elem);

        this.hold(false); // the default
    }

    hold(on_off)
    {
        if(on_off === undefined)
        {
            return this.held;
        }
        else
        {
            this.held = on_off;
            this.dice_elem.toggleClass("dice-held", on_off);


            this.hold_elem.css("visibility", 
                on_off ? "visible" : "hidden"
            );
        }
    }

    // Set a click callback.
    click(callback)
    {
        this.top_elem.click(() => callback(this));
    }
}

class diceSet {
    constructor(
        elem /* div or similar to hold the dice */,
        n_dice) 
        {
        this.dice_set = new Array(n_dice);
        for (var i = 0; i < n_dice; ++i) {
            var node = document.createElement("div");
            elem.appendChild(node);

            this.dice_set[i] = new holdableDice(node);
            this.dice_set[i].number(i + 1);
            this.dice_set[i].click(die => die.hold(!die.hold()));
        }
    }

    roll_all()
    {
        this.dice_set.forEach(die => {die.roll(); die.hold(false);});
    }

    
    roll_unheld() 
    {
        var held = [];

        for (var pos = 0; pos < this.dice_set.length; ++pos) 
        {
            var die = this.dice_set[pos];

            if (die.hold()) {
                held.push(die.number());
            }
        }

        held.sort();

        for (var pos = 0; pos < this.dice_set.length; ++pos) 
        {
            var die = this.dice_set[pos];
            
            if (pos < held.length) {
                die.number(held[pos]);
                die.hold(true);
            }
            else {
                die.roll();
                die.hold(false);
            }

        }
    }
 
    die(num) {return this.dice_set[num];}

    n_dice() {return this.dice_set.length;}
}

var dice_set = new diceSet(document.getElementById("dice-set"), 6);

dice_set.die(0).hold(true); // TEMPORARY - to help with testing
dice_set.die(3).hold(true); // TEMPORARY - to help with testing
dice_set.die(4).hold(true); // TEMPORARY - to help with testing
dice_set.roll_unheld();

$("#roll-all").click(() => dice_set.roll_all());
$("#roll-unheld").click(() => dice_set.roll_unheld());

function reset()
{
    for (var pos = 0; pos < dice_set.n_dice(); ++pos) 
    {
        var die = dice_set.die(pos);
        die.number((pos % 6) + 1);
        die.hold(false);
    }
}
$("#restart").click(reset);


var options_shown;
function show_options(show)
{
    options_shown = show;
    $("#options-button").toggleClass("pressed-button", show);
    $("#options-menu").toggle(show);
}

$("#options-button").click(() => show_options(!options_shown));
 
show_options(true);
reset();

