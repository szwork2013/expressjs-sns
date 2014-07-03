window.loadimg = function(url,callback){
    var img = $("<img />").attr('src',url).load(function(){
        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                return false;
            } else {
                callback(this);
            }
    }); 
    return img;
}
