# pusub
Smallest framework you've never seen.

## Framework, really?  
Well, maybe not. But this was a pattern I created to help build web pages. I have a lot of fun using it, but then again I wrote it. 

The idea was simple. I hated writing HTML and I couldn't keep my apps from crumbling to pieces. HTML was annoying because of the opening and closing tags. The nesting would get me confused sometimes. I also didn't like tagging everything in my HTML with ids and then having to remember those ids in my JS files. 

I looked at trying to write up a templating script in Python, but that got annoying to make any small changes. So then I thought, well can't JavaScript create DOM elements? Yes it can.

## JSON constructors
So you want to make an html element. What is the minimum about of characters it would take to make it. I started thinking about may libraries I had used before that took in a JS object as part of its constructor. And default parameters would be nice. So this was the beginning, a Component:

```html
< tag key_0="value_0" key_1="value_1" ...> text 
    <child_tag ...> </child_tag>
</tag>
```


```javascript
function Component(in_opts){
    var defaults = {
        'tag': 
    };
}
```
