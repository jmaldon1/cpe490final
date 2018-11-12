$(document).ready(function() {
	$('#submit').on('click', function() {
		// document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "username=" + $('#user').val();
	});
});