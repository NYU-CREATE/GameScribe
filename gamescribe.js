/**
 * @fileOverview Manages the GameScribe shell and contains the javascript SDK.
 * @author Nikolaus Hajny (hajny@nyu.edu)
 * @version 1.2
 */

/**
 * @license
 * GameScribe
 * CREATE Lab, New York University, Steinhardt
 * http://create.nyu.edu
 *
 * Copyright (c) 2015 CREATE Lab.
 * Released under the MIT license
 * https://tldrlegal.com/license/mit-license
 */

/**
 * @module gamescribe
 * @param {DOM object} context
 */


(function (context) {
    /** @global */
    context.gamescribe = context.gamescribe || (function () {

    //Var Properties
    var config = {
            /** @todo SetTimeout for closing sheets when gamescribe will force closeCallbackFxn */
            closeTimeoutSeconds : 5
        },
        /**
         * GameScribe modes describe how a sheet should handle jots.
         * @enum {number}
         */
        modes = {
            /** Jots are immediately discarded.  Jots are not submitted. */
            MODE_OFF : 0,

            /** Jots are submitted and discarded without return receipt. */
            MODE_PERMISSIVE : 1,

            /** Jots are submitted.  Jots are discarded after return receipt. */
            MODE_STRICT : 2,

            /** Jots are not submitted.  Jots are traced in console.log then discarded. */
            MODE_TRACE : 99
        },
        _sheets = [],
        _gsID = false,
        _closeCallbackFxn,

    //Var Private Methods
        m_newID,
        m_modeInt,
        m_handleSheetCloseReturn,
        m_getSheet,
        m_hasSheet,
        m_sdkSend,

    //Var Public Methods
        register,
        launch,
        jotDown,
        sheetProtection,
        closeSheet,
        closeUnprotectedSheets,

    //Var Classes
        Sheet;


    /* ********************************************************************** */
    /*                                      PRIVATE METHODS                   */
    /* ********************************************************************** */
    /**
     * @private
     * Generates a new GUID.
     *
     * @returns {String} guid
     */
    m_newID = function() {
        var ALPHA_CHAR_CODES = [], uid, index, i, j, time, timeString;
        ALPHA_CHAR_CODES = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];
        uid = new Array(36);
        index = 0;
        for (i = 0; i < 8; i++) {
            uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
        }
        for (i = 0; i < 3; i++) {
            uid[index++] = 45;
            for (j = 0; j < 4; j++) {
                uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
            }
        }
        uid[index++] = 45;
        time = new Date().getTime();
        timeString = ("0000000" + time.toString(16).toUpperCase()).substr(-8);
        for (i = 0; i < 8; i++){
            uid[index++] = timeString.charCodeAt(i);
        }
        for (i = 0; i < 4; i++){
            uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
        }
       return String.fromCharCode.apply(null, uid);
    };

    /**
     * @private
     * Translates a mode string into the int id used by a Sheet.
     *
     * @param {string} modeStr
     * @returns {number} modeInt
     */
    m_modeInt = function(modeStr) {
        if (typeof modeStr !== "string") return -1;
        switch (modeStr.toLowerCase()) {
            case "off":         return modes.MODE_OFF; break;
            case "permissive":  return modes.MODE_PERMISSIVE; break;
            case "strict":      return modes.MODE_STRICT; break;
            case "trace":       return modes.MODE_TRACE; break;
        }
      return -1;
    };

    /**
     * @private
     * Calls to Sheet.closeSheet will return here when complete.
     * When all sheets are closed, calls _closeCallbackFxn.
     *
     * @callback sheetClosedCallback
     * @param {string} sheetID
     */
    m_handleSheetCloseReturn = function(sheetID) {
        var sheet, i, newSheets = [], finished = true;
        sheet = m_getSheet(sheetID);
        for (i = 0; i < _sheets.length; i++) {
            if (!_sheets[i].closed() && !_sheets[i].isProtected()) {
                finished = false;
            }
        }
        if (finished) {
            _closeCallbackFxn();
        } else {
            for (i = 0; i < _sheets.length; i++) {
                if (_sheets[i]) newSheets.push(_sheets[i]);
            }
            _sheets = newSheets;
        }
    };

    /**
     * @private
     * Takes a sheet name or sheetID and returns the first sheet in the list,
     * If no sheet is found, returns a blank sheet
     *
     * @param {string} sheetIdentity
     * @returns {Sheet|new Sheet}
     */
    m_getSheet = function(sheetIdentity) {
        var i;
        for (i = 0; i < _sheets.length; i++) {
            if (_sheets[i].name() === sheetIdentity ||
                _sheets[i].id() === sheetIdentity) return _sheets[i];
        }
        return new Sheet(modes);
    };

    /**
     * @private
     * Takes sheet name or sheetID and returns true if a sheet exists.
     *
     * @param {string} sheetIdentity
     * @returns {Boolean} success
     */
    m_hasSheet = function(sheetIdentity) {
        var i;
        for (i = 0; i < _sheets.length; i++) {
            if (_sheets[i].name() === sheetIdentity ||
                _sheets[i].id() === sheetIdentity) return true;
        }
        return false;
    };

    m_sdkSend = function(regObject, gsMsg) {
        switch (regObject.environment) {
            case "js":
                regObject.captureFxn(gsMsg);
                break;
            case "as":
                document.getElementById(regObject.elemID)[regObject.captureFxn](gsMsg);
                break;
            case "unity":
                gsMsg.uKey = regObject.uKey;
                SendMessage(regObject.goName, regObject.captureFxn, JSON.stringify(gsMsg));
                break;
        }
    };

    /* ********************************************************************* */
    /*                         PUBLIC METHODS                                */
    /* ********************************************************************* */
    /**
     * @public
     *
     * @param {object<regObject>|string} name
     * @param {string} key
     * @param {string} mode
     * @param {string} url
     * @returns false if invalid params, {string}sheetID if name != {regObject}
     */
    register = function(name, key, mode, url) {
        var sheet, uID, regObject = {};
        if (!_gsID) _gsID = m_newID().substr(0, 8);
        uID = _gsID + "_" + m_newID().substr(-12, 12);
        sheet = new Sheet(modes);
        if (name.hasOwnProperty("src")) {
            regObject = name;
        } else if (typeof name === "string") {
            try {
                regObject = JSON.parse(name);
            } catch(e) {
                regObject = {
                    gameName : name,
                    gameKey : key,
                    mode : mode,
                    url : url,
                    environment : "unknown"
                };
            }
        }
        if (regObject.hasOwnProperty("gameName") &&
            regObject.hasOwnProperty("gameKey") &&
            regObject.hasOwnProperty("mode") &&
            regObject.hasOwnProperty("url") &&
            regObject.hasOwnProperty("environment"))
        {
            regObject.hasSDK = (regObject.hasOwnProperty("src") && regObject.src === "sdk");
            regObject.modeInt = m_modeInt(regObject.mode);
            if (sheet.init(regObject, m_newID(), _gsID, uID, m_sdkSend)) {
                _sheets.push(sheet);
                if (!regObject.hasSDK) {
                    return sheet.id();
                } else {
                    m_sdkSend(regObject, {
                                signal : "registered",
                                success : true,
                                sheetKey : sheet.id() });
                }
            }
        }
        return false;
    };

    /**
     * @public
     *
     * @param {string} sheetKey
     * @param {string} gameUserID
     * @returns {Boolean} success
     */
    launch = function(sheetKey, gameUserID) {
        var sheet = m_getSheet(sheetKey);
        if (sheet.initialized()) {
            return sheet.startSpider(gameUserID);
        }
        return false;
    };

    getLocalTime = function(){
      Number.prototype.padLeft = function(base,chr){
        var  len = (String(base || 10).length - String(this).length)+1;
        return len > 0? new Array(len).join(chr || '0')+this : this;
      }

      var d = new Date();
      var localTime = (d.getFullYear()).padLeft()+'-'+ (d.getMonth() + 1).padLeft() + "-" + (d.getDate()).padLeft() +" "+[(d.getHours()).padLeft(), (d.getMinutes()).padLeft(), (d.getSeconds()).padLeft()].join(':');

      return localTime;
    }

    /**
     * @public
     *
     * @param {Object|string} jotID
     * @param {string} writer
     * @param {number} gameTime
     * @param {number} gameCode
     * @param {Array<string>} dns
     * @returns {undefined} nothing returned
     */
    jotDown = function(jotID, writer, gameTime, gameCode, dns) {
        var sheet, dnsArr, jotObj = {};


        if (jotID.hasOwnProperty("sheetKey")) {
            jotObj = jotID;
        } else if (typeof jotID === "string") {
            try {
                jotObj = JSON.parse(jotID);
            } catch(e) {
                jotObj = {
                    sheetKey : jotID,
                    writer : writer,
                    gameTime : gameTime,
                    gameCode : gameCode,
                    localTimestamp : getLocalTime()
                };
                if (dns.length === 0) {
                    dnsArr = [];
                } else if (dns[0].constructor === Array) {
                    dnsArr = dns[0];
                } else if (dns.constructor === Array) {
                    dnsArr = dns;
                } else {
                    dnsArr = Array.prototype.slice.call(arguments).slice(4);
                }
                jotObj.dns = dnsArr;
            }
        }
        if (jotObj.hasOwnProperty("sheetKey")) {
            sheet = m_getSheet(jotObj.sheetKey);
            if (sheet.initialized() &&
                    jotObj.hasOwnProperty("writer") &&
                    jotObj.hasOwnProperty("gameTime") &&
                    jotObj.hasOwnProperty("gameCode")
                ) {
                sheet.recordJot(jotObj);
            }
        }
    };

    /**
     * @public
     *
     * @param {string} sheetIdentity - sheetID to protect or unprotect
     * @param {Boolean} prot - true=protect, false=unprotect
     * @returns {Boolean} success
     */
    sheetProtection = function(sheetIdentity, prot) {
        var sheet = m_getSheet(sheetIdentity);
        if (sheet.initialized()) {
            return sheet.setProtected(prot);
        }
        return false;
    };

    /**
     * @public
     * Closes a sheet by ID. No callback function is fired since the future status of
     * the sheet is unknown.
     *
     * @param {type} sheetKey
     * @returns {undefined}
     */
    closeSheet = function(sheetKey) {
        var sheet = m_getSheet(sheetKey);
        if (sheet.initialized() && !sheet.closed()) {
            //sheet.closeSheet(function(){ });
            sheet.closeSheet(function(){ console.log("closedSheet");});
        }
    };

    /**
     * @public
     * Closes all unprotected sheets.
     * When all sheets are closed, calls @callback _closeCallbackFxn
     *
     * @param {callback} callbackFxn
     * @returns {undefined} noathing immediately returned
     */
    closeUnprotectedSheets = function(callbackFxn) {
        var i, noUnprotected = true;
        _closeCallbackFxn = callbackFxn;
        for (i = 0; i < _sheets.length; i++) {
            if (!_sheets[i].isProtected() && !_sheets[i].closed()) {
                noUnprotected = false;
                _sheets[i].closeSheet(m_handleSheetCloseReturn);
            }
        }
        if (noUnprotected) _closeCallbackFxn();
    };

    /* ********************************************************************* */
    /*                                CLASSES                                */
    /* ********************************************************************* */
    var Sheet = function(gsModes) {
        //Var Properties
        var config = {
                scribeHz : 2,
                maxDataFields : 4,
                minDataFields : 0,
                commaReplace : /~/g,
                gsVersion : "v1p2",
                submitTimeout : 5000,
                timerArray : [10000,
                              15000,
                              30000,
                              60000,
                              120000,
                              240000,
                              480000,
                              960000,
                              192000],
                maxUploadSize : 256000 /** 250kb  */
            },
            apiAction = {
                GET_MAX_POST : "maxPostSize",
                JOT_DOWN : "jotDown",
                CHECK_KEY : "checkGameKey"
            },
            gsCodes = {
                /** GS instance [id] registered a [name] to sheet [key] version [gsVersion]; */
                GS_REGISTERED : 9001,

                /** GS sheet launched with local game id [gameUserID]; */
                GS_LAUNCHED : 9101,

                /** No records to report after [delayTime] millisecond delay; */
                NO_RECORDS_REPORTED : 9995,

                /** RECORDING STOPPED.  No activity for [total delayTime] minutes; */
                GAME_TIMED_OUT : 9999
            },
            modes = gsModes,
            _id, /** sheetKey */
            _name,
            _userID,
            _key,
            _mode,
            _url,
            _initialized = false,
            _jots = [],
            _tempJots = [],
            _callback = false,
            _jotIncrem = 0,
            _startTime = Date.now(),
            _protectedSheet = false,
            _postMaxSize = 0,
            _apiID = 0,
            _environment,
            _regObject,
            _sdkSend,

            _spiderStarted = false,
            _running = false,
            _cycling = false,
            _closing = false,
            _dIndex = 0,
            _cycleID,
            _delayID,

        //Var Private Methods
            m_registerNextApiID,
            m_ajaxSend,
            m_serialize,
            m_apiCapture,
            m_apiError,
            m_formatJot,
            m_jotByID,
            m_setTimer,
            m_cycleSpider,
            m_flagDelay,
            m_submit9999,
            m_submitJots,
            m_traceJot,
            m_ajaxJots,
            m_jotPostString,
            m_jotsPostString,
            m_jotsReturn,
            m_newTimerJot,
            m_allCompleteCheck,

        //Var Public Methods
            closeSheet,
            closed,
            id,
            init,
            initialized,
            isProtected,
            name,
            recordJot,
            setProtected,
            startSpider,
            stopSpider,
            environment;


        /* ********************************************************************* */
        /*                         PRIVATE METHODS                               */
        /* ********************************************************************* */
        m_registerNextApiID = function() { return _apiID++; };

        /**
         * @private
         * Generalized function for sending ajax api calls.
         *
         * @param {object|string} postData - objects will be serialized into urlencoded strings
         * @param {string} apiAction - ApiAction attached to the xmlhttp in case of errors
         * @param {number|undefined} withApiID - ApiID to attach to xmlhttp or none for fxn generates
         */
        m_ajaxSend = function(postData, apiAction, withApiID) {
            var xmlhttp, apiID;
            apiID = (typeof withApiID !== "number") ? _apiID++ : withApiID;
            if (typeof postData === "object") {
                postData = m_serialize(postData);
            }
            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.apiID = apiID;
            xmlhttp.apiAction = apiAction;
            xmlhttp.onreadystatechange = function() { m_apiCapture(xmlhttp); };
            xmlhttp.onerror = function() { m_apiError(xmlhttp); };
            xmlhttp.open("POST", _url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(postData);
        };

        /**
         * @private
         * Serializes an object into a urlencoded string.
         *
         * @param {object} obj
         * @returns {String}
         */
        m_serialize = function(obj) {
            var p, str = [];
            for(p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        };

        /**
         * @private
         * Successful ajax api calls return to this function.
         *
         * @param {XmlHttpRequest} xmlhttp
         */
        m_apiCapture = function(xmlhttp) {
            var apiReceipt;
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                apiReceipt = JSON.parse(xmlhttp.responseText);
                if (apiReceipt.hasOwnProperty("success") && apiReceipt.success &&
                    apiReceipt.hasOwnProperty("requestedAction")) {
                    switch (apiReceipt.requestedAction) {
                        case apiAction.GET_MAX_POST:
                            if (!_spiderStarted) _postMaxSize = apiReceipt.maxBytes;
                            break;
                        case apiAction.JOT_DOWN:
                            m_jotsReturn(apiReceipt, xmlhttp.status);
                            break;
                        case "debug":
                            console.log("debug return");
                            console.log(xmlhttp);
                            break;
                    }
                }
            }
        };

        /**
         * @private
         * Errors from ajax api calls return to this function.
         *
         * @param {XmlHttpRequest} xmlhttp
         */
        m_apiError = function(xmlhttp) {
            var i, apiID;
            if (xmlhttp.readyState === 4) {
                switch (xmlhttp.apiAction) {
                    case apiAction.JOT_DOWN:
                        apiID = xmlhttp.apiID;
                        for (i = 0; i < _jots.length; i++) {
                            if (_jots[i].apiID === apiID) {
                                _jots[i].sent = false;
                                _jots[i].submitting = false;
                                delete _jots[i].apiID;
                                break;
                            }
                        }
                        break;
                }
            }
        };

        /**
         * @private
         * Formats an object into a standard Jot object.
         *
         * @param {Object} jot
         * @returns {Jot}
         */
        m_formatJot = function(jot) {
            if(!jot.hasOwnProperty("id")) jot.id = _jotIncrem++;
            if(!jot.hasOwnProperty("submitting")) jot.submitting = false;
            if(!jot.hasOwnProperty("sent")) jot.sent = false;
            if(!jot.hasOwnProperty("returned")) jot.returned = false;
            if(!jot.hasOwnProperty("complete")) jot.complete = false;
            if(!jot.hasOwnProperty("writer")) jot.writer = "unknown";
            if(!jot.hasOwnProperty("gameTime")) jot.gameTime = -1;
            if(!jot.hasOwnProperty("gameCode")) jot.gameCode = 0;
            if(!jot.hasOwnProperty("sentStat")) jot.sentStat = {};
            if(!jot.sentStat.hasOwnProperty("sentTime")) jot.sentStat.sentTime = 0;
          return jot;
        };

        /**
         * @private
         * Get a Jot by its id.
         *
         * @param {number} jotID
         * @returns {Jot|Boolean} returns a Jot if id is found, or false if not found.
         */
        m_jotByID = function(jotID) {
            var i;
            for (i = 0; i < _jots.length; i++) {
                if (_jots[i].id === jotID) return _jots[i];
            }
          return false;
        };

        /**
         * @private
         * Starts and controls the timers for the spider.
         *
         * @param {number} newIndex
         */
        m_setTimer = function(newIndex) {
            clearTimeout(_cycleID);
            clearTimeout(_delayID);
            _dIndex = newIndex;
            if (!_closing) {
                if (_dIndex < config.timerArray.length) {
                    m_cycleSpider();
                    m_flagDelay();
                } else {
                    m_submit9999();
                }
            } else {
                if (_jots.length > 0) {
                    m_cycleSpider();
                } else {
                    _running = false;
                    _callback(_id);
                }
            }
        };

        /**
         * @private
         * Called by m_setTimer() only.
         */
        m_cycleSpider = function() {
            _cycleID = setTimeout(function() {
                _cycling = true;
                var popJot, newJots = false, hopper = [], toSubmit = [], cycleTime;
                cycleTime = Date.now();
                while (_jots.length > 0) {
                    popJot = _jots.shift();
                    if (!popJot.sent && !popJot.submitting) {
                        if (popJot.gameCode < 9000) newJots = true;
                        if (toSubmit.length < 5000) {
                            popJot.submitting = true;
                            toSubmit.push(popJot);
                        }
                    }
                    if (!popJot.complete) hopper.push(popJot);
                }
                _jots = hopper;
                if (toSubmit.length > 0) m_submitJots(toSubmit);
                while (_tempJots.length > 0) {
                    _jots.push(_tempJots.shift());
                }
                _cycling = false;
                (newJots) ? m_setTimer(0) : m_cycleSpider();
            }, 1000 / config.scribeHz);
        };

        m_flagDelay = function() {
            _delayID = setTimeout(function() {
                var jot = m_newTimerJot(gsCodes.NO_RECORDS_REPORTED, config.timerArray[_dIndex]);
                _jots.push(jot);
               m_setTimer(_dIndex+1);
            }, config.timerArray[_dIndex]);
        };

        m_submit9999 = function() {
            var i, totTime = 0, jot;
            for (i = 0; i < config.timerArray.length; i++) {
                totTime += config.timerArray[i];
            }
            var jot = m_newTimerJot(gsCodes.GAME_TIMED_OUT, totTime);
            _jots.push(jot);
            closeSheet(function(){});
        };

        m_submitJots = function(jots) {
            var i;
            switch (_mode) {
                case modes.MODE_OFF:
                    for (i = 0; i < jots.length; i++) {
                        jots[i].sent = true;
                        jots[i].complete = true;
                        if (_closing) m_allCompleteCheck();
                    }
                    break;
                case modes.MODE_TRACE:
                    for (i = 0; i < jots.length; i++) {
                        jots[i].sent = true;
                        jots[i].complete = true;
                        m_traceJot(jots[i]);
                    }
                    break;
                case modes.MODE_PERMISSIVE:
                    m_ajaxJots(jots, false);
                    break;
                case modes.MODE_STRICT:
                    m_ajaxJots(jots, true);
                    break;
            }
        };


        m_traceJot = function(jot) {
            var traceString = "uID: " + _userID +
                        ", id: " + jot.id +
                        ", writer: " + jot.writer +
                        ", gameTime: " + jot.gameTime +
                        ", localTime: " + jot.localTimestamp +
                        ", gameCode: " + jot.gameCode;
            for (var prop in jot) {
                if (prop.substr(0,1) === "d") {
                    traceString += ", " + prop + ": " + jot[prop];
                }
            }
            if (_closing) m_allCompleteCheck();
        };

    //    /*                                                                        *
    //     * Transmits jot to url in POST
    //     * Return jotReceipt{
    //     *                  sheetID : sheet ID
    //     *                  jotID : id to match with _jots
    //     *                  success : true/false
    //     *                  gsVersion : GameScribe version
    //     *                  requestedAction : action requested of API
    //     *                  }
    //     *                                                                        */
        m_ajaxJots = function(jots, waitOnReceipt) {
            var i, jotPack = {}, srlPost, srlLast, sentTime, jotTemp = [], flagSub, onApiID;

            // Number.prototype.padLeft = function(base,chr){
            //   var  len = (String(base || 10).length - String(this).length)+1;
            //   return len > 0? new Array(len).join(chr || '0')+this : this;
            // }
            //
            // var d = new Date();
            // var localTime = (d.getFullYear()).padLeft()+'-'+ (d.getMonth() + 1).padLeft() + "-" + (d.getDate()).padLeft() +" "+[(d.getHours()).padLeft(), (d.getMinutes()).padLeft(), (d.getSeconds()).padLeft()].join(':');

            onApiID = m_registerNextApiID();
            jotPack.apiAction = apiAction.JOT_DOWN;
            jotPack.gsVersion = config.gsVersion;
            jotPack.userID = _userID;
            jotPack.gameKey = _key;
            jotPack.sheetKey = _id;
            jotPack.jotCount = jots.length;
            jotPack.localTimestamp = getLocalTime();//localTime;
            jotPack.jotSet = JSON.stringify(jots);
            srlPost = m_serialize(jotPack);

            if (srlPost.length > _postMaxSize) {
                flagSub = true;
                jotPack.jotCount = jotTemp.length;
                jotPack.jotSet = JSON.stringify(jotTemp);
                srlLast = m_serialize(jotPack);
                for (i = 0; i < jots.length; i++) {
                    if (flagSub) {
                        jotTemp.push(jots[i]);
                        jotPack.jotCount = jotTemp.length;
                        jotPack.jotSet = JSON.stringify(jotTemp);
                        srlPost = m_serialize(jotPack);
                        if (srlPost.length > _postMaxSize) {
                            srlPost = srlLast;
                            flagSub = false;
                            jots[i].submitting = false;
                            jotTemp.pop();
                        } else {
                            srlLast = srlPost;
                        }
                    } else {
                        jots[i].submitting = false;
                    }
                }
            } else {
                jotTemp = jots;
            }
            m_ajaxSend(srlPost, apiAction.JOT_DOWN, onApiID);

            sentTime = Date.now();
            for (i = 0; i < jotTemp.length; i++) {
                jotTemp[i].sent = true;
                jotTemp[i].sentStat.sentTime = sentTime;
                if (!waitOnReceipt) jotTemp[i].complete = true;
            }
            if (_closing && !waitOnReceipt) m_allCompleteCheck();
        };


        m_jotsReturn = function(apiReceipt, xmlStatus) {
            var jotReceipts, retJot, i, returned = 0, completed = 0;
            if (xmlStatus === 200) {
               if (apiReceipt.hasOwnProperty("sheetID") && apiReceipt.sheetID === _id) {
                    jotReceipts = apiReceipt.jotReceipts;
                    for (i = 0; i < jotReceipts.length; i++) {
                        retJot = m_jotByID(parseInt(jotReceipts[i].jotID));
                        if (retJot) {
                            if (jotReceipts[i].success) {
                                retJot.complete = true;
                                completed++;
                            } else {
                                retJot.sent = false;
                                retJot.submitting = false;
                            }
                            returned++;
                       }
                    }
                    if (_closing) m_allCompleteCheck();
                }
            }
        };

        m_jotPostString = function(jot) {
            var str = m_serialize(jot);
            if(!jot.hasOwnProperty("apiAction")) str += "&" + "apiAction" + "=" + apiAction.JOT_DOWN; //config.apiAction;
            if(!jot.hasOwnProperty("gsVersion")) str += "&" + "gsVersion" + "=" + apiAction.JOT_DOWN; //config.gsVersion;
            if(!jot.hasOwnProperty("userID")) str += "&" + "userID" + "=" + _userID;
            if(!jot.hasOwnProperty("gameKey")) str += "&" + "gameKey" + "=" + _key;
            if(!jot.hasOwnProperty("sheetKey")) str += "&" + "sheetKey" + "=" + _id;
          return str;
        };

        m_jotsPostString = function(jots) {
            var jotPack = {};
            jotPack.apiAction = apiAction.JOT_DOWN; //config.apiAction;
            jotPack.gsVersion = config.gsVersion;
            jotPack.userID = _userID;
            jotPack.gameKey = _key;
            jotPack.sheetKey = _id;
            jotPack.jotCount = jots.length;
            jotPack.jotSet = JSON.stringify(jots);
          return m_serialize(jotPack);
        };

        m_newTimerJot = function(code, seconds) {
            // Number.prototype.padLeft = function(base,chr){
            //   var  len = (String(base || 10).length - String(this).length)+1;
            //   return len > 0? new Array(len).join(chr || '0')+this : this;
            // }
            //
            // var d = new Date();
            // var localTime = (d.getFullYear()).padLeft()+'-'+ (d.getMonth() + 1).padLeft() + "-" + (d.getDate()).padLeft() +" "+[(d.getHours()).padLeft(), (d.getMinutes()).padLeft(), (d.getSeconds()).padLeft()].join(':');


            var jot = {};
            jot = m_formatJot(jot);
            jot.writer = "gamescribe";
            jot.gameTime = String(Date.now() - _startTime);
            jot.gameCode = code;
            jot.localTimestamp = getLocalTime();//localTime;
            jot.d01 = seconds;
            return jot;
        };

        m_allCompleteCheck = function() {
            var i, finished = true;
            for (i = 0; i < _jots.length; i++) {
                if (!_jots[i].complete) finished = false;
            }
            if (finished) {
                _running = false;
                _callback(_id);
            }
        };

        /* ********************************************************************* */
        /*                         INTERNAL METHODS                              */
        /* ********************************************************************* */
        /**
         * @public
         *
         * @returns {Boolean} Returns initialized boolean
         */
        initialized = function() { return _initialized; };

        /**
         * @access internal
         * Initializes a sheet. Sets initializing parameters
         *
         * @param {string} id - SheetID, aka SheetKey.
         * @param {string} name - Sent from requesting game, app, etc.
         * @param {string} userID - Unique ID generated by parent GameScribe manager.
         * @param {string} key - gameKey assigned to the game. Validated against database value.
         * @param {string} mode - off, trace, strict. What the sheet should do with jots.
         * @param {string} url - URL to GameScribe API.
         * @param {string} gsID - Instance ID of the parent GameScribe manager.
         * @returns {Boolean} True if new initialization success. False if already initialized.
         */
        //init = function(id, name, userID, key, mode, url, gsID) {
        init = function(regObject, id, gsID, userID, sdkSendFxn) {
            // Number.prototype.padLeft = function(base,chr){
            //   var  len = (String(base || 10).length - String(this).length)+1;
            //   return len > 0? new Array(len).join(chr || '0')+this : this;
            // }
            //
            // var d = new Date();
            // var localTime = (d.getFullYear()).padLeft()+'-'+ (d.getMonth() + 1).padLeft() + "-" + (d.getDate()).padLeft() +" "+[(d.getHours()).padLeft(), (d.getMinutes()).padLeft(), (d.getSeconds()).padLeft()].join(':');

            var jot = {}, apiSize = {}, gsMsg = {}, ret = false, sig;
            if (!_initialized) {
                _regObject = regObject;
                _sdkSend = sdkSendFxn;
                _id = id;
                _name = regObject.gameName;
                _userID = userID;
                _key = regObject.gameKey;
                _mode = regObject.modeInt;
                _url = regObject.url;
                _initialized = true;
                jot = m_formatJot(jot);
                jot.writer = "gamescribe";
                jot.localTimestamp = getLocalTime();//localTime;
                jot.gameTime = String(Date.now() - _startTime);
                jot.gameCode = gsCodes.GS_REGISTERED,
                jot.d01 = gsID;
                jot.d02 = _name;
                jot.d03 = _id;
                jot.d04 = config.gsVersion;
                _jots.push(jot);

                apiSize.apiAction = apiAction.GET_MAX_POST;
                apiSize.gsVersion = config.gsVersion;
                m_ajaxSend(apiSize, apiAction.GET_MAX_POST);

                ret = true;
            }
            return ret;
        };

        isProtected = function() { return _protectedSheet; };

        setProtected = function(val) {
            _protectedSheet = Boolean(val);
            return true;
        };

        name = function() { return _name; };
        id = function() { return _id; };

        startSpider = function(gameUserID) {
            // Number.prototype.padLeft = function(base,chr){
            //   var  len = (String(base || 10).length - String(this).length)+1;
            //   return len > 0? new Array(len).join(chr || '0')+this : this;
            // }
            //
            // var d = new Date();
            // var localTime = (d.getFullYear()).padLeft()+'-'+ (d.getMonth() + 1).padLeft() + "-" + (d.getDate()).padLeft() +" "+[(d.getHours()).padLeft(), (d.getMinutes()).padLeft(), (d.getSeconds()).padLeft()].join(':');

            var jot = {};
            if (!_spiderStarted) {
                //Jot Down LAUNCH
                gameUserID = typeof gameUserID !== 'undefined' ?  gameUserID : "na";
                jot = m_formatJot(jot);
                jot.writer = "gamescribe";
                jot.gameTime = String(Date.now() - _startTime);
                jot.gameCode = gsCodes.GS_LAUNCHED;
                jot.localTimestamp = getLocalTime();//localTime;
                jot.d01 = gameUserID;
                _jots.push(jot);

                //Set Max POST size
                if (_postMaxSize > 0) {
                    _postMaxSize = Math.min(config.maxUploadSize, _postMaxSize);
                } else {
                    _postMaxSize = config.maxUploadSize;
                }

                //Start spider
                m_setTimer(0);

                //Return
                _spiderStarted = true;
                _running = true;
                return true;
            } else {
                return false;
            }
        };

        recordJot = function(jot) {
            var i, d;

            if (!_closing) {
                jot = m_formatJot(jot);
                if (jot.hasOwnProperty("dns")) {
                    for (i = 0; i < jot.dns.length; i++) {
                        d = (i+1 < 10) ? "d0" + String(i+1) : "d" + String(i+1);
                        jot.dns[i] = String(jot.dns[i]).replace(config.commaReplace, ",");
                        jot[d] = jot.dns[i];
                    }
                }
                delete jot.dns;
                delete jot.sheetKey;
                (_cycling) ? _tempJots.push(jot) : _jots.push(jot);
            }
        };

        stopSpider = function() {

        };

        closeSheet = function(closedCallback) {
            _callback = closedCallback;
            _closing = true;
            clearTimeout(_cycleID);
            clearTimeout(_delayID);
            while (_tempJots.length > 0) {
                _jots.push(_tempJots.shift());
            }
            console.log("closing with " + _jots.length + " jots remaining.");
            if (_jots.length === 0) {
                _running = false;
                _callback(_id);
            } else {
                m_setTimer(0);
            }
        };

        closed = function() {
            if (!_running || _closing) return true;
            return false;
        };

        environment = function() { return _regObject; };

        /* *****************           RETURN: Sheet   ********************** */
        return {
            closeSheet : closeSheet,
            closed : closed,
            id : id,
            init : init,
            initialized : initialized,
            isProtected : isProtected,
            name : name,
            recordJot : recordJot,
            setProtected : setProtected,
            startSpider : startSpider,
            stopSpider : stopSpider,
            environment : environment
        };
    };
    /* *********************              END CLASS: Sheet   ******************** */

    // Create GameScribe instance ID.
    _gsID = m_newID().substr(0, 8);

        /* *********************        RETURN: gamescribe   ******************** */
    return {
        register : register,
        launch : launch,
        jotDown : jotDown,
        sheetProtection : sheetProtection,
        closeSheet : closeSheet,
        closeUnprotectedSheets : closeUnprotectedSheets
    };
  }());
}(window));

