
StreamWatcher = {
    BOSH_URL: "/http-bind", // bosh endpoint
    XMPP_DOMAIN: "xmpp_server",
    PUBSUB_COMPONENT: "pubsub.xmpp_server",
    PUBSUB_NODE_NAME: "twitter_stream", // pubsub node name
    connection: null, //connection object created in run function

    start: function() {
        $(document).ready(function(){
            //Connect strophe
            StreamWatcher.connection = new Strophe.Connection(StreamWatcher.BOSH_URL);
            //connect anonymously
            StreamWatcher.connection.connect(StreamWatcher.XMPP_DOMAIN, null, StreamWatcher.connectCallback);
        });
    },

    subscribe: function() {
        if (!StreamWatcher.connection.connected) {
            console.log("not connected anonymously");
        };

        var iqid = StreamWatcher.connection.pubsub
            .subscribe(StreamWatcher.connection.jid,
                       StreamWatcher.PUBSUB_COMPONENT,
                       StreamWatcher.PUBSUB_NODE_NAME,
                       [],
                       // main callback
                       StreamWatcher.handleMessage,
                       // error callback
                       function(stanza) {
                            //$('#main').after('<hr/>');
                            //$('#main').after($(stanza).find('error').html());
                            return true;
                       });
    },


    // main message callback
    handleMessage: function(stanza) {
        $('#main').prepend('<hr/>');
        var el = ['<div>',
                  $(stanza).find('item p').text(),
                  '</div>'
                  ].join('');
        $(el).fadeIn().prependTo($('#main'));
        return true;
    },

    connectCallback: function(status,cond) {
        var message = null;
        if (status == Strophe.Status.CONNECTED) {
            message = "Connected.";
            StreamWatcher.subscribe();
        }
        else if (status == Strophe.Status.DISCONNECTED || status == Strophe.Status.DICONNECTING) {
            message = "Disconnected";
        }
        else if ((status == 0) || (status == Strophe.Status.CONNFAIL)) {
            message = "Failed to connect to xmpp server.";
        }
        else if (status == Strophe.Status.AUTHFAIL) {
            message = "Failed to authenticate to xmpp server.";
        }
        if (message) {
            $('#main').append(message);
        }
    }
};
