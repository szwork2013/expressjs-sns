var express = require('express');
var async =  require('async');
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Board = mongoose.model('Board');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Collect = mongoose.model('Collect');
var moment =  require('moment');
var gm = require( 'gm' );
var path = require( 'path' );
var fs = require( 'fs' );

function GetTopicTemplete(topics,callback){
        var n_topics = [];
        async.eachSeries(topics,function(topic,cb){
            User.findOne({_id:topic.author_id},function(err,user){
                User.findOne({_id:topic.last_reply},function(err,replyuser){
                    if(!user) return cb();
                    var temp_topic = topic.toObject();
                    temp_topic.author_name = user.name;
                    temp_topic.author_url = user.url;
                    temp_topic.author_avatar_url = user.avatar_url_s;
                    temp_topic.last_reply_name = replyuser?replyuser.name:'';
                    temp_topic.create_date_format = topic.create_date_format;
                    temp_topic.create_date_fromnow = topic.create_date_fromnow;
                    temp_topic.last_reply_date_format = topic.last_reply_date_format;
                    n_topics.push(temp_topic);
                    cb();
                });
            });
        },function(err){
            callback(n_topics);
        });
}

function BuildReplyItem(origin,user){
    if(!user) return;
    var temp = {};
    temp = origin.toObject();
    temp.create_date_format = origin.create_date_format;
    temp.author_name = user.name;
    temp.author_signature = user.signature?user.signature:null;
    temp.author_url = user.url;
    temp.avatar_url_s = user.avatar_url_s;
    return temp;
}

function BuildPager(cur,total,pager_num){
        var pager = {},pagernums_length = 6,pagenum_start=0;
        pager.total=total;
        if(total<=pager_num) return null;
        var pagertotalnum = Math.ceil(total/pager_num);
        pager.cur = parseInt(cur);
        pager.prev = parseInt(cur)-1===0?null:parseInt(cur)-1;
        pager.next = parseInt(cur)+1>pagertotalnum?null:parseInt(cur)+1;
        pager.pagenums=[];

        //初始化
        var pagenum_start = 0;
        var pagenum_stop = Math.min(pagernums_length,pagertotalnum);

        //计算第一页偏移量
        if(pagernums_length<pagertotalnum && parseInt(cur)>pagernums_length/2){
            var startoffset = parseInt(cur)-pagernums_length/2;
            pagenum_start+=startoffset;
            pagenum_stop+=startoffset;
        }
        //计算是否接近最后一页,并向前推移
        if(pagernums_length<pagertotalnum && parseInt(cur)+pagernums_length/2>pagertotalnum) {
            var lastoffset = parseInt(cur)+pagernums_length/2-pagertotalnum;
            pagenum_start-=lastoffset;
            pagenum_stop-=lastoffset;
        }
        for(var i=pagenum_start;i<pagenum_stop;i++){
            if(parseInt(cur)===i+1){
                pager.pagenums.push({curnum:i+1});
                continue;
            }
            pager.pagenums.push({num:i+1});
        }
        return pager;
}

module.exports.GetTopicTemplete = GetTopicTemplete;
module.exports.BuildPager = BuildPager;
module.exports.BuildReplyItem = BuildReplyItem;
