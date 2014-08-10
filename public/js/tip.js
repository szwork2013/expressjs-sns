window.Tip = function(html,type,cb){
    var type = type || 'default';
    if(typeof(type) == "function") cb = type;
    $('<div class="g-tip">'+html+'</div>').addClass(type).appendTo('body');
    setTimeout(function(){
        $('.g-tip').fadeOut(200,function(){
            this.remove(); 
        });
        if(cb) cb.call(this);
    },1000);
}