var gsSheet = function() {
//Var Properties
    var config = {
        SHEET_SRC : "sdk",
        SHEET_ENV : "js",
        SHEET_VER : "v1p2",
        CONTEXT : window,
        REG_FXN : "gamescribe.register",
        LAUNCH_FXN : "gamescribe.launch",
        JOT_FXN : "gamescribe.jotDown",
        CLOSE_FXN : "gamescribe.closeSheet",
        GAME_NAME : "game",
        MAX_DATA_FIELDS : 4
    },
    sCode = {
        UNIN : [0, "uninitialized"],
        UNRG : [1, "unregistered"],
        REGR : [2, "registered"],
        LNCH : [3, "launched"],
        CLSD : [4, "closed"]
    },
    _status,
    _sheetKeyID = false,
    _startTime = Date.now(),
    _gsCallback,

//Private Methods
    m_executeFxnByName,
    m_newID,
    m_gsCapture,

//Public Methods
    init,
    registerSheet,
    launchSheet,
    jotDown,
    getTimer,
    getStatus,
    closeSheet;

/* ***********************  PRIVATE METHODS ***************************************** */
    /** executeFunctionByName() @author Jason Bunting */
    m_executeFxnByName = function(functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
    };

    /**
     * @private
     * Generates a new GUID.
     *
     * @returns {String} guid
     */
    m_newID = function() {
        var ALPHA_CHAR_CODES = [], uid, index, i, j, time, timeString;
        ALPHA_CHAR_CODES = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];
        uid = new Array(36);
        index = 0;
        for (i = 0; i < 8; i++) {
            uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
        }
        for (i = 0; i < 3; i++) {
            uid[index++] = 45;
            for (j = 0; j < 4; j++) {
                uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
            }
        }
        uid[index++] = 45;
        time = new Date().getTime();
        timeString = ("0000000" + time.toString(16).toUpperCase()).substr(-8);
        for (i = 0; i < 8; i++){
            uid[index++] = timeString.charCodeAt(i);
        }
        for (i = 0; i < 4; i++){
            uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() *  16)];
        }
       return String.fromCharCode.apply(null, uid);
    };

    m_gsCapture = function(gsMsg) {
        switch (gsMsg.signal) {
            case "registered":
                if (gsMsg.success) {
                    _sheetKeyID = gsMsg.sheetKey;
                    _status = sCode.REGR;
                    _gsCallback();
                }
                break;
        }
    };

