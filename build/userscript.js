// ==UserScript==
// @name            Gmail OTR
// @description     Adds OTR.js support to gmail
// @include        https://mail.google.com/mail*
// @include        https://mail.google.com/a*
// @include        https://talkgadget.google.com/u/*
// @grant          GM_getValue
// @grant          GM_setValue
// @version         1.0
// @author          jciechanowicz
// ==/UserScript==


var global = this;

if (document.querySelectorAll('.gb_Bb.gb_1a').length > 0 && document.gotrAdded == false) {
    document.gotrAdded = true;
    (function() {
        var script2 = document.createElement("script");
        script2.src = "https://bodyloss.co.uk/gmail-otr.js";

        script2.onload = script2.onreadystatechange = function() {
            global.GOTR = new GOTR();
            global.GOTR.GM_getValue = GM_getValue;
            global.GOTR.GM_setValue = GM_setValue;
            global.GOTR.startup()
            window[GM_setValue] = GM_setValue;
        }

        document.body.appendChild( script2 );
    })();
}


