# Hello, World
Here we are going to make really simple apps starting with the classic "Hello, World!" 

## In the beginning...
The first step is still to create an HTML file. The good news is that almost all the HTML files will look the same and it's pretty straightforward: import scripts and call one public method.

```html
<!DOCTYPE>
<html>
    <head>
        <script src="/lib/component.js"></script>
        <script src="./js/app.js"></script>
    </head>
    <body>
        <script>
        // vanilla js $(document).ready
        function ready(fn) {
            if (document.readyState != 'loading'){
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        }
        ready(function(){
            app.init(); // <----- this is it!
        });
        </scirpt>
    </body>
</html>
```

This will work if you always the `app.js` (or whatever you want to name it, just ensure that the file is loaded using the `<script>` tag) file has this template:

```javascript
// Declare the app object using an immediately invoked function expression (IIFE)
// IIFE = define and run a function in one step
var app = (function(my){
    // add attributes or functions to app (with alias my) here
    my.x = 7; // for instance
    return my;
})(app || {});
```

Notice that if the `app` is defined then the parameter expression `app || {}` will evaluate to `app`. If not, then the expression will evaulate to an empty `{}` and the value will be pased into the `my` parameter. Any additional attributes or methods in the IIFE will be added to the `my` object and returned to the `app` variable. This means we can make a second JS file (call it `more_app.js`) with the following: 

```javascript
var app = (function(my){
    my.y = 1; // for instance
    return my;
})(app || {});
```

Now it doesn't matter if `app.js` or `more_app.js` loads first, the end result (after the `document` is ready) is that we will have a `var app = { x: 7, y: 1 };` 

Why does this matter? Because this means that we can split our app into different JS files and the browser will assemble all the pieces together into one `app` object. In the "Hello, World!" we won't need multiple files, but keep this in mind in future projects and in your own JS projects.

So let's build out the `app.js` file:

```javascript
var app = (function(my){
    my.init = function(){
        var root = new Component({'tag': 'button', _: 'Click me!'});
        root.on({ 
            'click': function(){ 
                alert('Hello, World!'); 
            } 
        });
    }
    return my;
})(app || {});
```

## So what?
Here is an HTML document that can accomplish the same thing:

```html
<!DOCTYPE html>
<html lang="en-US">
	<head>
		<title>Hello, World</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<button id="button_id">Click me!</button>
		<script>
        document.getElementById('button_id').addEventListener('click', function(){ 
			alert('Hello, World!');
		});
		</script>
    </body>
</html>
```

What did we gain? Well, a few more lines of code. But recall the Zen of pubsub: that more complex things can be made made simpler. So let's do something slightly more complex. Let's having dueling buttons.

## Dueling buttons
Let's have two buttons, side by sides that vie for your attention. Both buttons will say "Click me!", but if one is clicked this other with increase boldness and plead "No! Click me!". The buttons will flip between those states depending on which one was last clicked. 

```javascript
var app = (function(my){
    my.init = function(){
    	var root = new Component();
        var 
            b1 = new Component({'tag': 'button', _: 'Click me!'})
            ,b2 = new Component({'tag': 'button', _: 'Click me!'});
        // Button 1
        b1.on({ 'click': function(){ 
            this.send('button clicked', 1); 
        }});
        b1.subscribe({
            'button clicked': function(b){
                this.node.textContent = (b==1) ? 'Click me' : 'No, click me!';
                this.node.style.cssText = 'font-weight: '+((b==1) ? 'normal;' : 'bold');
            }
        });
        
        // Button 2
        b2.on({ 'click': function(){ 
            this.send('button clicked', 2); 
        }});
        b2.subscribe({
            'button clicked': function(b){
                this.node.textContent = (b==2) ? 'Click me' : 'No, click me!';
                this.node.style.cssText = 'font-weight: '+((b==2) ? 'normal;' : 'bold');
            }
        });
	root.add([b1, b2]);
    }
    return my;
})(app || {});
```

Here's one improvement we could make. Notice that she code of the two buttons is so similar that we could do something like this:

```javascript
var app = (function(my){
    my.init = function(){
        var root = new Component();
        root.add([Button(1), Button(2), Button(3)]); // vying triplets!
    }
    // Private function
    function Button(number){
        var b = new Component({'tag': 'button', _: 'Click me!'});
         b.on({ 'click': function(){ 
            this.send('button clicked', number); 
        }});
        b.subscribe({
            'button clicked': function(b){
                this.node.textContent = (b==number) ? 'Click me' : 'No, click me!';
                this.node.style.cssText = 'font-weight: '+((b==number) ? 'normal;' : 'bold');
            }
        });
        return b
    }
    return my;
})(app || {});
```

Did you notice the extra button we got for almost free! So we reduced our code by specifying `Button` class of sorts. This is the first layer of abstraction: the customization of Components. The `Button` is a reusable piece of code anywhere in this script.  
