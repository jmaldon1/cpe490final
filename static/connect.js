$(document).ready(function() {
	username = getCookie('username')

	var socket = io.connect('http://localhost:5000');
	socket.on('connect', function() {
		socket.send(username + ' has connected!');
	});
	socket.on('message', function(msg) {
		$("#messages").append('<li>' + msg + '</li>');
		console.log('Received message');
	});
	$('#sendbutton').on('click', function() {
		socket.send(username + ": " + $('#myMessage').val());
		$('#myMessage').val('');
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