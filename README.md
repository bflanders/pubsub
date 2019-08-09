# pusub
Smallest JS framework you've never seen.

## Framework, really?  
Well, maybe not. But this was a pattern I created to help build web pages. I have had a lot of fun using it, but then again I wrote it. 

The idea was simple. I hated writing HTML and I couldn't keep my apps from crumbling to pieces. HTML was annoying because of the opening and closing tags. The nesting would get me confused sometimes. I also didn't like tagging everything in my HTML with ids and then having to remember those ids in my JS files. 

I looked at trying to write up a templating script in Python, but that got annoying to make any small changes. So then I thought, well can't JavaScript create DOM elements? Yes it can. I call the JS object that will create elements in the DOM a "Component". That's not that great of a term, but a Component is a "thing" and you can add other child Components (viola! hierarchy) to it and it can do a few interesting things, which I will discuss later.

So how do I get one Component to tell other Components what to do? Why not "pub/sub" - what if there were a message bus that Components can post messages (topic + data) and receive them? That would (mostly) eliminate the need to track ids at all. 

Those are the tenets of the framework: **Component** and a **Messenger**.

A **Component** therefore needs the following capabilites:
* Add children
* Define callback behavior for DOM events
* Subscribe to a topic and define reactions to receiving messages
* Send messages
* Receive messages

A **Messenger** needs to be able to:
* Have a bus to load messages on to
* Register Component as recepients of messages based on the topic of the message
* Publish messages to registered Components

That's about it. The surprising part to me is the degree to which these few capabilities unlocked for me a discipline and development frame of mind that I can easily pick up old code and now exactly where to put code to add or modify functionality. This are way more obvious what's going on. 

## The Zen of pubsub
I wanted layout some initial ideas thought that will dictate should govern how you work with this framework.

* Making complex things simpler. That still remains to be seen, but that's my biggest arguement in support of this approach. It won't make simple things simpler, but the framework invites you to break apart complex problems into simple, manageable parts.
* I have found it helpful to breakdown major secitions of the web page into separate JS files and having them "assembled" using the [Loose Augmentation](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html) pattern. Each module has one "public" function that builds some top-level Component and all supporting tasks are written in "private" methods.
* A Component only cares about when to send a message and what do to in response to receiving a message. But you still need someone who understands the big picture. I think this an interesting area of research that I want to explore: effective descriptions of the message flows. 

That's pretty much it. There is a lot of small, but powerful things going on like closure and function binding. 

Now I am going to talk about how to make a Component and later I'll talk about what it can do and then how to use the framework.

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

The `subscibe` method does two things: it defines callbacks (or "reactions") for messages it receives and it tells the `messenger` object to register this Component as interested in receiving data. We will be using a JS object to represent ...
