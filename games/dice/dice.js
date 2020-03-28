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
        super(elem);

        this.input_elem = elem;

        this.elem = $(elem);
    }

    hold(on_off)
    {
        if(on_off === undefined)
        {
            return this.elem.hasClass("dice-held");
        }
        else
        {
            return this.elem.toggleClass("dice-held", on_off);
        }
    }

}

const  n_dice = 6;
var dice_set = new Array(n_dice);


for(var i = 0; i < n_dice; ++i)
{
    var node = document.createElement("div");  
    document.getElementById("dice-set").appendChild(node); 
    dice_set[i] = new holdableDice(node);
    dice_set[i].number(i+1);
}

dice_set[0].hold(true);

$(".dice").click(function () {
    var die = dice_set.find(d => d.input_elem === this);

    die.hold(!die.hold());
});