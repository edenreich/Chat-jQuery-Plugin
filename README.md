#Chat jQuery Plugin
A nice plugin to use a chat application on your website

##How To Use
All you need to do is to embed this code between your javascript tags.
```javascript
$.chat({
	
});
```

##Available Options
you can pass your options as json object to the $.chat() plugin.
example:
```javascript
$.chat({
	'available_option': 'my_option',
});
```

####The URL to the script where you handle the backend get proccess to get the messages from  the database like so:
```javascript
getURL: 'getMessages.php',
```

####The URL to the script where you handle the backend post proccess to post the message to the database like so:
```javascript
postURL: 'postMessages.php',
```

####The background color you wish for your chat like so:
```javascript
background: '#47b403',
```

####The welcome message you wish to display as soon as the user clicks on start like so:
```javascript
welcome: 'customer team will contact you as soon as possible.',
```

####The generated token you wish your chat to use for security purposes like so:
```javascript
_token: $('[name="csrf_token"]').attr('content'),
```
