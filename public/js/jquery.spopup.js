/*
 * easy and simple jquery popup 
 * spopup v1
 * @author spirityy109@gmail.com
 */

;(function($){
	'use strict';

    $.fn.spopup = function(options,callback){
        
        if($.isFunction(options)){
            callback 		= options;
            options 		= null;
        }

        var o = $.extend({},$.fn.spopup.defaults,options);

        var $spopup = this;
        var $mask = $('<div class="spopup-mask"></div>');

        return $spopup.each(function(){
            if($(this).data('exist')) return;
            init();
        })

        function init(){
            if(o.onOpen) o.onOpen.call($spopup);
            $spopup.css({
                'width':o.width,
                'position':o.positionStyle,
                'left':o.position[0],
                'top':o.position[1],
                'z-index':o.zindex
            });
            recenter();
            render();
            resize();
            $spopup.find('.'+o.closeClass).click(function(){
                close();
            })
            if(o.autoClose) {
                setTimeout(function(){
                    close(); 
                },o.autoClose);
            }
            if(o.onComplete) o.onComplete.call($spopup);
            if(callback) callback.call($spopup);
        }

        function recenter(){
            $spopup.css({
                'left':$(window).width()/2-$spopup.width()/2,
                'top':o.mtop
            })
        }

        function render(){
            if(o.ismasking) masking();
             $spopup.appendTo('body').show();
        }

        function masking(){
            $mask.css({
                'width':'100%',
                'height':$(document).height(),
                'background-color':o.maskcolor,
                'position':o.positionStyle,
                'z-index':o.zindex-1,
                'left':0,
                'top':0,
                'opacity':o.maskopacity
            }).appendTo('body');
        }

        function resize(){
            $(window).resize(function(){
                recenter();        
            });
        }

        function close(){
            $spopup.hide();
            $mask.hide();
            if(o.onClose) o.onClose.call($spopup);
        }
    }

    $.fn.spopup.defaults = {
        mtop:'30%',
        width:'50%',
        appendTo:'body',
		speed:250,
        autoClose:false,
        closeClass:'p-close',
        positionStyle:'absolute',
        position:['auto', 'auto'],
        ismasking:true,
        maskcolor:'#000',
        maskopacity:'0.7',
        zindex:9999,
        onClose:function(){},
        onOpen:function(){},
        onComplete:function(){}
    }

})(jQuery);
