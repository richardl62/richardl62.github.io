const elems = {
    hand: document.getElementById('hand'),
};

// create Deck
var deck = Deck();

// Select the first card
var card = deck.cards[0];

// Add it to an html container
card.mount(elems.hand);

// Allow to move/drag it
card.enableDragging();

// Allow to flip it
card.enableFlipping();