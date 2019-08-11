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

