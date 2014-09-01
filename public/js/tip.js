window.Tip = function(html,type,cb,time){
    var type = type || 'default',
        time = time || 1000;
    if(typeof(type) == "function") cb = type;
    $('<div class="g-tip">'+html+'</div>').addClass(type).appendTo('body');
    setTimeout(function(){
        $('.g-tip').fadeOut(200,function(){
            this.remove();
        });
        if(cb) cb.call(this);
    },time);
}
