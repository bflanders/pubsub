## JS object constructors
So you want to make an html element. What is the minimum about of characters it would take to make it. I started thinking about may libraries I had used before that took in a JS object as part of its constructor. And default parameters would be nice. So here's what we are dealing with in HTML:

```html
< tag key_0="value_0" key_1="value_1" ...> text 
    <child_tag ...> </child_tag>
</tag>
```

Each of the above text are place holder for real values. Like this

```html
<div class="cool active" style="width: 100%;">
    <table id="the_tbale" class="cell-bordered"></table>
</div>
```

So how can we "translate" this structure to a JS object? I am going to wrap all attributes in a child JS object called `kv`, which stands for "key-value".

```javascript
{
    'tag': 'div' // DOM element name
    ,'kv': {}    // key/value storage used for attributes
    ,'_': ''     // text part
    ,'par': document.body // what should we add the Component to?
}
```

So `<div class="cool active" style="width: 100%;"></div>` would be: 

```javascript
{ 
    tag: 'div'
    , kv: {
        'class': 'cool active'
        , 'style': 'width: 100%'
    }
}
```

And here's the first version of the Component constructor:

```javascript
function Component(in_opts){
    var defaults = {
        'tag': 'div' // DOM element name
        ,'kv': {}    // key/value storage used for attributes
        ,'_': ''     // text part
        ,'par': document.body // what should we add the Component to?
    };
    var self = this; // habit...
    # overwrite defaults with passed in values
    var opts = Object.assign(defaults, in_opts); # Won't work in IE9 
    self.node = document.createElement(opts.tag);
    self.node.textContent = opts._;
    // Append child before you can change attributes
    // TODO: use kv to set attributes
    opts.par.appendChild(self.node);
    self.opts = opts; // let's keep it around
    self.messenger = messenger; 
}

// Usage
var div = Component() // div in the body
```

## Adding Children
In order to replicate the DOM structure, we need to have Components that can be added to other Components. So we need to expand the Component constructor and add a method `add_child`.

```javascript
function Component(in_opts){
    // ... same as above
    self.ch = []; // children
}

Component.prototype.add_child = function(opts_or_Component){
    var self = this; // habit...
    // opts_or_Component = either a Component or constuctor JSON
    var ch; // this is whas we are going to add to this.ch
    if (opts_or_Component instanceof Component){
        ch = opts_or_Component; // oh, it's a Component
    } else {
        // oh, it's opts for a chid Component
        var ch_opts = Object.assign(opts_or_Component, {par: self.node});
        ch = new Component(ch_opts);
    }
    self.node.appendChild(ch.node);
    self.ch.push(ch);
       
}
```

As a helper function, here is a function that can take an array of children and add each one:

```javascript
Component.prototype.add = function(child_or_children){
    // child_or_children = either sinlge or plural (in array)
    var self = this;
    if (child_or_children instanceof Array){
        for (var i=0;i<child_or_children.length;i++){
            self.add(child_or_children[i]);
        }
    } else {
        self.add_child(child_or_children); // single
    }
    return self; // chaining
}
```

We are very close to this:

```html
<div class="cool active" style="width: 100%;">
    <table id="the_tbale" class="cell-bordered"></table>
</div>
```

by this:

```javascript
var div = new Component();
var table = new Component({tag: 'table'});
div.add(table);
// or div.add({tag: 'table'});
// or div.add([ {tag:'table'} ]);
```

But we need to be able to set attributes.

## Setting DOM attributes
But now we need to update Component to set the attributes of the DOM node. Because I was working with Bootstrap and other frameworks that relied on just setting the class of a DOM node, I wanted the JS object constructor to be able to "elevate" the `class` attribute to the top level. So I wanted code to look like this `var div = new Component({ tag: 'div', cls: 'cool active' });` (`class` is a keyword in JS, so I use the term `cls` in its place). The id is another attribute like that, but that's it! The rest of the key/value pairs should be `kv` structure. 

I wanted to put a guard in to cover this case: `new Component({ cls: 'this_class', kv: { 'class': 'that_class' } })`. What should be class of this Component? `this_class` or `that_class`? The rule is that if the constructor object has a `cls` has values, then `kv['class']` will be ignored. The same is true for the `id`. 

```javascript
function Component(in_opts){
    // same as above...
    // Reminder that you have to append node to DOM before setting attributes
    // If you forget, it won't set them :(
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
                // Guarding against overwriting top level class or id values
                if (!(
                    (prop === 'class' && opts.cls)
                    || (prop === 'id' && opts.id)
                )){
                    self.node.setAttribute(prop, opts.kv[prop]);
                }
            }
        }
    }
    // same as above...
}
```

So now we can make this:
```html
<div class="cool active" style="width: 100%;">
    <table id="the_tbale" class="cell-bordered"></table>
</div>
```

By this:

```javascript
var div = new Component({ kv: { 'class': 'cool active', style: 'width: 100%;' }});
var table = new Component({ tag: 'table', id: 'the_table', cls: 'cell-bordered'});
div.add(table);
```

## Other useful Component methods
We already seen two methods of the Component class, `add` and `add_child`, but now I want to introduce a very important one: `subscribe`. This is getting to the heart of the pub/sub idea. 

The `subscibe` method does two things: it defines callbacks (or "reactions") for messages it receives and it tells the `messenger` object to register this Component as interested in receiving data. We will be using a JS object called `reactions` to store topic and callbacks:

```javascript
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
```

Notice that this is one of the few times that are making of the `messenger` object. Also, notice that each callback is automatically "binded" to the Component object. This means we can write all the callback functions using `this` and it will resolve to the right Component.

The next two methods are closely related: `send` and `receive`. The `receive` method makes use of the `reactions` attribute of the Component. The `send` method is the other time that the Component is asking the `messenger` to do something. 

```javascript
Component.prototype.receive = function(topic, data) {
    // app.publish() -> forEach substriber, subscriber.react()
    var self = this;
    if (self.reactions.hasOwnProperty(topic)){
        // Pass the data to the reaction function that is mapped to the topic
        self.reactions[topic](data);  
    }
}

Component.prototype.send = function(topic, data){
    // Push topic to app. Subscribers are notified of topic.
    this.messenger.publish(topic, data);
}
```

The last method is the `on` method. It is used to register user events such as click and hovering. Most of the time the `on` is the place in the code where Components generate their messages. Again we are using a JS object where the key must be a valid DOM event. 

```javascript
Component.prototype.on = function(event_handlers){
    // event_handles = { event: callback }

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
```

## The messenger
The last piece to discuss is the `messenger`. The purpose of the `messenger` is to manage the message bus (pushing and publishing messages) and to allow Component to register interest in topics. 

```javascript
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
        // topic can be singular or plural (an Array)
        function Msg(topic, data){  // little helper class
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
```

