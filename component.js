var messenger = (function (){
    my = {};
    my.bus = [];
    my.subscribers = {} // { topic: component }
    // Subscribers register for interest
    my.register = function(topic, comp){
        if (my.subscribers.hasOwnProperty(topic)){
            my.subscribers[topic].push(comp);
        } else {
            my.subscribers[topic] = [comp];
        }
    }
    // Publish topics to all registered subscribers.
    my.publish = function(topic, data){
        function Msg(topic, data){
            this[topic] = data;
        }
        if (topic instanceof Array){
            for (var i=0; i<topic.length; i++){
                my.bus.push(new Msg(topic[i], data)); 
            }
        } else{
            my.bus.push(new Msg(topic, data));
        }
        while (my.bus.length){
            var msg = my.bus.pop()
            var msg_has_topic = msg.hasOwnProperty(topic);
            var sub_has_topic = my.subscribers.hasOwnProperty(topic);
            if (msg_has_topic && sub_has_topic){
                my.subscribers[topic].forEach(function(comp,i){
                    comp.receive(topic, msg[topic]);
                });
            }
        }
    }
   return my
}());
   
// Building block
function Component(in_opts){
    var defaults = {
        'tag': 'div'
        ,'id': '' // element ID
        ,'cls': '' // classes (space separated)
        ,'kv': {} // key-value attributes
        ,'_': '' // text
        ,'par': document.body 
    }
    var self = this;
    var opts = Object.assign(defaults, in_opts);
    self.node = document.createElement(opts.tag);
    self.node.textContent = opts._;
    // Append child before you can change attributes
    opts.par.appendChild(self.node);
    if (opts.cls) {
        var clss = opts.cls.split(' ');
        for (var i=0; i<clss.length;i++){
            self.node.classList.add(clss[i]);
        }
    }
    if (opts.id){
        self.node.id = opts.id;
    }
    if (opts.kv){
        for (var prop in opts.kv){
            if (opts.kv.hasOwnProperty(prop)){
                if (!(
                    (prop === 'class' && opts.cls)
                    || (prop === 'id' && opts.id)
                )){
                    self.node.setAttribute(prop, opts.kv[prop]);
                }
            }
        }
    }
    self.opts = opts; // for posterity
    self.ch = []; // children
    self.reactions = {}; // { topic: callback }
    self.messenger = messenger; // singleton messenger
}

// Component methods
Component.prototype.add = function(childs){
    // childs = either sinlge or plural (in array)
    var self = this;
    if (childs instanceof Array){
        for (var i=0;i<childs.length;i++){
            self.add(childs[i]);
        }
    } else {
        self.add_child(childs); // single
    }
    return self; // chaining
}

Component.prototype.add_child = function(opts){
    // opts = either {} or Component
    var self = this;    
    // Set up to have the ch = child Component
    var ch;
    if (opts instanceof Component){
        ch = opts; // opts is actually the child
        // Also valid: opts.opts.par = self.node
        // ch.opts.par = self.node;
    } else {
        var ch_opts = Object.assign(opts, {par: self.node});
        ch = new Component(ch_opts); 
    }
    self.node.appendChild(ch.node);
    self.ch.push(ch);
}

Component.prototype.on = function(event_handlers){
    var self = this;
    var handler = 0;
    for (var e in event_handlers){
        if (event_handlers.hasOwnProperty(e)){
            handler = event_handlers[e].bind(self);   
            self.node.addEventListener(e, handler);
        } 
    }
    return self;
}

Component.prototype.subscribe = function(reactions){
    // Register reaction functions to topics
    // reactions = { topic: function }
    var self = this;
    var reaction = 0;
    for (var topic in reactions){
        if (reactions.hasOwnProperty(topic)){
            reaction = reactions[topic].bind(self);
            self.messenger.register(topic, self);
            self.reactions[topic] = reaction;
        }
    }
    return self; // chaining
}

Component.prototype.receive = function(topic, data) {
    // app.publish() -> forEach substriber, subscriber.react()
    var self = this;
    if (self.reactions.hasOwnProperty(topic)){
        self.reactions[topic](data);  
    }
}

Component.prototype.send = function(topic, data){
    // Push topic to app. Subscribers are notified of topic.
    this.messenger.publish(topic, data);
}