/* ***********************   PUBLIC METHODS ***************************************** */
    init = function() {};

    /**
     * @public
     *
     *
     * @param {type} gameKey
     * @param {type} mode
     * @param {type} url
     * @param {function|undefined} asyncCallbackFxn
     */
    registerSheet = function(gameKey, mode, url, asyncCallbackFxn) {
        var uKey, ret,
            regObj = {
                src : config.SHEET_SRC,
                ver : config.SHEET_VER,
                gameName : config.GAME_NAME,
                gameKey : gameKey,
                mode : mode,
                url : url,
                environment : config.SHEET_ENV,
                captureFxn : m_gsCapture
            };


        if (_status[0] >= sCode.REGR[0]) return false;
        _gsCallback = asyncCallbackFxn || false;
        uKey = m_newID();
        regObj.uKey = uKey;
        m_executeFxnByName(config.REG_FXN, config.CONTEXT, regObj);
    };

    launchSheet = function(gameUserID) {
        var ret = false;
        if (_sheetKeyID) {
            ret = m_executeFxnByName(config.LAUNCH_FXN, config.CONTEXT, _sheetKeyID, gameUserID);
        }
        if (ret) _status = sCode.LNCH;
        return ret;
    };

    jotDown = function(gameCode, writer /*, dns */) {
        var jotTime, i, d, dns = [], jot = {};
        jotTime = getTimer();
        jot.sheetKey = _sheetKeyID;
        jot.writer = writer;
        jot.gameTime = jotTime;
        jot.gameCode = gameCode;
        jot.localTimestamp = getLocalTime();
        dns = Array.prototype.slice.call(arguments).splice(2);
        for (i = 0; i < dns.length; i++) {
            d = (i+1 < 10) ? "d0" + String(i+1) : "d" + String(i+1);
            jot[d] = dns[i];
        }
        return m_executeFxnByName(config.JOT_FXN, config.CONTEXT, jot);
    };

    getTimer = function() { return Date.now() - _startTime; };

    getStatus = function() { return _status; };

    closeSheet = function() {
        return m_executeFxnByName(config.CLOSE_FXN, config.CONTEXT, _sheetKeyID);
    };

    _status = sCode.UNIN;
/* ***********************          RETURN  ***************************************** */
    return {
        init : init,
        registerSheet : registerSheet,
        launchSheet : launchSheet,
        jotDown : jotDown,
        getTimer : getTimer,
        getStatus : getStatus,
        closeSheet : closeSheet
    };
};
