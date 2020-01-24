$("td").click(function(){
    var content = $(this).children("div").first();
    if(content.hasClass("counter"))
    {
        content.toggleClass("player2");  
    }
    else
    {
        content.addClass("counter");
    }
})

function make_squares()
{
    $("td").css("height", function () {
        return $(this).css("width");
    });
    console.log("running make_squares");
}

make_squares();

$( window ).resize(make_squares);

