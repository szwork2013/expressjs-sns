function loadimg(url,callback){
    var img = $("<img />").attr('src',url).load(function(){
        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                return false;
            } else {
                callback(this);
            }
    }); 
    return img;
}

;(function($) {

  $.fn.asyncimg = function(threshold, callback) {

    var $w = $(window),
        th = threshold || 0,
        images = this,
        loaded;

    this.one("asyncimg", function() {
      source = this.getAttribute("datasrc");
      if (source) {
        this.setAttribute("src", source);
        if (typeof callback === "function") callback.call(this);
      }
    });

    function asyncimg() {
      loaded = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      }).trigger("asyncimg");
      images = images.not(loaded);
    }

    $w.on('scroll resize lookup', asyncimg);

    asyncimg();

    return this;

  };

})(window.jQuery);
