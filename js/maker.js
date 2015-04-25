$(function(){
	$('#hide-nodebar').click(function() {
		state = $('#arrow').text() == 'show' ? 'hide' : 'show';
		$('#arrow').text(state);
		fade = state == 'show' ? $('.nodebar').animate({'left': '-125px'}) && $('#hide-nodebar').animate({'left': '25px'}): $('.nodebar').animate({'left': '0px'}) && $('#hide-nodebar').animate({'left': '150px'});
	});
});