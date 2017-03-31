
$(function() {
	// Setup drop down menu
	$( "#draggable" ).draggable({
		drag: function (event, ui){
			console.log('drag');
		},
		start: function (event, ui){
			console.log('start');
		},
		stop: function (event, ui){
			console.log('stop');
		}
	});
});

