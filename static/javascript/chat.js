$(document).ready(function() {
	var messageRecd = document.getElementById('messageReceived')
	// get username from cookie
	username = getCookie('username')

	// connect a user
	var socket = io.connect('http://localhost:5000');

	// send details to server about the client that connected
	socket.on('connect', function() {
		socket.emit('setUser', username)
		socket.emit('connectEvent');
	});

	// listens for disconnect button to be pressed
	$('#disconnectButton').on('click', function() {
		// disconnects a client
		socket.close()
		// clear the users cookie
		document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	});

	// when a user presses enter in the text box, the send button will be pressed
	document.querySelector("#myMessage").addEventListener("keyup", event => {
	    if(event.key !== "Enter") return; 
	    document.querySelector("#sendButton").click();
	    event.preventDefault();
	});

	// When user presses send button, send message to server
	$('#sendButton').on('click', function() {
		var messageStr = $('#myMessage').val()

		// commands that the user can type
		if (messageStr.startsWith('/')){
			var parsedMsg = messageStr.split(' ')
			if(parsedMsg[0] === '/users'){
				socket.emit('getUser')
			}else{
				if(parsedMsg.length !== 2 || parsedMsg[1].trim === ''){
					socket.emit('invalidEvent', 'Please enter a value after the command, example: /color blue')
				}else if (parsedMsg[0] === '/nickname'){
					socket.emit('commandEvent', ' changed their username to ' + parsedMsg[1]);
					socket.emit('setUser', parsedMsg[1])
					document.cookie = "username=" + parsedMsg[1];
					username = parsedMsg[1];
				} else if(parsedMsg[0] === '/color'){
					socket.emit('setColor', parsedMsg[1])
					socket.emit('commandEvent', ' changed their text color to ' + parsedMsg[1]);
				} else{
					// console.log('invalid')
					socket.emit('invalidEvent', parsedMsg[0] + ' is an invalid command');
				}
			}
		}else{
			socket.emit('messageEvent', messageStr);
		}
		// clear the input box everytime a message is sent
		$('#myMessage').val('');
	});

	// when user disconnects, redirect them to username page
	socket.on('disconnect', function(user){
		window.location.href = '/';
	})

	// display messages on page
	socket.on('messageEvent', function(msg) {
		// console.log(msg)

		// sticky scrollbox
		var out = document.getElementById("out");
		var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
	    $("#messages").append(msg);
	    if(isScrolledToBottom) out.scrollTop = out.scrollHeight - out.clientHeight;
	});

	// acknowledge that a message was recieved by the client
	socket.on('messageRecd', function(msg){
		messageRecd.innerHTML = msg
		setTimeout(function() {
		    messageRecd.innerHTML = '';
		}, (3000));
	});
});

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}