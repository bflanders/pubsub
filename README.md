# pusub
Smallest JS framework you've never seen.

## Framework, really?  
Well, maybe not. But this was a pattern I created to help build web pages. I have had a lot of fun using it, but then again I wrote it. 

The idea was simple. I hated writing HTML and I couldn't keep my apps from crumbling to pieces. HTML was annoying because of the opening and closing tags. The nesting would get me confused sometimes. I also didn't like tagging everything in my HTML with ids and then having to remember those ids in my JS files. 

I wrote a code generator script in Python, but that got annoying to make any small changes. So then I thought, can't JavaScript create DOM elements? Yes it can. So I created a JS object called a "Component" that will be used to create elements in the DOM. That's not that great of a term, but a Component is a "thing" and you can add other child Components (viola! hierarchy) to it and it can do a few interesting things, which I will discuss later.

My appes felt fragile because it was hard for me to manage cause and effects, like button clicks hiding/showing modal boxes and getting/settin data. It seemed like I was always bolting things together and my logic was always ad hoc and difficult to maintain. So how do I get one Component to tell other Components what to do in an easy to manage way? Why not "pub/sub" - a mechanism to pass messages between Components, where a Component can publish a messages (a JS object consisting of a "topic" and payload called "data like this: `{topic: data`) and receive them? That would (mostly) eliminate the need to track ids. I call this messaging mechanism the Messenger.  

Those are the tenets of the framework: **Component** and a **Messenger**.

A **Component** has the following capabilites:
* Add children
* Define callback behavior for DOM events
* Subscribe to a topic and define reactions to receiving messages
* Send messages
* Receive messages

A **Messenger** can:
* Manage a message bus to push and pop off messages
* Register Component as recepients of messages based on the topic of the message
* Publish messages to registered Components

That's about it. The surprising part to me is the degree to which these few capabilities unlocked for me a discipline and development frame of mind that I can easily pick up old code and now exactly where to put code to add or modify functionality. This are way more obvious what's going on. 

## The Zen of pubsub
I wanted layout some initial ideas thought that spell out how I've used this framework to do some non-trivial projects.

* Making complex things simpler. That still remains to be seen, but that's my biggest arguement in support of this approach is that it won't make simple things simpler, but it can make complex things simpler.
* You should be able to know where exactly you go to in the code to add functionality or fix bugs.   
* A Component only cares about when to send a message and what do to in response to receiving a message. But you still need someone who understands the big picture.  

That's pretty much it. There is a lot of small, but powerful things going on like closure and function binding. 

**[Click here](https://github.com/bflanders/pubsub/blob/master/docs/component.md)** to see a discussion about the Component class and later I'll talk about **[how to use the framework](https://github.com/bflanders/pubsub/blob/master/docs/hello_world.md)**.
c
