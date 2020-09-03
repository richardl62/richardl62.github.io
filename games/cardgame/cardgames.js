var $container = document.getElementById('container')

// create Deck
var deck = Deck();

// add to DOM
deck.mount($container);

deck.cards.forEach(function (card, i) {
    card.setSide(Math.random() < 0.5 ? 'front' : 'back');

    // explode
    card.animateTo({
        delay: 1000 + i * 2, // wait 1 second + i * 2 ms
        duration: 500,
        ease: 'quartOut',

        x: Math.random() * window.innerWidth - window.innerWidth / 2,
        y: Math.random() * window.innerHeight - window.innerHeight / 2
    });
});