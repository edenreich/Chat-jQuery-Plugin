
/*
|--------------------------------------------------------------------------
| Polyfill
|--------------------------------------------------------------------------
| just in case some broswers do not support this method.
| 
|
*/
if(typeof Object.create !== 'function') {
	
	Object.create = function(obj) {
		
		function F(){};
		F.prototype = obj;
		return new F();
	};
}


/*
|--------------------------------------------------------------------------
| jQuery Chat Plugin
|--------------------------------------------------------------------------
| This chat will be attached to the bottom of the website and will allow
| you to pull info from a database tables. 
|
| please Note: it does not including the Backend processing. It will just send the request 
| using Ajax to your Backend choosen language to pull information from the database and send 
| it back to the client as json.
| Well, I've build it in a way that it will send a request every 2 seconds to some backend
| processing, it's probably not the best way to do it but it still works.
| there are better ways to do it, if so you will want to use Sockets connections so you can maintain many 
| these all at once.
|
| This plugin is build for personal use and is absolutly restricted for a commerical use.
| Copyright Eden Reich, all rights reserved.
|
*/
;(function($, window, document, undefined) {

	var settings = {
		_token: $('[name="csrf_token"]').attr('content'), 
		getURL: 'messages',
		postURL: 'messages',
		background: '#47b403',
		welcome: 'customer team will contact you as soon as possible.',
	};

	/**
	 * Just a placeholder for our Timer, so we can refernce to it later on the code.
	 */
	var timer;

	/**
	 *	This is the Chat object which stores all the functions we need for the chat 
	 */
	var Chat = {

		/**
		 * Few tasks our to do initially:
		 * - Extending the our default options with the user options. 
		 * - Creating the chatbox element.
		 * - Closing the chat element initially.
		 * - Binding a click event to trigger a method to open the chat element.
		 * - Binding a click event to trigger a method when the user click on start.
		 */
		init: function(options) {
			
			settings = $.extend({}, settings, options);
			chatObj = this;

			chatObj.createChatBox();
			chatObj.close();
			
			$('.chat-title').on('click', chatObj.open);
			
			$('#startChatButton').on('click', chatObj.startChat);				
		},

		/**
		 * This method will be triggered once the user clicks on the start button.	
		 */
		startChat: function(event) {
			
			event.preventDefault();
			$(this).prop('disabled', true);
			
			if(Chat.isHTML($('#username').val())) {

				Chat.generateErrorMessage('Are you trying your best?', function() {

					$('#startChatButton').prop('disabled', false);	
				});
				
				return;
			}

			var username = $('#username').val();

			if(username) {

				Chat.createNewChatRoom(username).done(function() {

					$('#sendMessage').on('click', {name: username},chatObj.store);
				});
			} else {

				Chat.generateErrorMessage('Please enter a name', function() {

					$('#startChatButton').prop('disabled', false);	
				});
			}
		},

		/**
		 * This method will take care of creating the chatbox element.
		 * and lastely will append it to the DOM, to be more precise, it will be attached 
		 * to the body tags.
		 */
		createChatBox: function() {
			
			$chatBox = this.draw('chatBox');
			$firstPage = this.draw('firstPage');

			$chatBox.find('.chat-content').append($firstPage);
			$('body').append($chatBox);
		},

		/**
		 * This method taking care for opening the chat element. 
		 */
		open: function() {
			
			$('.chat-content').slideToggle(function() {
				
				if($(this).is(":visible")) {

					if(Chat.isSecondPage())
						Chat.startConnectionStream();

					$('.chat-title').html('Minimize Chat '+'<span class="glyphicon glyphicon-minus"/>');
				} else {

					if(Chat.isSecondPage())
						Chat.closeConnectionStream();

					$('.chat-title').html('Chat with us now!');
				}
			});
		},

		/**
		 * This method will create a new chat room which will be showen after the user
		 * clicks on the start button 
		 */
		createNewChatRoom: function(username) {
			var dfd = $.Deferred();
			chatObj = this;
			$('.chat-content-page-one').fadeOut(function() { 
				
				$(this).remove(); 
				
				$newPage = chatObj.draw('secondPage');
				$chatBox.find('.chat-content').append($newPage);
				chatObj.welcomeMessage(username);
				chatObj.startConnectionStream();
				dfd.resolve();
			});

			return dfd.promise();
		},

		/** 
		 * @todo This method will send the message and use the store method 
		 */
		sendMessage: function() {
			// 4.send the message
		},

		/**
		 * This method will actually send the message to the backend for further processing.
		 * for example you could send it to a php script and insert this info to your database
		 * schema.
		 */
		store: function(event) {
			// 5.store the message in the database
			event.preventDefault();
			var username = event.data.name,
				message = Chat.isHTML( $('#message').val() ) ? '####' : $('#message').val();

			if(message == '' || message == null) {
				return Chat.generateErrorMessage('Please enter a message');
			}

			$.ajax({
				type: 'post',
				url: settings.postURL,
				data: { '_token': settings._token, 'username': username, 'message': message },
				beforeSend: function() {
					
					$('#sendMessage').prop('disabled', true);
				},
				success: function(response) {
					$('#message').val("");
					if(!response.success) {
						return Chat.generateErrorMessage('Error has occured');
					}
				}
			}).done(function() {

				$('#sendMessage').prop('disabled', false);
			});
		},

		/**
		 * This method will load the messages from the database via ajax. 
		 */
		load: function() {
			
			$.ajax({
				type: 'get',
				url: settings.getURL,
				data: { '_token': settings.token },
				success: function(response) {
					
					if(response.wait) {
						return;
					}
					var messages = '';
					$('#messageContainer').empty();
					
					$.each(response.messages, function(index, value) {

						messages += value['name'] + ': ' + value['message'] + '<br>';
					});
				
					$('#messageContainer').html(messages);
				}
			});
			
		},

		/**
		 * This method will close the chat element. 
		 */
		close: function() {
			
			$('.chat-content').hide();
		},

		/**
		 * This method will close the connection to the backend, as soon as we close the chat. 
		 */
		closeConnectionStream: function() {
			// 8.close the connection to the database
			clearInterval(timer);
			return timer = false;
		},

		/**
		 * This method will start the connection to the backend, as soon as we open the chat. 
		 */
		startConnectionStream: function() {
			
			if(!timer) {
				
				return timer = setInterval(Chat.load, 2000);
			}
		},

		/**
		 * This method will only take care of the styling and the drawing of the chat. 
		 */
		draw: function(element) {

			switch(element) {
				// draw the chatBox
				case 'chatBox':
					$chatBox = $('<div />', {
						'class': 'chat-box',
					}).css({
						'position': 'fixed',
						'bottom': '0px',
						'right': '15px',
						'width': '308px',		
					});

					$chatBoxTitle = $('<a />', {
						'text': 'Chat with us now!',
						'class': 'chat-title',
					}).css({
						'background': settings.background,
						'color': '#ffffff',
						'text-align': 'center',
						'display': 'block',
						'line-height': '40px',
						'cursor': 'pointer',
					});

					$chatBoxContent = $('<div />', {
						'class': 'chat-content',
					}).css({
						'position': 'relative',
						'width': '100%',
						'background': '#e4e4e4',
						'height': '200px',
						'border': '1px solid black',
					});

					$element = $chatBox.append($chatBoxTitle, $chatBoxContent);
					break;
				
				// draw the first chatbox page
				case 'firstPage':
					$firstPage = $('<div />',{
						class: 'chat-content-page-one',
					}).css({
						'width': '100%',
						'height': '200px',
					});

					$form = $('<form />', {
						'method': 'post',
						'action': '/',
					});
					
					$formGroup = $('<div />', {
						'class': 'form-group',
					});

					$formColumn = $('<div />', {
						'class': 'col-xs-10 col-xs-offset-1',
					});

					$chatNameLabel = $('<label />',{
						'text': 'Name:',
						'class': 'label-name',
					});

					$chatNameInput = $('<input>', {
						'class': 'form-control',
						'name': 'username',
						'id': 'username',
					});

					$startButton = $('<input>', {
						'type': 'submit',
						'value': 'Start Chat!',
						'class': 'btn btn-success',
						'id': 'startChatButton',
						'style': 'margin-top: 15px;',
					});

					$form.append(
						$formGroup.append($formColumn.append($chatNameLabel, $chatNameInput)), 
						$formGroup.append($formColumn.append($startButton))
					);
					$element = $firstPage.append($form);
					break;

				case 'secondPage':
					$secondPage = $('<div />',{
						'class': 'chat-content-page-two',
					}).css({
						'background': '#ffffff',
						'width': '100%',
						'height': '200px',
					});

					$messageContainer = $('<div />', {
						'id': 'messageContainer',
					}).css({
						'width': '100%',
						'position': 'relative',
						'padding': '5px',
						'height': '145px',
						'overflow-y': 'scroll', 
						'overflow-x': 'hidden', 
					});

					$formGroup = $('<div />', {
						'class': 'form-group',
					});

					$formColumn = $('<div />', {
						'class': 'col-xs-9',
					});

					$form = $('<form />', {
						'method': 'post',
						'action': '/',
					});

					$chatMessageInput = $('<input>', {
						'class': 'form-control',
						'name': 'message',
						'id': 'message',
					});

					$sendButton = $('<button />', {
						'text': 'Send',
						'class': 'btn btn-success',
						'id': 'sendMessage'
					});

					$form.append(
						$formGroup.append($formColumn.append($chatMessageInput)), $sendButton
					);
					$element = $secondPage.append($messageContainer, $form)

			}

			return $element;

		},

		/**
		 * This method will generate an error message
		 * It is an option to make some further processing of the 
		 * error from the plugin once they occures.
		 */
		generateErrorMessage: function(errorMsg, callback) {

			$error = $('<font />', { 
				color: 'red',
				text: errorMsg,
				class: 'error-message',
				style: 'display:block;',
				align: 'center',
			});

			$error.prependTo('.chat-content');
			
			$error.delay(2000).fadeOut(function(){
				$(this).remove();
				if(typeof callback === 'function')
					return callback.call();
			});
		},

		/**
		 * This method will just print our a generic welcome message to the client. 
		 */
		welcomeMessage: function(username) {
			
			$('body').find('#messageContainer').html('<h5>Welcome '+ username +',</h5><p style="position:relative; width: 300px;">'+ settings.welcome +'</p>');
		},

		/**
		 * This method will check if we our on the second page or rather saying if 
		 * we are inside a chatroom. 
		 */
		isSecondPage: function() {

			if($('.chat-content').children('div').hasClass('chat-content-page-two')) {

				return true;
			}
			return false;			
		},

		/**
		 * This is an helper method to check if the user passes HTML, just 
		 * to make sure we dont store, any unsecured tags.
		 */
		isHTML: function(string) {
		    
		    var matches = string.match(/<[a-z][\s\S]*>/i);
		
			if(matches)
				return true;
			return false;
		},
	};

	/**
	 * This is how we will call the plugin from the HTML page. 
	 */
	$.chat = function(options) {

		var chat = Object.create(Chat);
		chat.init(options);
	}
	
})(jQuery, window, document);
