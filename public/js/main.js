$(document).ready( function() {
	$('.deleteUser').click(deleteUser);


	function deleteUser() {
		var confirmation = confirm('Are you sure?');
		var id = $(this).data('id');
		if(confirmation) {
			$.ajax({
				method: "DELETE",
				url: '/users/delete/'+id
			})
			.done(function(response) {
				window.location.replace('/');
			});
			window.location.replace('/');
		}
		else {
			return false;
		}
	}
});