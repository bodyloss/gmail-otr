var STATUS = {
    ADDED:0,
    STARTED:1,
    CONNECTED:2
}

function GOTR(global) {
    if (!(this instanceof GOTR)) {
        return new GOTR(global);
    }

    var self = this;

    var key = null;

    // stores our ids so we can access stuff, n'shit
    var chats = {};

    this.startOTR = function(eleId) {
        var message;
        if (key === null) {
            message = 'You are about to go OTR. No key has been computed either yet, this may take some time. Continue?';
        } else {
            message = 'You are about to go OTR. Are you sure?';
        }

        if (confirm(message)) {
            var chat = chats[eleId];

            // Generate our DSA key if we dont have one
            if (key === null) {            
                key = new DSA();
                self.GM_setValue('gotr_key', key.packPrivate());
            }

            chat.otr = new OTR({
                fragment_size: 0,
                send_interval: 0,
                priv: key
            });

            chat.otr.on('ui', function(msg, encrypted) {
                console.log('encrypted: ' + encrypted + ', msg: ' + msg);                
            });

            chat.otr.on('io', function(msg) {
                chat.textbox.value = msg;

                if (msg.indexOf('?OTR') !== -1) {
                    // we need to send an enter keypress
                    self.fireKey(13, chat.textbox.id);
                }
            });

            chat.otr.on('error', function(err) {
                alert('Error: ' + err);
            });
            
            chat.supressKeypress = true;
            chat.otr.sendQueryMsg();
        }
    };

    this.startup = function() {
        // se if we have a key computed already
        var exportedKey = self.GM_getValue('gotr_key', null);
        if (exportedKey) {
            try {
                key = DSA.parsePrivate(exportedKey);
            } catch (e){
                key = null;
            }
        }

        // Add an event listener
        document.addEventListener('keydown', function(e) {
            if (e.keyCode == 13 || e.which == 13) {
                // need to ensure we're only encrypting those we want to
                if (chats[e.srcElement.id] && chats[e.srcElement.id].otr && !chats[e.srcElement.id].supressKeypress) {
                    chats[e.srcElement.id].otr.sendMsg(e.srcElement.value);
                }
            }
        }, true);

        this.checkForChatWindows();
    };

    this.handleMessageReceived = function(e) {
        if (e.currentTarget.lastChild.childNodes[0].childNodes.length == 4) {
            var chat = chats[e.currentTarget.id];
            var msgContents = e.currentTarget.lastChild.childNodes[0].childNodes[3].innerText;
            // check if we are already connected or are the one initiating the session
            if (chat.status == STATUS.STARTED || chat.status == STATUS.CONNECTED) {
                chat.otr.receiveMsg(msgContents);
            } else if (msgContents == ' ') {

            }
        }
    };

    this.checkForChatWindows = function() {
        var nodes = document.querySelectorAll('.NI.NJ .vE.dQ.editable')
            
        for (var i = 0; i < nodes.length; i++) {
            var ele = nodes[i];
            if (!ele.otradded) {
                ele.otradded = true;

                var closest = $(ele).closest('.nH.Hd');
                var chatpane = closest.find('.kf')[0];
                var textbox = closest.find('.ad3')[0];
                
                chats[textbox.id] = chats[chatpane.id] = {
                    textbox: textbox,
                    chatpane: chatpane,
                    otrdiv: ele,
                    status: STATUS.ADDED
                };

                chatpane.addEventListener('DOMNodeInserted', self.handleMessageReceived);

                ele.innerHTML = '<div id="gotr-' + textbox.id + '" class="otr-startstop"">OTR</div>';

                document.getElementById('gotr-' + textbox.id).addEventListener('click', function(e) {
                    self.startOTR(e.currentTarget.id.replace('gotr-', ''));
                });
            }
        }

        setTimeout(self.checkForChatWindows, 500);
    };

    this.fireKey = function(keyCode, textboxid) {
        var ele = document.getElementById(textboxid);
        var e = new Event('keydown');
        e.keyCode = keyCode;
        e.which = keyCode;
        ele.dispatchEvent(e);

        // clear the textbox and unset supression flag
        ele.value = '';
        chats[textboxid].supressKeypress = false;
    };
}

