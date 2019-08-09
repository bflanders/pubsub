# pusub
Smallest JS framework you've never seen.

## Framework, really?  
Well, maybe not. But this was a pattern I created to help build web pages. I have a lot of fun using it, but then again I wrote it. 

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

## The Zen of Pubsub
I wanted layout some initial ideas thought that will dictate should govern how you work with this framework.

* Making complex things simpler. That still remains to be seen, but that's my intuition. It won't make simple things simpler, but it breaks apart complex problems into simple parts.
* I have found it helpful to breakdown major secitions of the web page into separate JS files and having them "assembled" using the [Loose Augmentation](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html) pattern. Each module has one "public" function that builds some top-level Component and all supporting tasks are written in "private" methods.
* A Component only cares about when to send a message and what do to in response to receiving a message. You still need someone who understands the big 

## JSON constructors
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

If we want to create each DOM element through a JSON instantiation, then we need to be a little creative, especially when it comes to capturing the "attributes" of a DOM element. I am going to wrap all that into a key called `kv` for "key-value".

```javascript
function Component(in_opts){
    var defaults = {
        'tag': 'div' # DOM element name
        ,'kv': {} # key/value storage used for attributes
        ,'_': '' # text part
    };
    # overwrite defaults with passed in values
    var opts = Object.assign(defaults, in_opts) 
}
```
