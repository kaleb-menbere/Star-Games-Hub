/*jshint:false */

// Cordova app never returns 200 status when completing ajax requests. This ensures that it does.
(function() {
  // if we are loading files from file:///
  var isCordova = /^file:\/{3}[^\/]/i.test(window.location.href);

  if (isCordova) {
    // inside a cordova app, the status property will be 0 becauase of the path `file:///`
    XMLHttpRequest.prototype._status = 0;
    Object.defineProperties(window.XMLHttpRequest.prototype, {
      status: {
        get: function() {
          // once the request is done (readyState === 4), we assume the status is 200, NOT 0
          return this.readyState === 4 && !this._status ? 200 : this._status;
        },
        set: function(value) {
          this._status = value;
        }
      }
    });
  }

})();

var GAME_WRAPPER = (function(){

  var client = (function(){
    var cl = {
      ltIE10: null
    };

    cl.ltIE10 = document.documentElement.className.indexOf("lt-ie10") >= 0;

    return cl;
  })();

  return {
    client: client
  };
})();

/*
Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/
(function(root,factory){'use strict';factory((root.Uatu={}));}((typeof window==='object'&&window)||this,function(Uatu){'use strict';var messages={},lastUid=-1;function hasKeys(obj){var key;for(key in obj){if(obj.hasOwnProperty(key)){return true;}}
return false;}
function throwException(ex){return function reThrowException(){throw ex;};}
function callSubscriberWithDelayedExceptions(subscriber,message,data){try{subscriber(message,data);}catch(ex){setTimeout(throwException(ex),0);}}
function callSubscriberWithImmediateExceptions(subscriber,message,data){subscriber(message,data);}
function deliverMessage(originalMessage,matchedMessage,data,immediateExceptions){var subscribers=messages[matchedMessage],callSubscriber=immediateExceptions?callSubscriberWithImmediateExceptions:callSubscriberWithDelayedExceptions,s;if(!messages.hasOwnProperty(matchedMessage)){return;}
for(s in subscribers){if(subscribers.hasOwnProperty(s)){callSubscriber(subscribers[s],originalMessage,data);}}}
function createDeliveryFunction(message,data,immediateExceptions){return function deliverNamespaced(){var topic=String(message),position=topic.lastIndexOf('.'); deliverMessage(message,message,data,immediateExceptions); while(position!==-1){topic=topic.substr(0,position);position=topic.lastIndexOf('.');deliverMessage(message,topic,data);}};}
function messageHasSubscribers(message){var topic=String(message),found=Boolean(messages.hasOwnProperty(topic)&&hasKeys(messages[topic])),position=topic.lastIndexOf('.');while(!found&&position!==-1){topic=topic.substr(0,position);position=topic.lastIndexOf('.');found=Boolean(messages.hasOwnProperty(topic)&&hasKeys(messages[topic]));}
return found;}
function publish(message,data,sync,immediateExceptions){var deliver=createDeliveryFunction(message,data,immediateExceptions),hasSubscribers=messageHasSubscribers(message);if(!hasSubscribers){return false;}
if(sync===true){deliver();}else{setTimeout(deliver,0);}
return true;}
Uatu.publish=function(message,data){return publish(message,data,false,Uatu.immediateExceptions);};Uatu.publishSync=function(message,data){return publish(message,data,true,Uatu.immediateExceptions);};Uatu.subscribe=function(message,func){if(typeof func!=='function'){return false;}
if(!messages.hasOwnProperty(message)){messages[message]={};}

var token='uid_'+String(++lastUid);messages[message][token]=func; return token;};Uatu.clearAllSubscriptions=function clearSubscriptions(){messages={};};Uatu.unsubscribe=function(value){var isTopic=typeof value==='string'&&messages.hasOwnProperty(value),isToken=!isTopic&&typeof value==='string',isFunction=typeof value==='function',result=false,m,message,t,token;if(isTopic){delete messages[value];return;}
for(m in messages){if(messages.hasOwnProperty(m)){message=messages[m];if(isToken&&message[value]){delete message[value];result=value; break;}else if(isFunction){for(t in message){if(message.hasOwnProperty(t)&&message[t]===value){delete message[t];result=true;}}}}}
return result;};Uatu.watch=Uatu.on=Uatu.subscribe;Uatu.warn=Uatu.trigger=Uatu.publish;Uatu.ignore=Uatu.off=Uatu.unsubscribe;}));


;(function (win, d) {
  'use strict';
  var eventArray = ['game_start', 'game_continue', 'game_complete', 'game_failure', 'game_next_level', 'create_your_own'],
    evtLen = eventArray.length,
    cyoArray = [ 'cyo_start', 'cyo_gender_selection', 'cyo_pose_selection', 'cyo_costume_selection', 'cyo_tool', 'cyo_stickers', 'cyo_backgrounds', 'cyo_downloads', 'cyo_shares', 'cyo_restart'],
    cyoLen = cyoArray.length,
    cyoProps = {
      'cyo_start':'cyo_has_existing',
       'cyo_gender_selection':'cyo_gender',
       'cyo_pose_selection':'cyo_pose',
       'cyo_costume_selection':'cyo_costume',
       'cyo_tool':'cyo_tool',
       'cyo_stickers':'cyo_sticker',
       'cyo_backgrounds':'cyo_background'
    },
    gamePath = window.location.pathname,
    gameMatch = gamePath.match(/(?:.*marvel(hq|kids)\/)(.*)/),
    gameName = gameMatch && gameMatch.length && gameMatch[2];

  function gameSuffix () {
    try {
      var suffixMap = [
        { name: 'av_ironman_cyo', suffix: '_IMS' },
        { name: 'gg_cyo',         suffix: 'GOTG' }
      ];
        
      if (window.heromaker_suffix) {
        return window.heromaker_suffix;
      } else {
        return suffixMap.filter(function (game) {
          return gameName.match(game.name);
        })[0].suffix;
      }
    } catch(e) {
      window.console.log('No suffix found.');
    }
  }

  function callback(evt, data){
    data.event_name = data.type || evt;
    win.parent.postMessage(data, '*');
  }

  function cyoCallback(evt, data){
    //Forces call to `create_your_own` event.
    var props = {
      gender : data.cyo_gender || 'gender null',
      pose : data.cyo_pose || 'pose null',
      section : data.cyo_section || 'section null',
      costume : data.cyo_costume || 'costume null'
    },
    LMT = ' | ';

    data.cyo_event = evt; //cyo_event is placeholder for "actual" event. `create_your_own` is just the postMessage trigger.
    if(cyoProps.hasOwnProperty(evt)){

      switch(evt) {
        case 'cyo_gender_selection':
        data.cyo_gender = props.gender;
        break;

        case 'cyo_pose_selection':
        data.cyo_pose = [props.gender, props.pose].join(LMT);
        break;

        case 'cyo_costume_selection':
        data.cyo_costume = [props.gender, props.pose, props.section, props.costume].join(LMT);
        break;

        case 'cyo_start':
        data.cyo_has_existing = localStorage.getItem('heromaker.PROGRESS_SCREEN_INDEX' + '_' + gameSuffix()) ? 'true | returning visitor' : 'false | new visitor';
        break;
      }

      for(var key in data){
        if(data.hasOwnProperty(key) && typeof(data[key]) === 'string'){
          data[key] = data[key].toLowerCase();
        }
      }

      data.create_your_own = data[cyoProps[evt]]; //Catch-all for CYO events. Everything is feeding into one evar.
    }

    callback('create_your_own', data);
  }

  while(evtLen--){
    Uatu.watch(eventArray[evtLen], callback);
  }

  while(cyoLen--){
    Uatu.watch(cyoArray[cyoLen], cyoCallback);
  }

/*
Iframe fixes
IE10, and curiously only IE10, have focus issues with iframes.
*/
    if (win.top !== win && document.documentMode && document.documentMode >= 10){
        win.addEventListener('click',function(){
          d.body.focus();
        });

        d.addEventListener('DOMContentLoaded',function(){
            //Body is not *supposed* to support focus, but can with a tabindex set. Even -1, apparently.
            d.body.setAttribute('tabindex',-1);
            d.body.focus();
        });
    }
    win.addEventListener('message', function (e) {
        // Some game containers have the div container and some only have the Flash object in the body.
        var container, gameEls;
        function getElsByTagName (tagName) { // HTMLCollection to array.
          return Array.prototype.slice.call(d.getElementsByTagName(tagName));
        }
        function isCanvas (el) {
          return el.nodeName.toLowerCase() === 'canvas';
        }
        function setTabIndex (el) {
          return el.setAttribute('tabindex', 0);
        }

        if (/\.marvelkids\.com/.test(e.origin) && e.data === 'focusGame') {
          gameEls = getElsByTagName('object').concat(getElsByTagName('canvas'));
          if (gameEls.length) {
            if (gameEls.every(isCanvas)) {
              gameEls.map(setTabIndex); // Canvas must have tabindex to use focus event.
            }
            gameEls[0].focus();
          }
        }
    });
}(this, this.document, undefined));
