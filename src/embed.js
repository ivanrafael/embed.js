/*
 * embed-js - v4.1.3
 * A JavaScript plugin that analyses the string and embeds emojis, media, tweets, code and services.
 * http://riteshkr.com/embed.js
 *
 *   Made by Ritesh Kumar
 *   Under MIT License
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.EmbedJS = factory());
}(this, function () { 'use strict';

    var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }


    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    babelHelpers;

    /**
     * Trucates the string and adds ellipsis at the end.
     * @param string        The string to be truncated
     * @param n             Length to which it should be truncated
     * @returns {string}    The truncated string
     */
    function truncate(string, n) {
        return string.substr(0, n - 1) + (string.length > n ? '...' : '');
    }

    /**
     * Converts a string into legitimate url.
     * @param string
     */
    function toUrl(string) {
        return string.indexOf('//') === -1 ? '//' + string : string;
    }

    /**
     * Extends an Object
     * @param destination
     * @param source
     * @returns {*}
     */
    function deepExtend(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property) && source[property] && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepExtend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

    /**
     * Sort an array of objects based on the index value
     * @param  {Array} arr Array to be sorted
     * @return {Array}     Sorted array
     */
    function sortObject(arr) {
        return arr.sort(function (a, b) {
            return a.index - b.index;
        });
    }

    /**
     * Creates the string of the iframes after sorting them and finally returning a string
     * @param  {string} str    String to which the created text has to be added
     * @param  {object} embeds Sorted array of iframe html
     * @return {string}        String to be rendered
     */
    function createText(str, embeds) {
        var sortedEmbeds = sortObject(embeds);
        for (var i = 0; i < sortedEmbeds.length; i++) {
            str += ' ' + sortedEmbeds[i].text;
        }
        return str;
    }

    /**
     * Matches the string and finds the substrings matching to the provided regex pattern
     * @param  {object} regex Regex pattern
     * @param  {string} input The string to be analyzed
     * @return {object}       Returns the matched substring with their corresponding positions
     */
    function matches(regex, input) {
        return regex.exec(input);
    }

    /**
     * Checks whether a particular service should be embedded or not based on
     * the setting provided by the user
     * @param  {object} options The options provided by the user
     * @param  {string} service Name of the service for which the condition is to be analyzed
     * @return {boolean}        True if it should be embedded
     */
    function ifEmbed(options, service) {
        if (options.singleEmbed && options.served.length) return;
        return options.excludeEmbed.indexOf(service) == -1 && !(options.excludeEmbed === 'all');
    }

    function ifInline(options, service) {
        return options.inlineEmbed.indexOf(service) >= 0 || options.inlineEmbed === 'all';
    }

    /**
     * Calculates the dimensions for the elements based on a aspect ratio
     * @param  {object} options Plugin options
     * @return {object}         The width and height of the elements
     */
    function setDimensions(options) {
        options.videoWidth = options.videoWidth || options.videoHeight / 3 * 4 || 800;
        options.videoHeight = options.videoHeight || options.videoWidth / 4 * 3 || 600;
        return options;
    }

    /**
     * Returns a cloned object
     * @param  {object} obj
     * @return {object}     cloned object
     */
    function cloneObject(obj) {
        if (obj === null || (typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) !== 'object') return obj;
        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
        }
        return temp;
    }

    function urlRegex() {
        return (/((href|src)=["']|)(\b(https?|ftp|file):\/\/[^,.\s]+[^\s]*[^,.\s]+)|(?:https?:\/\/)?(?:(?:0rz\.tw)|(?:1link\.in)|(?:1url\.com)|(?:2\.gp)|(?:2big\.at)|(?:2tu\.us)|(?:3\.ly)|(?:307\.to)|(?:4ms\.me)|(?:4sq\.com)|(?:4url\.cc)|(?:6url\.com)|(?:7\.ly)|(?:a\.gg)|(?:a\.nf)|(?:aa\.cx)|(?:abcurl\.net)|(?:ad\.vu)|(?:adf\.ly)|(?:adjix\.com)|(?:afx\.cc)|(?:all\.fuseurl.com)|(?:alturl\.com)|(?:amzn\.to)|(?:ar\.gy)|(?:arst\.ch)|(?:atu\.ca)|(?:azc\.cc)|(?:b23\.ru)|(?:b2l\.me)|(?:bacn\.me)|(?:bcool\.bz)|(?:binged\.it)|(?:bit\.ly)|(?:buff\.ly)|(?:bizj\.us)|(?:bloat\.me)|(?:bravo\.ly)|(?:bsa\.ly)|(?:budurl\.com)|(?:canurl\.com)|(?:chilp\.it)|(?:chzb\.gr)|(?:cl\.lk)|(?:cl\.ly)|(?:clck\.ru)|(?:cli\.gs)|(?:cliccami\.info)|(?:clickthru\.ca)|(?:clop\.in)|(?:conta\.cc)|(?:cort\.as)|(?:cot\.ag)|(?:crks\.me)|(?:ctvr\.us)|(?:cutt\.us)|(?:dai\.ly)|(?:decenturl\.com)|(?:dfl8\.me)|(?:digbig\.com)|(?:digg\.com)|(?:disq\.us)|(?:dld\.bz)|(?:dlvr\.it)|(?:do\.my)|(?:doiop\.com)|(?:dopen\.us)|(?:easyuri\.com)|(?:easyurl\.net)|(?:eepurl\.com)|(?:eweri\.com)|(?:fa\.by)|(?:fav\.me)|(?:fb\.me)|(?:fbshare\.me)|(?:ff\.im)|(?:fff\.to)|(?:fire\.to)|(?:firsturl\.de)|(?:firsturl\.net)|(?:flic\.kr)|(?:flq\.us)|(?:fly2\.ws)|(?:fon\.gs)|(?:freak\.to)|(?:fuseurl\.com)|(?:fuzzy\.to)|(?:fwd4\.me)|(?:fwib\.net)|(?:g\.ro.lt)|(?:gizmo\.do)|(?:gl\.am)|(?:go\.9nl.com)|(?:go\.ign.com)|(?:go\.usa.gov)|(?:goo\.gl)|(?:goshrink\.com)|(?:gurl\.es)|(?:hex\.io)|(?:hiderefer\.com)|(?:hmm\.ph)|(?:href\.in)|(?:hsblinks\.com)|(?:htxt\.it)|(?:huff\.to)|(?:hulu\.com)|(?:hurl\.me)|(?:hurl\.ws)|(?:icanhaz\.com)|(?:idek\.net)|(?:ilix\.in)|(?:is\.gd)|(?:its\.my)|(?:ix\.lt)|(?:j\.mp)|(?:jijr\.com)|(?:kl\.am)|(?:klck\.me)|(?:korta\.nu)|(?:krunchd\.com)|(?:l9k\.net)|(?:lat\.ms)|(?:liip\.to)|(?:liltext\.com)|(?:linkbee\.com)|(?:linkbun\.ch)|(?:liurl\.cn)|(?:ln-s\.net)|(?:ln-s\.ru)|(?:lnk\.gd)|(?:lnk\.ms)|(?:lnkd\.in)|(?:lnkurl\.com)|(?:lru\.jp)|(?:lt\.tl)|(?:lurl\.no)|(?:macte\.ch)|(?:mash\.to)|(?:merky\.de)|(?:migre\.me)|(?:miniurl\.com)|(?:minurl\.fr)|(?:mke\.me)|(?:moby\.to)|(?:moourl\.com)|(?:mrte\.ch)|(?:myloc\.me)|(?:myurl\.in)|(?:n\.pr)|(?:nbc\.co)|(?:nblo\.gs)|(?:nn\.nf)|(?:not\.my)|(?:notlong\.com)|(?:nsfw\.in)|(?:nutshellurl\.com)|(?:nxy\.in)|(?:nyti\.ms)|(?:o-x\.fr)|(?:oc1\.us)|(?:om\.ly)|(?:omf\.gd)|(?:omoikane\.net)|(?:on\.cnn.com)|(?:on\.mktw.net)|(?:onforb\.es)|(?:orz\.se)|(?:ow\.ly)|(?:ping\.fm)|(?:pli\.gs)|(?:pnt\.me)|(?:politi\.co)|(?:post\.ly)|(?:pp\.gg)|(?:profile\.to)|(?:ptiturl\.com)|(?:pub\.vitrue.com)|(?:qlnk\.net)|(?:qte\.me)|(?:qu\.tc)|(?:qy\.fi)|(?:r\.im)|(?:rb6\.me)|(?:read\.bi)|(?:readthis\.ca)|(?:reallytinyurl\.com)|(?:redir\.ec)|(?:redirects\.ca)|(?:redirx\.com)|(?:retwt\.me)|(?:ri\.ms)|(?:rickroll\.it)|(?:riz\.gd)|(?:rt\.nu)|(?:ru\.ly)|(?:rubyurl\.com)|(?:rurl\.org)|(?:rww\.tw)|(?:s4c\.in)|(?:s7y\.us)|(?:safe\.mn)|(?:sameurl\.com)|(?:sdut\.us)|(?:shar\.es)|(?:shink\.de)|(?:shorl\.com)|(?:short\.ie)|(?:short\.to)|(?:shortlinks\.co.uk)|(?:shorturl\.com)|(?:shout\.to)|(?:show\.my)|(?:shrinkify\.com)|(?:shrinkr\.com)|(?:shrt\.fr)|(?:shrt\.st)|(?:shrten\.com)|(?:shrunkin\.com)|(?:simurl\.com)|(?:slate\.me)|(?:smallr\.com)|(?:smsh\.me)|(?:smurl\.name)|(?:sn\.im)|(?:snipr\.com)|(?:snipurl\.com)|(?:snurl\.com)|(?:sp2\.ro)|(?:spedr\.com)|(?:srnk\.net)|(?:srs\.li)|(?:starturl\.com)|(?:su\.pr)|(?:surl\.co.uk)|(?:surl\.hu)|(?:t\.cn)|(?:t\.co)|(?:t\.lh.com)|(?:ta\.gd)|(?:tbd\.ly)|(?:tcrn\.ch)|(?:tgr\.me)|(?:tgr\.ph)|(?:tighturl\.com)|(?:tiniuri\.com)|(?:tiny\.cc)|(?:tiny\.ly)|(?:tiny\.pl)|(?:tinylink\.in)|(?:tinyuri\.ca)|(?:tinyurl\.com)|(?:tl\.gd)|(?:tmi\.me)|(?:tnij\.org)|(?:tnw\.to)|(?:tny\.com)|(?:to\.ly)|(?:togoto\.us)|(?:totc\.us)|(?:toysr\.us)|(?:tpm\.ly)|(?:tr\.im)|(?:tra\.kz)|(?:trunc\.it)|(?:twhub\.com)|(?:twirl\.at)|(?:twitclicks\.com)|(?:twitterurl\.net)|(?:twitterurl\.org)|(?:twiturl\.de)|(?:twurl\.cc)|(?:twurl\.nl)|(?:u\.mavrev.com)|(?:u\.nu)|(?:u76\.org)|(?:ub0\.cc)|(?:ulu\.lu)|(?:updating\.me)|(?:ur1\.ca)|(?:url\.az)|(?:url\.co.uk)|(?:url\.ie)|(?:url360\.me)|(?:url4\.eu)|(?:urlborg\.com)|(?:urlbrief\.com)|(?:urlcover\.com)|(?:urlcut\.com)|(?:urlenco\.de)|(?:urli\.nl)|(?:urls\.im)|(?:urlshorteningservicefortwitter\.com)|(?:urlx\.ie)|(?:urlzen\.com)|(?:usat\.ly)|(?:use\.my)|(?:vb\.ly)|(?:vgn\.am)|(?:vl\.am)|(?:vm\.lc)|(?:w55\.de)|(?:wapo\.st)|(?:wapurl\.co.uk)|(?:wipi\.es)|(?:wp\.me)|(?:x\.vu)|(?:xr\.com)|(?:xrl\.in)|(?:xrl\.us)|(?:xurl\.es)|(?:xurl\.jp)|(?:y\.ahoo.it)|(?:yatuc\.com)|(?:ye\.pe)|(?:yep\.it)|(?:yfrog\.com)|(?:yhoo\.it)|(?:yiyd\.com)|(?:youtu\.be)|(?:yuarel\.com)|(?:z0p\.de)|(?:zi\.ma)|(?:zi\.mu)|(?:zipmyurl\.com)|(?:zud\.me)|(?:zurl\.ws)|(?:zz\.gd)|(?:zzang\.kr)|(?:›\.ws)|(?:✩\.ws)|(?:✿\.ws)|(?:❥\.ws)|(?:➔\.ws)|(?:➞\.ws)|(?:➡\.ws)|(?:➨\.ws)|(?:➯\.ws)|(?:➹\.ws)|(?:➽\.ws))\/[a-z0-9]*/gi
        );
    }

    function arrayLowercase(options, property) {
        if (typeof options[property] !== 'string') {
            options[property] = options[property].map(function (elem) {
                return elem.toLowerCase();
            });
        }
        return options;
    }

    /**
     * Sets the dimensions and converts options values' Array into lowercase.
     * @param options
     * @returns {Object|*}
     */
    function processOptions(options) {
        options = setDimensions(options);
        options = arrayLowercase(options, 'excludeEmbed');
        options = arrayLowercase(options, 'inlineEmbed');
        return arrayLowercase(options, 'openGraphExclude');
    }

    /**
     * Get the last element of an array or string
     * @param elem [String|Array]
     * @returns last element of the Array or String
     */
    function lastElement(elem) {
        return elem[elem.length - 1];
    }

    var renderer = {
    	url: function url(match, options) {
    		var config = options.linkOptions;
    		return '<a href="' + toUrl(match) + '" rel="' + config.rel + '" target="' + config.target + '">' + match + '</a>';
    	},
    	smiley: function smiley(text, pre, code) {
    		return '<span class="icon-emoticon" title="' + text + '">' + pre + code + '</span>';
    	},
    	emoji: function emoji(text) {
    		return '<span class="emoticon emoticon-' + text + '" title=":' + text + ':"></span>';
    	},
    	audio: function audio(match) {
    		return '<div class="ejs-audio ejs-plyr ejs-embed"><audio src="' + match + '" controls class="video-js ejs-video-js"></audio></div>';
    	},
    	soundcloud: function soundcloud(match, options) {
    		var config = options.soundCloudOptions;
    		return '<div class="ejs-embed">\n\t\t<iframe height="160" scrolling="no" src="https://w.soundcloud.com/player/?url=' + match + '\n\t\t&auto_play     = ' + config.autoPlay + '\n\t\t&hide_related  = ' + config.hideRelated + '\n\t\t&show_comments = ' + config.showComments + '\n\t\t&show_user     = ' + config.showUser + '\n\t\t&show_reposts  = ' + config.showReposts + '\n\t\t&visual        = ' + config.visual + '\n\t\t&download      = ' + config.download + '\n\t\t&color         = ' + config.themeColor + '\n\t\t&theme_color   = ' + config.themeColor + '"></iframe>\n\t\t</div>';
    	},
    	spotify: function spotify(match) {
    		var id = lastElement(match.split('/'));
    		return '<div class="ejs-embed"><iframe src="https://embed.spotify.com/?uri=spotify:track:' + id + '" height="80"></iframe></div>';
    	},
    	codepen: function codepen(id, options) {
    		return '<div class="ejs-embed ejs-codepen"><iframe scrolling="no" height="' + options.codeEmbedHeight + '" src="' + id.replace(/\/pen\//, '/embed/') + '/?height=' + options.codeEmbedHeight + '"></iframe></div>';
    	},
    	ideone: function ideone(match, options) {
    		return '<div class="ejs-ideone ejs-embed"><iframe src="http://ideone.com/embed/' + match.split('/')[1] + '" frameborder="0" height="' + options.codeEmbedHeight + '"></iframe></div>';
    	},
    	jsbin: function jsbin(id, options) {
    		return '<div class="ejs-jsbin ejs-embed"><iframe height="' + options.codeEmbedHeight + '" class="jsbin-embed foo" src="http://' + id + '/embed?html,js,output"></iframe></div>';
    	},
    	jsfiddle: function jsfiddle(id, options) {
    		id = lastElement(id) == '/' ? id.slice(0, -1) : id;
    		id = id.indexOf('//') !== -1 ? id : '//' + id;
    		return '<div class="ejs-embed ejs-jsfiddle"><iframe height="' + options.codeEmbedHeight + '" src="' + id + '/embedded"></iframe></div>';
    	},
    	plunker: function plunker(id, options) {
    		return '<div class="ejs-embed ejs-plunker"><iframe class="ne-plunker" src="http://embed.plnkr.co/' + id + '" height="' + options.codeEmbedHeight + '"></iframe></div>';
    	},
    	image: function image(match) {
    		return '<div class="ejs-image ejs-embed"><div class="ne-image-wrapper"><img src="' + match + '"/></div></div>';
    	},
    	flickr: function flickr(match, options) {
    		return '<div class="ejs-embed"><div class="ne-image-wrapper"><iframe src="' + toUrl(match.split('/?')[0]) + '/player/" width="' + options.videoWidth + '" height="' + options.videoHeight + '"></iframe></div></div>';
    	},
    	instagram: function instagram(match, options) {
    		return '<div class="ejs-embed ejs-instagram"><iframe src="' + toUrl(match.split('/?')[0]) + '/embed/" height="' + options.videoHeight + '"></iframe></div>';
    	},
    	slideShare: function slideShare(html) {
    		return '<div class="ejs-embed ejs-slideshare">' + html + '</div>';
    	},
    	video: function video(match) {
    		return '<div class="ejs-video ejs-embed"><div class="ejs-video-player"><div class="ejs-player ejs-plyr"><video src="' + match + '" class="ejs-video-js video-js" controls></video></div></div></div>';
    	},
    	dailymotion: function dailymotion(match, options) {
    		var id = lastElement(match.split('/'));
    		return '<div class="ejs-video ejs-embed"><iframe src="http://www.dailymotion.com/embed/video/' + id + '" height="' + options.videoHeight + '" width="' + options.videoWidth + '"></iframe></div>';
    	},
    	liveleak: function liveleak(match, options) {
    		return '<div class="ejs-video ejs-embed"><iframe src="http://www.liveleak.com/e/' + match.split('=')[1] + '" height="' + options.videoHeight + '" width="' + options.videoWidth + '"></iframe></div>';
    	},
    	ted: function ted(match, options) {
    		var a = match.split('/');
    		var id = a[a.length - 1];
    		return '<div class="ejs-embed ejs-ted"><iframe src="http://embed.ted.com/talks/' + id + '.html" height="' + options.videoHeight + '" width="' + options.videoWidth + '"></iframe></div>';
    	},
    	ustream: function ustream(match, options) {
    		var id = match.split('/');
    		id.splice(1, 0, 'embed');
    		return '<div class="ejs-embed ejs-ustream"><iframe src="//www.' + id.join('/') + '" height="' + options.videoHeight + '" width="' + options.videoWidth + '"></iframe></div>';
    	},
    	detailsVimeo: function detailsVimeo(data, fullData, embedUrl) {
    		return '<div class="ejs-video ejs-embed"><div class="ejs-video-preview"><div class="ejs-video-thumb" data-ejs-url="' + embedUrl + '"><div class="ejs-thumb" style="background-image:url(' + data.thumbnail + ')"></div><i class="fa fa-play-circle-o"></i></div><div class="ejs-video-detail"><div class="ejs-video-title"><a href="' + data.url + '">' + data.title + '</a></div><div class="ejs-video-desc">' + data.description + '</div><div class="ejs-video-stats"><span><i class="fa fa-eye"></i>' + data.views + '</span><span><i class="fa fa-heart"></i>' + data.likes + '</span></div></div></div></div>';
    	},
    	detailsYoutube: function detailsYoutube(data, fullData, embedUrl) {
    		return '<div class="ejs-video ejs-embed"><div class="ejs-video-preview"><div class="ejs-video-thumb" data-ejs-url="' + embedUrl + '"><div class="ejs-thumb" style="background-image:url(' + data.thumbnail + ')"></div><i class="fa fa-play-circle-o"></i></div><div class="ejs-video-detail"><div class="ejs-video-title"><a href="' + data.url + '">' + data.title + '</a></div><div class="ejs-video-desc">' + data.description + '</div><div class="ejs-video-stats"><span><i class="fa fa-eye"></i>' + data.views + '</span><span><i class="fa fa-heart"></i>' + data.likes + '</span></div></div></div></div>';
    	},
    	vine: function vine(match, options) {
    		var id = lastElement(match.split('/'));
    		var config = options.vineOptions;
    		return '<div class="ejs-vine"><iframe class="ejs-vine-iframe" src="https://vine.co/v/' + id + '/embed/' + config.type + '" height="' + config.height + '" width="' + config.width + '"></iframe></div>';
    	},
    	vimeo: function vimeo(url, options) {
    		return options.plyr ? '<div class=\'ejs-plyr\'><div data-video-type=\'vimeo\' data-video-id=\'' + lastElement(url.split("/")) + '\'></div></div>' : '<div class="ejs-video-player ejs-embed"><iframe src="' + url + '" frameBorder="0" width="' + options.videoWidth + '" height="' + options.videoHeight + '"></iframe></div>';
    	},
    	youtube: function youtube(url, options) {
    		return options.plyr ? '<div class=\'ejs-plyr\'><div data-video-type=\'youtube\' data-video-id=\'' + lastElement(url.split("/")) + '\'></div></div>' : '<div class="ejs-video-player ejs-embed"><iframe src="' + url + '" frameBorder="0" width="' + options.videoWidth + '" height="' + options.videoHeight + '"></iframe></div>';
    	},
    	openGraph: function openGraph(data, options) {
    		return '<div class="ejs-embed ejs-ogp"><div class="ejs-ogp-thumb" style="background-image:url(' + data.image + ')"></div><div class="ejs-ogp-details"><div class="ejs-ogp-title"><a href="' + data.url + '" target="' + options.linkOptions.target + '">' + data.title + '</a></div><div class="ejs-ogb-details">' + data.description + '</div></div></div>';
    	},
    	github: function github(data, options) {
    		return '<div class="ejs-embed ejs-github"><div class="ejs-ogp-thumb" style="background-image:url(' + data.owner.avatar_url + ')"></div><div class="ejs-ogp-details"><div class="ejs-ogp-title"><a href="' + data.html_url + '" target="' + options.linkOptions.target + '">' + data.full_name + '</a></div><div class="ejs-ogb-details">' + data.description + '</div><div class="ejs-github-stats"><span><i class="fa fa-star"></i>' + data.stargazers_count + '</span><span><i class="fa fa-code-fork"></i>' + data.network_count + '</span></div></div></div>';
    	},
    	gmap: function gmap(latitude, longitude, location, options) {
    		var config = options.mapOptions;
    		if (config.mode === 'place') {
    			return '<div class="ejs-embed ejs-map"><iframe width="' + options.videoWidth + '" height="' + options.videoHeight + '" src="https://www.google.com/maps/embed/v1/place?key=' + options.googleAuthKey + '&q=' + location + '"></iframe></div>';
    		} else if (config.mode === 'streetview') {
    			return '<div class="ejs-embed ejs-map"><iframe width="' + options.videoWidth + '" height="' + options.videoHeight + '" src="https://www.google.com/maps/embed/v1/streetview?key=' + options.googleAuthKey + '&location=' + latitude + ',' + longitude + '&heading=210&pitch=10&fov=35"></iframe></div>';
    		} else if (config.mode === 'view') {
    			return '<div class="ejs-embed ejs-map"><iframe width="' + options.videoWidth + '" height="' + options.videoHeight + '" src="https://www.google.com/maps/embed/v1/view?key=' + options.googleAuthKey + '&center=' + latitude + ',' + longitude + '&zoom=18&maptype=satellite"></iframe></div>';
    		}
    	}
    };

    var regex = {
    	mentions: /\B@[a-z0-9_-]+/gi,
    	hashtag: /\B#[a-z0-9_-]+/gi,
    	basicAudio: /((?:https?):\/\/\S*\.(?:wav|mp3|ogg))/gi,
    	soundCloud: /(soundcloud.com)\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/gi,
    	spotify: /spotify.com\/track\/[a-zA-Z0-9_]+/gi,
    	codepen: /http:\/\/codepen.io\/([A-Za-z0-9_]+)\/pen\/([A-Za-z0-9_]+)/gi,
    	gist: /gist.github.com\/[a-zA-Z0-9_-]+\/([a-zA-Z0-9]+)/gi,
    	highlightCode: /(`{3})(\s|[a-z]+)\s*([\s\S]*?[^`])\s*\1(?!`)/gm,
    	inlineCode: /(`)\s*([\s\S]*?[^`])\s*\1(?!`)/gm,
    	ideone: /ideone.com\/[a-zA-Z0-9]{6}/gi,
    	jsbin: /jsbin.com\/[a-zA-Z0-9_]+\/[0-9_]+/gi,
    	jsfiddle: /jsfiddle.net\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_\/]+/gi,
    	plunker: /plnkr.co\/edit\/[a-zA-Z0-9\?=]+/gi,
    	basicImage: /((?:https?):\/\/\S*\.(?:gif|jpg|jpeg|tiff|png|svg|webp))/gi,
    	flickr: /flickr.com\/[a-z]+\/[a-zA-Z@_$!\d\-\]+\/[\d]+/gi,
    	instagram: /instagram.com\/p\/[a-zA-Z0-9_\/\?\-\=]+/gi,
    	slideShare: /slideshare.net\/[a-zA-Z0-9_-]*\/[a-zA-Z0-9_-]*/gi,
    	github: /[^\.]github.com\/([\w\.\-]+)\/([\w\.\-]+)/gi,
    	basicVideo: /(?:https?):\/\/\S*\.(?:ogv|webm|mp4)/gi,
    	dailymotion: /dailymotion.com\/video\/[a-zA-Z0-9-_]+/gi,
    	liveleak: /liveleak.com\/view\?i=[a-zA-Z0-9_]+/gi,
    	ted: /ted.com\/talks\/[a-zA-Z0-9_]+/gi,
    	ustream: /ustream.tv\/[a-z\/0-9]*/gi,
    	vimeo: /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)*/gi,
    	vine: /vine.co\/v\/[a-zA-Z0-9]+/gi,
    	youtube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})[?=&+%\w-]*/gi,
    	gmap: /@\((.+)\)/gi,
    	twitter: /https:\/\/twitter\.com\/\w+\/\w+\/\d+/gi,
    	smileys: /(\:[\+\-\w]+\:|\<[\/\\]?3|[\(\)\\\D|\*\$][\-\^]?[\:\;\=]|[\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?]|$)/gi
    };

    function getEmoji(match) {
    	return match[0] === ':' && lastElement(match) === ':' && match.substring(1, match.length - 1);
    }

    function emoji (output, options) {
    	return output.replace(regex.smileys, function (match) {
    		var emoji = getEmoji(match);
    		if (emoji) {
    			return options.template.emoji(emoji, options);
    		}
    		return match;
    	});
    }

    var defaultIcons = [{
    	'text': ':)',
    	'code': '&#xe60a'
    }, {
    	'text': ':D',
    	'code': '&#xe608'
    }, {
    	'text': ':d',
    	'code': '&#xe608'
    }, {
    	'text': ':(',
    	'code': '&#xe60e'
    }, {
    	'text': ':/',
    	'code': '&#xe620'

    }, {
    	'text': ':P',
    	'code': '&#xe60c'
    }, {
    	'text': ':p',
    	'code': '&#xe60c'
    }, {
    	'text': '3:)',
    	'code': '&#xe618'
    }, {
    	'text': '(^)',
    	'code': '&#xe607'
    }, {
    	'text': ';)',
    	'code': '&#xe610'
    }, {
    	'text': ':o',
    	'code': '&#xe61a'
    }, {
    	'text': '-_-',
    	'code': '&#xe61e'
    }, {
    	'text': '(y)',
    	'code': '&#xe606'
    }, {
    	'text': ':*',
    	'code': '&#xe604'
    }, {
    	'text': '&lt;3',
    	'code': '&#xe604'
    }, {
    	'text': '<3',
    	'code': '&#xe604'
    }, {
    	'text': '&lt;/3',
    	'code': '&#xe605'
    }, {
    	'text': '</3',
    	'code': '&#xe605'
    }, {
    	'text': '^_^',
    	'code': '&#xe612'
    }, {
    	'text': '8-)',
    	'code': '&#xe614'
    }, {
    	'text': '8|',
    	'code': '&#xe614'
    }, {
    	'text': ':S',
    	'code': '&#xe61c'
    }, {
    	'text': ':s',
    	'code': '&#xe61c'
    }];

    function smiley (input, options) {
    	var icons = options.customFontIcons.length ? options.customFontIcons : defaultIcons;

    	var escapedSymbols = icons.map(function (val) {
    		return escapeRegExp(val.text);
    	});

    	var smileyRegex = new RegExp('(^|\\s)(' + escapedSymbols.join('|') + ')(?=\\s|$)', 'gi');

    	return input.replace(smileyRegex, function (match, pre, text) {
    		var index = escapedSymbols.indexOf(escapeRegExp(text));
    		var code = icons[index].code;
    		return options.template.smiley(text, pre, code, options);
    	});
    }

    function url (input, options) {
    	var config = options.linkOptions;
    	return input.replace(urlRegex(), function (match) {
    		console.log(arguments);
    		if (lastElement(match) === ')') return match; //hack for markdown image
    		var extension = lastElement(match.split('.'));
    		if (lastElement(match) === '/') match = match.slice(0, -1);
    		if (config.exclude.indexOf(extension) === -1) return options.template.url(match, options);
    		return match;
    	});
    }

    var fetchJsonp = __commonjs(function (module, exports, global) {
      (function (global, factory) {
        if (typeof define === 'function' && define.amd) {
          define(['exports', 'module'], factory);
        } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
          factory(exports, module);
        } else {
          var mod = {
            exports: {}
          };
          factory(mod.exports, mod);
          global.fetchJsonp = mod.exports;
        }
      })(__commonjs_global, function (exports, module) {
        'use strict';

        var defaultOptions = {
          timeout: 5000,
          jsonpCallback: 'callback',
          jsonpCallbackFunction: null
        };

        function generateCallbackFunction() {
          return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
        }

        // Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined' error if request timeout
        function clearFunction(functionName) {
          // IE8 throws an exception when you try to delete a property on window
          // http://stackoverflow.com/a/1824228/751089
          try {
            delete window[functionName];
          } catch (e) {
            window[functionName] = undefined;
          }
        }

        function removeScript(scriptId) {
          var script = document.getElementById(scriptId);
          document.getElementsByTagName('head')[0].removeChild(script);
        }

        var fetchJsonp = function fetchJsonp(url) {
          var options = arguments[1] === undefined ? {} : arguments[1];

          var timeout = options.timeout != null ? options.timeout : defaultOptions.timeout;
          var jsonpCallback = options.jsonpCallback != null ? options.jsonpCallback : defaultOptions.jsonpCallback;

          var timeoutId = undefined;

          return new Promise(function (resolve, reject) {
            var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();

            window[callbackFunction] = function (response) {
              resolve({
                ok: true,
                // keep consistent with fetch API
                json: function json() {
                  return Promise.resolve(response);
                }
              });

              if (timeoutId) clearTimeout(timeoutId);

              removeScript(jsonpCallback + '_' + callbackFunction);

              clearFunction(callbackFunction);
            };

            // Check if the user set their own params, and if not add a ? to start a list of params
            url += url.indexOf('?') === -1 ? '?' : '&';

            var jsonpScript = document.createElement('script');
            jsonpScript.setAttribute('src', url + jsonpCallback + '=' + callbackFunction);
            jsonpScript.id = jsonpCallback + '_' + callbackFunction;
            document.getElementsByTagName('head')[0].appendChild(jsonpScript);

            timeoutId = setTimeout(function () {
              reject(new Error('JSONP request to ' + url + ' timed out'));

              clearFunction(callbackFunction);
              removeScript(jsonpCallback + '_' + callbackFunction);
            }, timeout);
          });
        };

        // export as global function
        /*
        let local;
        if (typeof global !== 'undefined') {
          local = global;
        } else if (typeof self !== 'undefined') {
          local = self;
        } else {
          try {
            local = Function('return this')();
          } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
          }
        }
        
        local.fetchJsonp = fetchJsonp;
        */

        module.exports = fetchJsonp;
      });
    });

    var fetchJsonp$1 = fetchJsonp && (typeof fetchJsonp === 'undefined' ? 'undefined' : babelHelpers.typeof(fetchJsonp)) === 'object' && 'default' in fetchJsonp ? fetchJsonp['default'] : fetchJsonp;

    /**
     * Common template for vimeo and youtube iframes
     * @param  {string} url     URL of the embedding video
     * @param  {object} options Options object
     * @return {string}         compiled template with variables replaced
     */
    function template(url, options) {
      return options.template.vimeo(url, options) || options.template.youtube(url, options);
    }

    /**
     * Plays the video after clicking on the thumbnail
     * @param  {object} options   Options object
     * @return {null}
     */
    function playVideo(options) {
    	/** Execute the customVideoClickHandler if the user wants to handle it on his own. */
    	if (options.customVideoClickHandler) return options.videoClickHandler(options, template);

    	var classes = document.getElementsByClassName(options.videoClickClass);
    	for (var i = 0; i < classes.length; i++) {
    		classes[i].onclick = function () {
    			options.onVideoShow();
    			var url = this.getAttribute('data-ejs-url') + "?autoplay=true";
    			this.parentNode.parentNode.innerHTML = template(url, options);
    		};
    	}
    }

    function getDetailsTemplate (data, fullData, embedUrl, options) {
    	if (data.host === 'vimeo') {
    		return options.template.detailsVimeo(data, fullData, embedUrl, options);
    	} else if (data.host === 'youtube') {
    		return options.template.detailsYoutube(data, fullData, embedUrl, options);
    	}
    }

    /**
     * Applies video.js to all audio and video dynamically
     * @param  {object} options Options object
     * @return {null}
     */
    function applyPlyr (options) {
    	if (options.plyr) {
    		if (!options.plugins.plyr) throw new ReferenceError("You have enabled plyr but you haven't loaded the library.Find it at https://plyr.io/");
    		var plyr = options.plugins.plyr;
    		plyr.setup('.ejs-plyr', options.plyrOptions);
    	}
    }

    /**
     * Applies video.js to all audio and video dynamically
     * @param  {object} options Options object
     * @return {null}
     */
    function applyVideoJS(options) {
    	options.videojsOptions.width = options.videoWidth;
    	options.videojsOptions.height = options.videoHeight;
    	if (options.videoJS) {
    		if (!options.plugins.videojs) throw new ReferenceError("You have enabled videojs but you haven't loaded the library.Find it at http://videojs.com/");
    		var VideoJS = options.plugins.videojs;
    		var elements = options.input.getElementsByClassName('ejs-video-js');
    		for (var i = 0; i < elements.length; i++) {
    			VideoJS(elements[i], options.videojsOptions, function () {
    				return options.videojsCallback();
    			});
    		}
    	}
    }

    /**
     * Destroys the onclick event for opening the video template from the details template
     * @param  {className} className
     * @return {null}
     */
    function destroyVideos (className) {
      var classes = document.getElementsByClassName(className);
      for (var i = 0; i < classes.length; i++) {
        classes[i].onclick = null;
      }
    }

    function inlineEmbed(_) {
    	var regexInline = _.options.link ? new RegExp('([^>]*' + _.regex.source + ')</a>', 'gm') : new RegExp('([^\\s]*' + _.regex.source + ')', 'gm');
    	_.output = _.output.replace(regexInline, function (match) {
    		var url = _.options.link ? match.slice(0, -4) : match;
    		if (_.options.served.indexOf(url) === -1) {
    			_.options.served.push(url);
    			if (_.options.link) {
    				return !_.options.inlineText ? _.template(match.slice(0, -4)) + '</a>' : match + _.template(match.slice(0, -4));
    			} else {
    				return !_.options.inlineText ? _.template(match) : match + _.template(match);
    			}
    		} else {
    			return match; //TODO : check whether this should be `match`
    		}
    	});
    	return [_.output, _.embeds];
    }

    function normalEmbed(_) {
    	var match = void 0;
    	while ((match = matches(_.regex, _.input)) !== null) {
    		var url = match[0];
    		if (!(_.options.served.indexOf(url) === -1) || _.options.served.length && _.options.singleEmbed) continue;
    		_.options.served.push(url);
    		var text = _.template(url);
    		_.embeds.push({
    			text: text,
    			index: match.index
    		});
    	}
    	return [_.output, _.embeds];
    }

    function embed(_) {
    	return ifInline(_.options, _.service) ? inlineEmbed(_) : normalEmbed(_);
    }

    function base (input, output, embeds, options, regex, service) {
    	var args = {
    		input: input,
    		output: output,
    		options: options,
    		embeds: embeds,
    		regex: regex,
    		service: service,
    		template: function template(match) {
    			return this.options.template[this.service](match, this.options);
    		}
    	};

    	return embed(args);
    }

    function baseEmbed(input, output, embeds, options, regex, service, flag) {
    	return ifEmbed(options, service) || ifEmbed(options, service) && flag ? base(input, output, embeds, options, regex, service) : [output, embeds];
    }

    /**
     * This is a private function which is used to get the actual text to be replaced for
     * a particular url in inline embedding. This returns a promise
     * @param  {object} _     reference to this
     * @param  {function} urlToText The function that converts url to replaceable text
     * @param  {object} match     object containing info of matching string
     * @return {Promise}           resolves to the text
     */
    function getInlineData(_, urlToText, match) {
    	var url = (_.options.link ? match[0].slice(0, -4) : match[0]) || match[1];
    	if (_.options.served.indexOf(url) >= 0) return Promise.resolve(null);

    	return new Promise(function (resolve) {
    		urlToText(_, match, url).then(function (text) {
    			if (!text) return resolve();
    			_.options.served.push(url);
    			resolve(text);
    		});
    	});
    }

    /**
     * A helper function for inline embedding
     * @param _
     * @param urlToText
     * @returns Promise
     */
    function inlineAsyncEmbed(_, urlToText) {
    	var regexInline = _.options.link ? new RegExp('([^>]*' + _.regex.source + ')</a>', 'gi') : new RegExp('([^\\s]*' + _.regex.source + ')', 'gi');
    	var match = void 0,
    	    promises = [];

    	while ((match = matches(regexInline, _.output)) !== null) {
    		promises.push(getInlineData(_, urlToText, match));
    	}return new Promise(function (resolve) {
    		if (matches.length) Promise.all(promises).then(function (data) {
    			var i = 0;
    			_.output = _.output.replace(regexInline, function (match) {
    				if (_.options.link) return !_.options.inlineText ? data[i] + '</a>' : match + data[i++];else return !_.options.inlineText ? data[i] : match + data[i++];
    			});
    			resolve(_.output);
    		});else resolve(_.output);
    	});
    }

    function getNormalData(_, urlToText, match) {
    	var url = match[0];
    	if (_.options.served.indexOf(url) >= 0) return;

    	return new Promise(function (resolve) {
    		urlToText(_, match, url, true).then(function (text) {
    			if (!text) resolve();
    			_.options.served.push(url);
    			_.embeds.push({
    				text: text,
    				index: match.index
    			});
    			resolve();
    		});
    	});
    }

    /**
     * A helper function for normal embedding
     * @param  {object} _
     * @param  {function} urlToText
     * @return {Promise}
     */
    function normalAsyncEmbed(_, urlToText) {
    	var match = void 0,
    	    promises = [];
    	while ((match = matches(_.regex, _.input)) !== null) {
    		promises.push(getNormalData(_, urlToText, match));
    	}return new Promise(function (resolve) {
    		Promise.all(promises).then(function () {
    			resolve(_.embeds);
    		});
    	});
    }

    function asyncEmbed(_, urlToText) {
    	return new Promise(function (resolve) {
    		if (ifInline(_.options, _.service)) inlineAsyncEmbed(_, urlToText).then(function (output) {
    			return resolve([output, _.embeds]);
    		});else normalAsyncEmbed(_, urlToText).then(function (embeds) {
    			return resolve([_.output, embeds]);
    		});
    	});
    }

    var Twitter = function () {
    	function Twitter(input, output, options, embeds) {
    		babelHelpers.classCallCheck(this, Twitter);

    		this.input = input;
    		this.output = output;
    		this.options = options;
    		this.embeds = embeds;
    		this.regex = regex.twitter;
    		this.service = 'twitter';

    		this.load = this.load.bind(this);
    		if (typeof this.options.input !== 'string') {
    			this.options.input.addEventListener('rendered', this.load, false);
    		}
    	}

    	/**
      * Fetches the data from twitter's oEmbed API
      * @param  {string} url URL of the tweet
      * @return {object}     data containing the tweet info
      */


    	babelHelpers.createClass(Twitter, [{
    		key: 'tweetData',
    		value: function tweetData(url) {
    			var config = this.options.tweetOptions;
    			var apiUrl = 'https://api.twitter.com/1/statuses/oembed.json?omit_script=true&url=' + url + '&maxwidth=' + config.maxWidth + '&hide_media=' + config.hideMedia + '&hide_thread=' + config.hideThread + '&align=' + config.align + '&lang=' + config.lang;
    			return new Promise(function (resolve) {
    				fetchJsonp$1(apiUrl, { credentials: 'include' }).then(function (data) {
    					return data.json();
    				}).then(function (json) {
    					return resolve(json);
    				});
    			});
    		}

    		/**
       * Load twitter widgets
       * @return null
       */

    	}, {
    		key: 'load',
    		value: function load() {
    			var twitter = this.options.plugins.twitter;
    			twitter.widgets.load(this.options.element); //here this refers to the element

    			//Execute the function after the widget is loaded
    			twitter.events.bind('loaded', this.options.onTweetsLoad);
    		}
    	}, {
    		key: 'process',
    		value: function process() {
    			var _this2 = this;

    			return new Promise(function (resolve) {
    				return asyncEmbed(_this2, Twitter.urlToText).then(function (data) {
    					return resolve(data);
    				});
    			});
    		}
    	}], [{
    		key: 'urlToText',
    		value: function urlToText(_this, match, url) {
    			return new Promise(function (resolve) {
    				return _this.tweetData(url).then(function (data) {
    					return resolve(data.html);
    				});
    			});
    		}
    	}]);
    	return Twitter;
    }();

    (function (self) {
      'use strict';

      if (self.fetch) {
        return;
      }

      function normalizeName(name) {
        if (typeof name !== 'string') {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
          throw new TypeError('Invalid character in header field name');
        }
        return name.toLowerCase();
      }

      function normalizeValue(value) {
        if (typeof value !== 'string') {
          value = String(value);
        }
        return value;
      }

      function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
          headers.forEach(function (value, name) {
            this.append(name, value);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function (name) {
            this.append(name, headers[name]);
          }, this);
        }
      }

      Headers.prototype.append = function (name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var list = this.map[name];
        if (!list) {
          list = [];
          this.map[name] = list;
        }
        list.push(value);
      };

      Headers.prototype['delete'] = function (name) {
        delete this.map[normalizeName(name)];
      };

      Headers.prototype.get = function (name) {
        var values = this.map[normalizeName(name)];
        return values ? values[0] : null;
      };

      Headers.prototype.getAll = function (name) {
        return this.map[normalizeName(name)] || [];
      };

      Headers.prototype.has = function (name) {
        return this.map.hasOwnProperty(normalizeName(name));
      };

      Headers.prototype.set = function (name, value) {
        this.map[normalizeName(name)] = [normalizeValue(value)];
      };

      Headers.prototype.forEach = function (callback, thisArg) {
        Object.getOwnPropertyNames(this.map).forEach(function (name) {
          this.map[name].forEach(function (value) {
            callback.call(thisArg, value, name, this);
          }, this);
        }, this);
      };

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError('Already read'));
        }
        body.bodyUsed = true;
      }

      function fileReaderReady(reader) {
        return new Promise(function (resolve, reject) {
          reader.onload = function () {
            resolve(reader.result);
          };
          reader.onerror = function () {
            reject(reader.error);
          };
        });
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        return fileReaderReady(reader);
      }

      function readBlobAsText(blob) {
        var reader = new FileReader();
        reader.readAsText(blob);
        return fileReaderReady(reader);
      }

      var support = {
        blob: 'FileReader' in self && 'Blob' in self && function () {
          try {
            new Blob();
            return true;
          } catch (e) {
            return false;
          }
        }(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
      };

      function Body() {
        this.bodyUsed = false;

        this._initBody = function (body) {
          this._bodyInit = body;
          if (typeof body === 'string') {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (!body) {
            this._bodyText = '';
          } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
            // Only support ArrayBuffers for POST method.
            // Receiving ArrayBuffers happens via Blobs, instead.
          } else {
              throw new Error('unsupported BodyInit type');
            }

          if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
              this.headers.set('content-type', 'text/plain;charset=UTF-8');
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set('content-type', this._bodyBlob.type);
            }
          }
        };

        if (support.blob) {
          this.blob = function () {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }

            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob);
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as blob');
            } else {
              return Promise.resolve(new Blob([this._bodyText]));
            }
          };

          this.arrayBuffer = function () {
            return this.blob().then(readBlobAsArrayBuffer);
          };

          this.text = function () {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }

            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as text');
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
        } else {
          this.text = function () {
            var rejected = consumed(this);
            return rejected ? rejected : Promise.resolve(this._bodyText);
          };
        }

        if (support.formData) {
          this.formData = function () {
            return this.text().then(decode);
          };
        }

        this.json = function () {
          return this.text().then(JSON.parse);
        };

        return this;
      }

      // HTTP methods whose capitalization should be normalized
      var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method;
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;
        if (Request.prototype.isPrototypeOf(input)) {
          if (input.bodyUsed) {
            throw new TypeError('Already read');
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          if (!body) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = input;
        }

        this.credentials = options.credentials || this.credentials || 'omit';
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
          throw new TypeError('Body not allowed for GET or HEAD requests');
        }
        this._initBody(body);
      }

      Request.prototype.clone = function () {
        return new Request(this);
      };

      function decode(body) {
        var form = new FormData();
        body.trim().split('&').forEach(function (bytes) {
          if (bytes) {
            var split = bytes.split('=');
            var name = split.shift().replace(/\+/g, ' ');
            var value = split.join('=').replace(/\+/g, ' ');
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
        return form;
      }

      function headers(xhr) {
        var head = new Headers();
        var pairs = xhr.getAllResponseHeaders().trim().split('\n');
        pairs.forEach(function (header) {
          var split = header.trim().split(':');
          var key = split.shift().trim();
          var value = split.join(':').trim();
          head.append(key, value);
        });
        return head;
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }

        this.type = 'default';
        this.status = options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = options.statusText;
        this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
      }

      Body.call(Response.prototype);

      Response.prototype.clone = function () {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        });
      };

      Response.error = function () {
        var response = new Response(null, { status: 0, statusText: '' });
        response.type = 'error';
        return response;
      };

      var redirectStatuses = [301, 302, 303, 307, 308];

      Response.redirect = function (url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError('Invalid status code');
        }

        return new Response(null, { status: status, headers: { location: url } });
      };

      self.Headers = Headers;
      self.Request = Request;
      self.Response = Response;

      self.fetch = function (input, init) {
        return new Promise(function (resolve, reject) {
          var request;
          if (Request.prototype.isPrototypeOf(input) && !init) {
            request = input;
          } else {
            request = new Request(input, init);
          }

          var xhr = new XMLHttpRequest();

          function responseURL() {
            if ('responseURL' in xhr) {
              return xhr.responseURL;
            }

            // Avoid security warnings on getResponseHeader when not allowed by CORS
            if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
              return xhr.getResponseHeader('X-Request-URL');
            }

            return;
          }

          xhr.onload = function () {
            var status = xhr.status === 1223 ? 204 : xhr.status;
            if (status < 100 || status > 599) {
              reject(new TypeError('Network request failed'));
              return;
            }
            var options = {
              status: status,
              statusText: xhr.statusText,
              headers: headers(xhr),
              url: responseURL()
            };
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };

          xhr.onerror = function () {
            reject(new TypeError('Network request failed'));
          };

          xhr.open(request.method, request.url, true);

          if (request.credentials === 'include') {
            xhr.withCredentials = true;
          }

          if ('responseType' in xhr && support.blob) {
            xhr.responseType = 'blob';
          }

          request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value);
          });

          xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        });
      };
      self.fetch.polyfill = true;
    })(typeof self !== 'undefined' ? self : this);

    /**
     * Takes the location name and returns the coordinates of that location using the Google
     * Map API v3. This is an async function so it will return a promise.
     * @param  {string} location The name of any location
     * @return {array}           Returns an array in the form [latitude, longitude]
     */
    function getCoordinate(location) {
    	var url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&sensor=false';
    	return new Promise(function (resolve) {
    		fetch(url).then(function (data) {
    			return data.json();
    		}).then(function (json) {
    			return resolve([json.results[0].geometry.location.lat, json.results[0].geometry.location.lng]);
    		});
    	});
    }

    /**
     * Returns the template of the Map widget. The source of the iframe is based on whether the
     * mode set in options is 'place', 'streetview' or 'view'.
     * @param  {string} match     The matching string in the form of @(location name).
     * @param  {number} latitude  Latitude of the location
     * @param  {number} longitude Longitude of the location
     * @param  {object} options   plugin options
     * @return {string}           Template of the map widget.
     */
    function template$1(match, latitude, longitude, options) {
    	var location = locationText(match);
    	return options.template.gmap(latitude, longitude, location, options);
    }

    /**
     * Extracts out the location name from the format @(locationName)
     * @param  {string} match The string in the supported format. Eg : @(Delhi)
     * @return {string}       Only the location name removing @ and brackets. Eg: Delhi
     */
    function locationText(match) {
    	return match.split('(')[1].split(')')[0];
    }

    function gmap (input, output, options, embeds) {
    	var match = void 0,
    	    promises = [],
    	    allMatches = [];

    	var service = 'map';

    	while ((match = matches(regex.gmap, output)) !== null) {
    		options.served.push(match);
    		var promise = options.mapOptions.mode !== 'place' ? getCoordinate(match[0]) : Promise.resolve([null, null]);
    		promises.push(promise);
    		allMatches.push(match);
    	}

    	return new Promise(function (resolve) {
    		Promise.all(promises).then(function (coordinatesArr) {
    			var _loop = function _loop() {
    				var _coordinatesArr$i = babelHelpers.slicedToArray(coordinatesArr[i], 2);

    				var latitude = _coordinatesArr$i[0];
    				var longitude = _coordinatesArr$i[1];

    				var text = template$1(allMatches[i][0], latitude, longitude, options);
    				if (ifInline(options, service)) {
    					output = output.replace(regex.gmap, function (regexMatch) {
    						return '<span class="ejs-location">' + locationText(regexMatch) + '</span>' + text;
    					});
    				} else {
    					embeds.push({
    						text: text,
    						index: allMatches[i][0].index
    					});
    					output = output.replace(regex.gmap, function (regexMatch) {
    						return '<span class="ejs-location">' + locationText(regexMatch) + '</span>';
    					});
    				}
    			};

    			for (var i in promises) {
    				_loop();
    			}
    			resolve([output, embeds]);
    		});
    	});
    }

    function markdown (output, options) {
    	if (!options.plugins.marked) throw new ReferenceError('marked.js is not loaded.');

    	var Marked = options.plugins.marked;
    	var renderer = new Marked.Renderer();

    	renderer.link = function (href, title, text) {
    		if (href.indexOf('&lt;/a') === -1) return href;
    		if (href.match(/&gt;(.+)&lt;\/a/gi)) {
    			if (!title) title = '';
    			return '<a href="' + RegExp.$1 + '" rel=' + options.linkOptions.rel + '" target="' + options.linkOptions.target + '" title="' + title + '">' + text + '</a>';
    		}
    	};

    	renderer.image = function (href, title, text) {
    		if (href.match(/&gt;(.+)&lt;\/a/gi)) {
    			if (!title) title = '';
    			return '<div class="ejs-image ejs-embed"><div class="ne-image-wrapper"><img src="' + RegExp.$1 + '" title="' + title + '" alt="' + text + '"/></div></div>';
    		}
    		return '<div class="ejs-image ejs-embed"><div class="ne-image-wrapper"><img src="' + href + '" title="' + title + '" alt="' + text + '"/></div></div>';
    	};

    	renderer.paragraph = function (text) {
    		return '<p> ' + text + ' </p>';
    	}; //for font smiley in end.

    	//Fix for heading that should be actually present in marked.js
    	//if gfm is true the `## Heading` is acceptable but `##Heading` is not
    	Marked.Lexer.rules.gfm.heading = Marked.Lexer.rules.normal.heading;
    	Marked.Lexer.rules.tables.heading = Marked.Lexer.rules.normal.heading;

    	options.markedOptions.renderer = renderer;
    	options.markedOptions.highlight = false;
    	return Marked(output, options.markedOptions);
    }

    /**
     * Encodes the characters like <, > and space and replaces them with
     * &lt;, &gt; and &gt; respectively.
     * @param  {string} code The string that has to be encoded.
     * @return {string}      The encoded string
     */
    function encode(code) {
    	code = code.replace(/&amp;/gm, '');
    	code = code.replace(/&lt;/g, '<');
    	code = code.replace(/&gt;/g, '>');
    	return code;
    }

    /**
     * removes whitespace characters
     * @param  {string} code The string from which the whitespace has to be removed
     * @return {string}
     */
    function trimSpace(code) {
    	code = code.replace(/^([ \t]*)/g, ''); // leading whitespace
    	code = code.replace(/[ \t]*$/g, ''); // trailing whitespace
    	return code;
    }

    /**
     * Places the code and the language name in the required template
     * @param {string} processedCode
     * @param {string} language
     * @return {string}
     */
    function addTemplate(processedCode, language) {
    	return '<pre><code class="ejs-code hljs ' + language + '">' + (processedCode.value || processedCode) + '</code></pre>';
    }

    /**
     * Replaces the code block with the pre tags and returns a string having the code
     * formatting using Highlight.js.
     * => Matches the string with the regex and finds the code written in three back-ticks ```
     * => Detects whether any language has been provided by the user.
     *     The format supported by embed.js is
     *         ```[language-name]
     *         var a = 2;
     *         ```
     * => Trims all the unnecessary spaces and newlines from the code.
     * => Passes the code to `hljs.highlightAuto(code, language)` which returns a formatted string
     *     having the html tags for styling. The `language` here is optional. In case we don't pass the
     *     language, it tries to detect the language itself.
     * => Replaces the code string in the template with the formatted string
     * @return {string} The string in which the code is formatted
     */
    function highlight (output, options) {
    	output = output.replace(regex.inlineCode, function (match, group1, group2) {
    		return '<code>' + group2 + '</code>';
    	});

    	return output.replace(regex.highlightCode, function (match, group1, group2, group3) {
    		var code = group3;
    		code = trimSpace(code);
    		code = encode(code);

    		// to prevent auto-linking. Not necessary in code
    		// *blocks*, but in code spans. Will be converted
    		// back after the auto-linker runs.
    		code = code.replace(/:\/\//g, '~P');

    		var language = group2.split('\n')[0];
    		var highlightedCode = void 0;

    		var HighlightJS = options.plugins.highlightjs;
    		if (language) {
    			highlightedCode = HighlightJS.highlightAuto(code, [language]);
    		} else {
    			highlightedCode = HighlightJS.highlightAuto(code);
    			language = highlightedCode.language;
    		}

    		return addTemplate(highlightedCode, language);
    	});
    }

    var Gist = function () {
    	function Gist(input, output, options, embeds) {
    		var _this = this;

    		babelHelpers.classCallCheck(this, Gist);

    		this.input = input;
    		this.output = output;
    		this.options = options;
    		this.embeds = embeds;
    		this.regex = regex.gist;
    		this.service = 'gist';

    		if (typeof this.options.input !== 'string') {
    			this.options.input.addEventListener('rendered', function () {
    				_this.load();
    			});
    		}
    	}

    	babelHelpers.createClass(Gist, [{
    		key: 'template',
    		value: function template(match) {
    			return '<div class="ejs-gist" data-src="' + match + '"></div>';
    		}
    	}, {
    		key: 'load',
    		value: function load() {
    			var gists = this.options.input.getElementsByClassName('ejs-gist');
    			for (var i = 0; i < gists.length; i++) {
    				var gistFrame = document.createElement("iframe");
    				gistFrame.setAttribute("width", "100%");
    				gistFrame.id = 'ejs-gist-' + i;

    				var zone = gists[i];
    				zone.innerHTML = "";
    				zone.appendChild(gistFrame);

    				// Create the iframe's document
    				var url = gists[i].getAttribute('data-src');
    				url = url.indexOf('http') === -1 ? 'https://' + url : url;
    				var gistFrameHTML = '<html><base target="_parent"/><body onload="parent.document.getElementById(\'ejs-gist-' + i + '\').style.height=parseInt(document.body.scrollHeight)+20+\'px\'"><script type="text/javascript" src="' + url + '.js"></script></body></html>';

    				// Set iframe's document with a trigger for this document to adjust the height
    				var gistFrameDoc = gistFrame.document;

    				if (gistFrame.contentDocument) {
    					gistFrameDoc = gistFrame.contentDocument;
    				} else if (gistFrame.contentWindow) {
    					gistFrameDoc = gistFrame.contentWindow.document;
    				}

    				gistFrameDoc.open();
    				gistFrameDoc.writeln(gistFrameHTML);
    				gistFrameDoc.close();
    			}
    		}
    	}, {
    		key: 'process',
    		value: function process() {
    			return embed(this);
    		}
    	}]);
    	return Gist;
    }();

    function formatData(data) {
    	return {
    		title: data.snippet.title,
    		thumbnail: data.snippet.thumbnails.medium.url,
    		rawDescription: data.snippet.description,
    		views: data.statistics.viewCount,
    		likes: data.statistics.likeCount,
    		description: truncate(data.snippet.description, 150),
    		url: 'https://www.youtube.com/watch?v=' + data.id,
    		id: data.id,
    		host: 'youtube'
    	};
    }

    function data(id, options) {
    	var url = 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=' + options.googleAuthKey + '&part=snippet,statistics';
    	return new Promise(function (resolve) {
    		fetch(url).then(function (data) {
    			return data.json();
    		}).then(function (json) {
    			return resolve(json.items[0]);
    		});
    	});
    }

    function urlToText(args, match, url, normalEmbed) {
    	var id = normalEmbed ? match[1] : match[2];
    	var embedUrl = 'https://www.youtube.com/embed/' + id;
    	if (args.options.videoDetails) {
    		return new Promise(function (resolve) {
    			data(id, args.options).then(function (data) {
    				return resolve(getDetailsTemplate(formatData(data), data, embedUrl, args.options));
    			});
    		});
    	} else {
    		return new Promise(function (resolve) {
    			return resolve(template(embedUrl, args.options));
    		});
    	}
    }

    function youtube (input, output, options, embeds) {
    	var args = {
    		input: input,
    		output: output,
    		options: options,
    		embeds: embeds,
    		regex: regex.youtube,
    		service: 'youtube'
    	};

    	return new Promise(function (resolve) {
    		return asyncEmbed(args, urlToText).then(function (data) {
    			return resolve(data);
    		});
    	});
    }

    function formatData$1(data, truncate) {
    	return {
    		title: data.title,
    		thumbnail: data.thumbnail_medium,
    		rawDescription: data.description.replace(/\n/g, '<br/>').replace(/&#10;/g, '<br/>'),
    		views: data.stats_number_of_plays,
    		likes: data.stats_number_of_likes,
    		description: truncate(data.description.replace(/((<|&lt;)br\s*\/*(>|&gt;)\r\n)/g, ' '), 150),
    		url: data.url,
    		id: data.id,
    		host: 'vimeo'
    	};
    }

    function data$1(id) {
    	var url = 'https://vimeo.com/api/v2/video/' + id + '.json';
    	return new Promise(function (resolve) {
    		fetch(url).then(function (data) {
    			return data.json();
    		}).then(function (json) {
    			return resolve(json[0]);
    		});
    	});
    }

    function urlToText$1(args, match, url, normalEmbed) {
    	var id = void 0;
    	if (!normalEmbed) {
    		id = args.options.link ? match[0].slice(0, -4).split('/').slice(-1).pop() : match[0].split('/').slice(-1).pop();
    	} else {
    		id = match[3];
    	}
    	if (!id) return;
    	var embedUrl = 'https://player.vimeo.com/video/' + id;
    	if (args.options.videoDetails) {
    		return new Promise(function (resolve) {
    			data$1(id).then(function (data) {
    				return resolve(getDetailsTemplate(formatData$1(data, truncate), data, embedUrl, args.options));
    			});
    		});
    	} else {
    		return new Promise(function (resolve) {
    			return resolve(template(embedUrl, args.options));
    		});
    	}
    }

    function vimeo (input, output, options, embeds) {
    	var args = {
    		input: input,
    		output: output,
    		options: options,
    		embeds: embeds,
    		regex: regex.vimeo,
    		service: 'vimeo'
    	};

    	return new Promise(function (resolve) {
    		return asyncEmbed(args, urlToText$1).then(function (data) {
    			return resolve(data);
    		});
    	});
    }

    function fetchData(args, url) {
    	var api = 'http://www.slideshare.net/api/oembed/2?url=' + url + '&format=jsonp&maxwidth=' + args.options.videoWidth + '&maxheight=' + args.options.videoHeight;
    	return new Promise(function (resolve) {
    		fetchJsonp$1(api, { credentials: 'include' }).then(function (data) {
    			return data.json();
    		}).then(function (json) {
    			return resolve(json.html);
    		});
    	});
    }

    function urlToText$2(args, match, url) {
    	return new Promise(function (resolve) {
    		fetchData(args, url).then(function (html) {
    			return resolve(args.template(html));
    		});
    	});
    }

    function slideShare (input, output, options, embeds) {
    	var args = {
    		input: input, output: output, options: options, embeds: embeds,
    		regex: regex.slideShare,
    		service: 'slideshare',
    		template: function template(html) {
    			return this.options.template.slideShare(html, this.options);
    		}
    	};

    	return new Promise(function (resolve) {
    		return asyncEmbed(args, urlToText$2).then(function (data) {
    			return resolve(data);
    		});
    	});
    }

    function fetchData$1(url, _) {
    	url = encodeURIComponent(url);
    	var api = new Function('url', 'return `' + _.options.openGraphEndpoint + '`')(url);
    	return new Promise(function (resolve) {
    		fetch(api).then(function (res) {
    			return res.json();
    		}).then(function (json) {
    			return resolve(_.options.onOpenGraphFetch(json) || json);
    		});
    	});
    }

    function urlToText$3(_, match, url) {
    	if (url.match(_.excludeRegex)) return Promise.resolve();

    	return new Promise(function (resolve) {
    		fetchData$1(url, _).then(function (data) {
    			return resolve(data && data.success ? _.template(data) : '');
    		});
    	});
    }

    function openGraph (input, output, options, embeds) {
    	var args = {
    		input: input,
    		output: output,
    		options: options,
    		embeds: embeds,
    		service: 'opengraph',
    		regex: urlRegex(),
    		excludeRegex: new RegExp(['.mp4|.mp3|.gif|.pdf|.doc|.ppt|.docx|.jpg|.jpeg|.ogg'].concat(options.openGraphExclude).join('|'), 'gi'),
    		template: function template(data) {
    			return this.options.template.openGraph(data, this.options);
    		}
    	};

    	return new Promise(function (resolve) {
    		return asyncEmbed(args, urlToText$3).then(function (data) {
    			return resolve(data);
    		});
    	});
    }

    function template$2(data, options) {
    	return options.template.github(data, options);
    }

    function fetchRepo(data) {
    	var api = 'https://api.github.com/repos/' + data.user + '/' + data.repo;
    	return new Promise(function (resolve) {
    		fetch(api).then(function (data) {
    			return data.json();
    		}).then(function (json) {
    			return resolve(json);
    		});
    	});
    }

    function urlToText$4(_this, match, url, normalEmbed) {
    	var data = !normalEmbed ? {
    		user: match[2],
    		repo: match[3]
    	} : {
    		user: match[1],
    		repo: match[2]
    	};

    	if (!data.repo) return;
    	return new Promise(function (resolve) {
    		fetchRepo(data).then(function (response) {
    			return resolve(template$2(response, _this.options));
    		});
    	});
    }

    function github (input, output, options, embeds) {
    	var args = {
    		input: input, output: output, options: options, embeds: embeds,
    		service: 'github',
    		regex: regex.github
    	};

    	return new Promise(function (resolve) {
    		return asyncEmbed(args, urlToText$4).then(function (data) {
    			return resolve(data);
    		});
    	});
    }

    function mentions (input, options) {
    	var mRegex = regex.mentions;
    	return input.replace(mRegex, function (match) {
    		var username = match.split('@')[1];
    		return options.mentionsUrl(username);
    	});
    }

    function hashtag (input, options) {
    	var hRegex = regex.hashtag;
    	return input.replace(hRegex, function (match) {
    		var username = match.split('#')[1];
    		return options.hashtagUrl(username);
    	});
    }

    var globalOptions = {};

    var defaultOptions = {
    	marked: false,
    	markedOptions: {},
    	link: true,
    	linkOptions: {
    		target: 'self',
    		exclude: ['pdf'],
    		rel: ''
    	},
    	emoji: true,
    	customEmoji: [],
    	fontIcons: true,
    	customFontIcons: [],
    	highlightCode: false,
    	mentions: false,
    	hashtag: false,
    	videoJS: false,
    	videojsOptions: {
    		fluid: true,
    		preload: 'metadata'
    	},
    	plyr: false,
    	plyrOptions: {},
    	locationEmbed: true,
    	mapOptions: {
    		mode: 'place'
    	},
    	tweetsEmbed: false,
    	tweetOptions: {
    		maxWidth: 550,
    		hideMedia: false,
    		hideThread: false,
    		align: 'none',
    		lang: 'en'
    	},
    	singleEmbed: false,
    	openGraphEndpoint: null,
    	openGraphExclude: [],
    	videoEmbed: true,
    	videoHeight: null,
    	videoWidth: null,
    	videoDetails: true,
    	audioEmbed: true,
    	imageEmbed: true,
    	excludeEmbed: [],
    	inlineEmbed: [],
    	inlineText: true,
    	codeEmbedHeight: 500,
    	vineOptions: {
    		maxWidth: null,
    		type: 'postcard', //'postcard' or 'simple' embedding
    		responsive: true,
    		width: 350,
    		height: 460
    	},
    	plugins: {
    		marked: window.marked,
    		videojs: window.videojs,
    		plyr: window.plyr,
    		highlightjs: window.hljs,
    		prismjs: window.Prism,
    		twitter: window.twttr
    	},
    	googleAuthKey: '',
    	soundCloudOptions: {
    		height: 160,
    		themeColor: 'f50000', //Hex Code of the player theme color
    		autoPlay: false,
    		hideRelated: false,
    		showComments: true,
    		showUser: true,
    		showReposts: false,
    		visual: false, //Show/hide the big preview image
    		download: false //Show/Hide download buttons
    	},
    	videoClickClass: 'ejs-video-thumb',
    	customVideoClickHandler: false,
    	mentionsUrl: function mentionsUrl() {},
    	hashtagUrl: function hashtagUrl() {},
    	beforeEmbedJSApply: function beforeEmbedJSApply() {},
    	afterEmbedJSApply: function afterEmbedJSApply() {},
    	onVideoShow: function onVideoShow() {},
    	onTweetsLoad: function onTweetsLoad() {},
    	videojsCallback: function videojsCallback() {},
    	onOpenGraphFetch: function onOpenGraphFetch() {},
    	onOpenGraphFail: function onOpenGraphFail() {},
    	videoClickHandler: function videoClickHandler() {},
    	served: [] //Private variable used to store processed urls so that they are not processed multiple times.
    };

    var instances = [];
    var allInstances = [];
    var promises = [];

    var EmbedJS = function () {
    	/**
      * The constructor takes two arguements. The first one is the options object and the second one is the
      * optional string . If the user wants to provide a string directly instead of the element, he can do that.
      * In case the user provides both the input element and the string, the input string will be taken from the element
      * and the provided string won't be processed.
      *
      * @param  {object} options The options object
      * @param template
      * @return {null}
      */

    	function EmbedJS(options, template) {
    		babelHelpers.classCallCheck(this, EmbedJS);

    		/**
       * We have created a clone of the original options to make sure that the original object
       * isn't altered.
       */
    		var defOpts = cloneObject(defaultOptions);
    		var globOpts = cloneObject(globalOptions);

    		//merge global options with the default options
    		var globOptions = deepExtend(defOpts, globOpts);

    		//deepExtend global options with the overriding options provided by the user as an options
    		//object while creating a new instance of embed.js
    		this.options = deepExtend(globOptions, options);

    		this.options.template = template || renderer;

    		if (!this.options.input || !(typeof this.options.input === 'string' || babelHelpers.typeof(this.options.input) === 'object')) throw ReferenceError("You need to pass an element or the string that needs to be processed");

    		this.input = babelHelpers.typeof(this.options.input) === 'object' ? this.options.input.innerHTML : this.options.input;
    	}

    	/**
      * Processes the string and performs all the insertions and manipulations based on
      * the options and the input provided by the user. This returns a promise which is resolved once the result data is ready
      * @return {Promise} The processes resulting string
      */


    	babelHelpers.createClass(EmbedJS, [{
    		key: 'process',
    		value: function process() {
    			var _this = this;

    			var input = this.input;
    			var options = processOptions(this.options);
    			var embeds = [];
    			var output = input;

    			this.options.beforeEmbedJSApply();

    			return new Promise(function (resolve) {
    				if (options.link) output = url(input, options);

    				var openGraphPromise = options.openGraphEndpoint ? openGraph(input, output, options, embeds) : Promise.resolve([output, embeds]);

    				openGraphPromise.then(function (_ref) {
    					var _ref2 = babelHelpers.slicedToArray(_ref, 2);

    					var output = _ref2[0];
    					var embeds = _ref2[1];

    					if (options.highlightCode) {
    						output = highlight(output, options);
    					}
    					if (options.marked) {
    						output = markdown(output, options);
    					}
    					if (options.emoji) {
    						output = emoji(output, options);
    					}
    					if (options.fontIcons) {
    						output = smiley(output, options);
    					}
    					if (options.mentions) {
    						output = mentions(output, options);
    					}
    					if (options.hashtag) {
    						output = hashtag(output, options);
    					}

    					var _baseEmbed = baseEmbed(input, output, embeds, options, regex.ideone, 'ideone');

    					var _baseEmbed2 = babelHelpers.slicedToArray(_baseEmbed, 2);

    					output = _baseEmbed2[0];
    					embeds = _baseEmbed2[1];

    					var _baseEmbed3 = baseEmbed(input, output, embeds, options, regex.plunker, 'plunker');

    					var _baseEmbed4 = babelHelpers.slicedToArray(_baseEmbed3, 2);

    					output = _baseEmbed4[0];
    					embeds = _baseEmbed4[1];

    					var _baseEmbed5 = baseEmbed(input, output, embeds, options, regex.jsbin, 'jsbin');

    					var _baseEmbed6 = babelHelpers.slicedToArray(_baseEmbed5, 2);

    					output = _baseEmbed6[0];
    					embeds = _baseEmbed6[1];

    					var _baseEmbed7 = baseEmbed(input, output, embeds, options, regex.codepen, 'codepen');

    					var _baseEmbed8 = babelHelpers.slicedToArray(_baseEmbed7, 2);

    					output = _baseEmbed8[0];
    					embeds = _baseEmbed8[1];

    					var _baseEmbed9 = baseEmbed(input, output, embeds, options, regex.jsfiddle, 'jsfiddle');

    					var _baseEmbed10 = babelHelpers.slicedToArray(_baseEmbed9, 2);

    					output = _baseEmbed10[0];
    					embeds = _baseEmbed10[1];

    					var _baseEmbed11 = baseEmbed(input, output, embeds, options, regex.ted, 'ted');

    					var _baseEmbed12 = babelHelpers.slicedToArray(_baseEmbed11, 2);

    					output = _baseEmbed12[0];
    					embeds = _baseEmbed12[1];

    					var _baseEmbed13 = baseEmbed(input, output, embeds, options, regex.dailymotion, 'dailymotion');

    					var _baseEmbed14 = babelHelpers.slicedToArray(_baseEmbed13, 2);

    					output = _baseEmbed14[0];
    					embeds = _baseEmbed14[1];

    					var _baseEmbed15 = baseEmbed(input, output, embeds, options, regex.ustream, 'ustream');

    					var _baseEmbed16 = babelHelpers.slicedToArray(_baseEmbed15, 2);

    					output = _baseEmbed16[0];
    					embeds = _baseEmbed16[1];

    					var _baseEmbed17 = baseEmbed(input, output, embeds, options, regex.liveleak, 'liveleak');

    					var _baseEmbed18 = babelHelpers.slicedToArray(_baseEmbed17, 2);

    					output = _baseEmbed18[0];
    					embeds = _baseEmbed18[1];

    					var _baseEmbed19 = baseEmbed(input, output, embeds, options, regex.basicVideo, 'video', options.videoEmbed);

    					var _baseEmbed20 = babelHelpers.slicedToArray(_baseEmbed19, 2);

    					output = _baseEmbed20[0];
    					embeds = _baseEmbed20[1];

    					var _baseEmbed21 = baseEmbed(input, output, embeds, options, regex.vine, 'vine');

    					var _baseEmbed22 = babelHelpers.slicedToArray(_baseEmbed21, 2);

    					output = _baseEmbed22[0];
    					embeds = _baseEmbed22[1];

    					var _baseEmbed23 = baseEmbed(input, output, embeds, options, regex.soundCloud, 'soundcloud');

    					var _baseEmbed24 = babelHelpers.slicedToArray(_baseEmbed23, 2);

    					output = _baseEmbed24[0];
    					embeds = _baseEmbed24[1];

    					var _baseEmbed25 = baseEmbed(input, output, embeds, options, regex.spotify, 'spotify');

    					var _baseEmbed26 = babelHelpers.slicedToArray(_baseEmbed25, 2);

    					output = _baseEmbed26[0];
    					embeds = _baseEmbed26[1];

    					var _baseEmbed27 = baseEmbed(input, output, embeds, options, regex.basicAudio, 'audio', options.audioEmbed);

    					var _baseEmbed28 = babelHelpers.slicedToArray(_baseEmbed27, 2);

    					output = _baseEmbed28[0];
    					embeds = _baseEmbed28[1];

    					var _baseEmbed29 = baseEmbed(input, output, embeds, options, regex.flickr, 'flickr');

    					var _baseEmbed30 = babelHelpers.slicedToArray(_baseEmbed29, 2);

    					output = _baseEmbed30[0];
    					embeds = _baseEmbed30[1];

    					var _baseEmbed31 = baseEmbed(input, output, embeds, options, regex.instagram, 'instagram');

    					var _baseEmbed32 = babelHelpers.slicedToArray(_baseEmbed31, 2);

    					output = _baseEmbed32[0];
    					embeds = _baseEmbed32[1];

    					var _baseEmbed33 = baseEmbed(input, output, embeds, options, regex.basicImage, 'image', options.imageEmbed);

    					var _baseEmbed34 = babelHelpers.slicedToArray(_baseEmbed33, 2);

    					output = _baseEmbed34[0];
    					embeds = _baseEmbed34[1];


    					if (ifEmbed(options, 'gist')) {
    						var _process = new Gist(input, output, options, embeds).process();

    						var _process2 = babelHelpers.slicedToArray(_process, 2);

    						output = _process2[0];
    						embeds = _process2[1];
    					}

    					return ifEmbed(options, 'youtube') ? youtube(input, output, options, embeds) : Promise.resolve([output, embeds]);
    				}).then(function (_ref3) {
    					var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

    					var output = _ref4[0];
    					var embeds = _ref4[1];

    					return ifEmbed(options, 'vimeo') ? vimeo(input, output, options, embeds) : Promise.resolve([output, embeds]);
    				}).then(function (_ref5) {
    					var _ref6 = babelHelpers.slicedToArray(_ref5, 2);

    					var output = _ref6[0];
    					var embeds = _ref6[1];

    					return ifEmbed(options, 'github') ? github(input, output, options, embeds) : Promise.resolve([output, embeds]);
    				}).then(function (_ref7) {
    					var _ref8 = babelHelpers.slicedToArray(_ref7, 2);

    					var output = _ref8[0];
    					var embeds = _ref8[1];

    					return options.locationEmbed && ifEmbed(options, 'gmap') ? gmap(input, output, options, embeds) : Promise.resolve([output, embeds]);
    				}).then(function (_ref9) {
    					var _ref10 = babelHelpers.slicedToArray(_ref9, 2);

    					var output = _ref10[0];
    					var embeds = _ref10[1];

    					return ifEmbed(options, 'slideshare') ? slideShare(input, output, options, embeds) : Promise.resolve([output, embeds]);
    				}).then(function (_ref11) {
    					var _ref12 = babelHelpers.slicedToArray(_ref11, 2);

    					var output = _ref12[0];
    					var embeds = _ref12[1];

    					if (options.tweetsEmbed && ifEmbed(options, 'twitter')) {
    						_this.twitter = new Twitter(input, output, options, embeds);
    						return _this.twitter.process();
    					} else {
    						return Promise.resolve([output, embeds]);
    					}
    				}).then(function (_ref13) {
    					var _ref14 = babelHelpers.slicedToArray(_ref13, 2);

    					var output = _ref14[0];
    					var embeds = _ref14[1];

    					_this.data = {
    						input: options.input,
    						output: output,
    						options: options,
    						inputString: _this.input,
    						/**
          	 TODO:
           - Restructure served urls structure with services name
          	 */

    						services: options.served,
    						template: options.template
    					};

    					resolve(createText(output, embeds));
    				});
    			});
    		}

    		/**
       * First processes the data by calling the .process() and then renders the data in the div
       * => Loads the twitter widgets
       * => Executes the onTweetsLoad() once all the tweets have been rendered
       * => Applies video.js on the media (both audio and video)
       * => Triggers video loading on click of the video preview
       * => Executes afterEmbedJSApply() once everything is done.
       *
       * @return Promise
       */

    	}, {
    		key: 'render',
    		value: function render() {
    			var _this2 = this;

    			if (typeof this.options.input === 'string') throw new Error('You cannot call render method for a string');
    			if (!this.options.input) throw new Error('You didn\'t pass an element while creating this instance. render() method can\'t work without an input element');

    			return new Promise(function (resolve) {
    				_this2.process().then(function (data) {
    					_this2.options.input.innerHTML = data;
    					_this2.applyListeners();
    					resolve(_this2.data);
    				});
    			});
    		}

    		/**
       * This method listens to all the events like click, handle
       * events to be done after an element has been rendered. These
       * include twitter widget rendering, gist embedding, click event listeners .
       */

    	}, {
    		key: 'applyListeners',
    		value: function applyListeners() {
    			applyVideoJS(this.options);
    			applyPlyr(this.options);

    			playVideo(this.options);

    			var event = new Event('rendered');
    			this.options.input.dispatchEvent(event);

    			this.options.afterEmbedJSApply();
    		}

    		/**
       * This function updates the parametrs of the current instance
       * @param options   New updated options object. will be extended with the older options
       * @param template  [optional] the new template instance
       */

    	}, {
    		key: 'update',
    		value: function update(options, template) {

    			if (options) this.options = deepExtend(this.options, options);

    			if (template) this.options.template = template;

    			if (!this.options.input || !(typeof this.options.input === 'string' || babelHelpers.typeof(this.options.input) === 'object')) throw ReferenceError("You need to pass an element or the string that needs to be processed");

    			this.input = babelHelpers.typeof(this.options.input) === 'object' ? this.options.input.innerHTML : this.options.input;
    		}

    		/**
       * returns the resulting string based on the input and the options passed by the user.
       * @return Promise
       */

    	}, {
    		key: 'text',
    		value: function text(callback) {
    			var _this3 = this;

    			this.process().then(function (data) {
    				return callback(data, _this3.input);
    			});
    		}

    		/**
       * The destroy method destroys all the listeners and replaces the rih text with the original text in the
       * element.
       * @return {null}
       */

    	}, {
    		key: 'destroy',
    		value: function destroy() {
    			if (babelHelpers.typeof(this.options.input) !== 'object') throw new Error('destroy() method only works if an element had been passed in the options object');
    			destroyVideos('ejs-video-thumb');
    			if (this.options.tweetsEmbed) this.options.input.removeEventListener('rendered', this.twitter.load(), false);
    			this.options.input.innerHTML = this.input;
    		}

    		/**
       * Sets options globally
       * @param {object} options
       */

    	}], [{
    		key: 'setOptions',
    		value: function setOptions(options) {
    			globalOptions = deepExtend(defaultOptions, options);
    		}

    		/**
       * Applies embed.js to all the elements with the class name provided as option
       * @return {Promise}
       * @param selectorName
       * @param options
       * @param template
       */

    	}, {
    		key: 'applyEmbedJS',
    		value: function applyEmbedJS(selectorName) {
    			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    			var template = arguments.length <= 2 || arguments[2] === undefined ? renderer : arguments[2];

    			var elements = document.querySelectorAll(selectorName);
    			for (var i = 0; i < elements.length; i++) {
    				options.input = elements[i];
    				instances[i] = new EmbedJS(options, template);
    				promises[i] = instances[i].render();
    			}
    			return new Promise(function (resolve) {
    				Promise.all(promises).then(function (val) {
    					resolve(val);
    				});
    			});
    		}

    		/**
       * Destroys all the instances of EmbedJS created by using applyEmbedJS() method.
       * @return {null}
       */

    	}, {
    		key: 'destroyEmbedJS',
    		value: function destroyEmbedJS() {
    			for (var i = 0; i < instances.length; i++) {
    				instances[i].destroy();
    			}
    		}

    		/**
       * Destroys all instances of EmbedJS on the page
       * @return {null}
       */

    	}, {
    		key: 'destroyAll',
    		value: function destroyAll() {
    			for (var i = 0; i < allInstances.length; i++) {
    				allInstances[i].destroy();
    			}
    		}

    		/**
       * Creates a new instance of the Template constructor. This has been done so that multiple
       * templates of a single service can be used by creating different instances of the Template.
       *
       * The usage of the plugin is described below.
       *
       * => Create a new Instance of the template by using .Template() method of EmbedJS.
       *
       *        var template = EmbedJS.Template()
       *
       * => Now create different templates for different service names.
       *
       *        template.url = function(match, options){
          * 			return '<a href=" + match + "> + match + </a>'
          * 		}
       *
       *        template.instagram = function(match, dimensions, options){
          * 			var config = options.soundCloudOptions;
          * 			return `<div class="ejs-embed ejs-instagram"><iframe src="${toUrl(match.split('/?')[0])}/embed/" height="${dimensions.height}"></iframe></div>`;
          * 		}
       *
       */

    	}, {
    		key: 'Template',
    		value: function Template() {
    			return renderer;
    		}
    	}]);
    	return EmbedJS;
    }();

    return EmbedJS;

}));
//# sourceMappingURL=embed.js.map