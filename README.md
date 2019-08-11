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

**[Click here]**(https://github.com/bflanders/pubsub/blob/master/docs/component.md) to see a discussion about the Component class and later I'll talk about how to use the framework.

