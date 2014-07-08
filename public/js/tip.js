window.Tip = function(html,cb){
    $('<div class="g-tip">'+html+'</div>').appendTo('body');
    setTimeout(function(){
        $('.g-tip').fadeOut(200,function(){
            this.remove(); 
        });
        if(cb) cb.call(this);
    },1000);
}
