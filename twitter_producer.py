import xmpp
import tweetstream

#twitter conf
tracked_terms = ["pycon", "#pycon", 'django', '#lawrence', '#lpdn']
username, password = ('twitter_username', 'twitter_password')

#jabber conf
jid, jpwd = ("jabber_user@jabber_server", "jabber_password")

pubsub_component = 'pubsub.jabber_server'
pubsub_node = 'twitter_stream'

create_stanza = """
<iq type='set'
    to='%s'>
  <pubsub xmlns='http://jabber.org/protocol/pubsub'>
    <create node='%s'/>
    <configure/>
  </pubsub>
</iq>""" % (pubsub_component, pubsub_node)

message_stanza = """
<iq type='set'
    to='%s'>
  <pubsub xmlns='http://jabber.org/protocol/pubsub'>
    <publish node='%s'>
      <item>
        <p>%%s</p>
      </item>
    </publish>
  </pubsub>
</iq>""" % (pubsub_component, pubsub_node)


def create_node(cl):
    cl.send(create_stanza)

def clean(s):
    return s.encode('ascii', 'xmlcharrefreplace')

def listen_and_send(cl):
    with tweetstream.TrackStream(username, password, tracked_terms) as stream:
        for tweet in stream:
            message = '%s by %s' % (clean(tweet['text']), clean(tweet['user']['name']))
            print 'sending', message
            cl.send(message_stanza % message)

jid = xmpp.protocol.JID(jid)

running = True
while running:
    try:
        cl = xmpp.Client(jid.getDomain(), debug=[])
        if cl.connect():
            print 'connected.'
        if cl.auth(jid.getNode(), jpwd):
            print 'authenticated.'
        create_node(cl)
        print 'attempted to create node.'
        print 'listening.'
        listen_and_send(cl)
    except KeyboardInterrupt:
        print 'exiting.'
        cl.disconnect()
        running = False
    except Exception, e:
        print 'Error: %s, attempting to reconnect.' % e
        pass

