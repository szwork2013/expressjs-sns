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


        function init(){
            if(o.onOpen) o.onOpen.call($spopup);
            $spopup.css({
                'width':o.width,
                'height':o.height,
                'position':o.positionStyle,
                'left':o.position[0],
                'top':o.position[1],
                'z-index':o.zindex
            });

            render();

            if(o.iscenter) recenter();

            $(window).on('scroll resize',function(){
                recenter(); 
            });

            $spopup.find('.'+o.closeClass).click(function(){
                close();
            });

            if(o.autoClose) {
                setTimeout(function(){
                    close(); 
                },o.autoClose);
            }
            if(o.onComplete) o.onComplete.call($spopup);
            if(callback) callback.call($spopup);

        }

        function recenter(){
            var mt = 0;
            if($('body').scrollTop()+o.marginTop+$spopup.height()>$('.main').height()+$('footer').height()){
                mt=$('.main').height()+$('footer').height()-$spopup.height(); 
            }else{
                mt=$('body').scrollTop()+o.marginTop;
            }
            $spopup.css({
                'left':$(window).width()/2-$spopup.outerWidth()/2,
                'top':mt,
                'background':o.bgcolor || '#fff'
            })
        }

        function render(){
            if(o.ismasking) masking();
             $spopup.appendTo($(o.appendDom)).show();
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
            }).appendTo($(o.appendDom));

            if(o.clickClose){
                $mask.click(function(){
                    close(); 
                })
            }
        }

        function close(){
            $spopup.hide();
            $mask.hide();
            if(o.isRemove){
                $spopup.remove();
                $mask.remove();
            }
            if(o.onClose) o.onClose.call($spopup);
        }

        //public method
         $spopup.close = function(){
                close();
         }

        return $spopup.each(function(){
            init();
        })
    }

    $.fn.spopup.defaults = {
        width:'50%',
        height:'auto',
        appendDom:'.main',
        marginTop:100,
        appendTo:'body',
		speed:250,
        autoClose:false,
        clickClose:true,
        closeClass:'p-close',
        isRemove:true,
        positionStyle:'absolute',
        position:['auto', 'auto'],
        iscenter:true,
        ismasking:true,
        maskcolor:'#000',
        bgcolor:'#fff',
        maskopacity:'0.3',
        zindex:10001,
        onClose:function(){},
        onOpen:function(){},
        onComplete:function(){}
    }

})(jQuery);
