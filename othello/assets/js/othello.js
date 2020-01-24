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