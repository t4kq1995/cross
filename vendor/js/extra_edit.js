/******** Check extra buttons ********/
var checkExtraButtons = function(SHOW_ANSWERS) {
	var status = $('#extra_buttons').prop('hidden');

	if (!status && SHOW_ANSWERS) {
		$('#show_answer').prop('disabled', true);
		$('#edit_mode').prop('disabled', true);
	} else {
		$('#show_answer').prop('disabled', false);
		$('#show_answer').attr('data-status', 'true');
		$('#show_answer').text('Показать ответы');

		$('#edit_mode').prop('disabled', false);
		$('#edit_mode').attr('data-status', 'true');
		$('#edit_mode').text('Разгадать кроссворд');
	}
}

/******** Show chars in table ********/
var showCharsInTable = function(status) {

	switch(status) {
		case true:
			$('.table').find('td').each(function(event) {
				if ($(this).has('span')) {
					if ($(this).find('span').hasClass('char_not_show')) {
						$(this).find('span').removeClass('char_not_show');
					}
				}
			});
			$('#edit_mode').prop('disabled', true);
			break;

		case false:
			$('.table').find('td').each(function(event) {
				if ($(this).has('span')) {
					$(this).find('span').addClass('char_not_show');
				}
			});
			$('#edit_mode').prop('disabled', false);
			break;

		default:
			break;
	}
}

/******** Show answers mode ********/
$('#show_answer').click(function(event) {
	event.preventDefault();

	switch($(this).attr('data-status')) {
		case 'true':
			$(this).attr('data-status', 'false');
			$(this).text('Скрыть ответы');
			showCharsInTable(true);
			break;

		case 'false':
			$(this).attr('data-status', 'true');
			$(this).text('Показать ответы');
			showCharsInTable(false);
			break;

		default:
			break;
	}
});
/******** Check right ********/
var checkRight = function(element) {
	var input = element.text()[0];
	var right = element.find('span').text();
	if (input == right) {
		element.css('color', '#5cb85c');
	} else {
		element.css('color', '#d9534f');
	}
}

/******** Count characters ********/
var checkCharCount = function(element, max, event) {
	if(event.which != 8 && element.text().length > max) {
       event.preventDefault();
    }
}

/******** Edit mode activate ********/
var editMode = function() {
	$('td').click(function(event) {
		if ($(this).has('span').length > 0) {
			$(this).prop('contentEditable', true);
			$(this).focus();
			$(this).css('color', 'black');

			$(this).keyup(function(event) {
				checkCharCount($(this), 1, event);
			});

			$(this).keydown(function(event) {
				checkCharCount($(this), 1, event);
			});

			$(this).focusout(function(event) {
				checkRight($(this));
			});
		}
	});
}

/******** Finish edit mode ********/
var finishEditMode = function() {
	$('.table').find('td').each(function(event) {
		if ($(this).text().length < 2 || $(this).css('color') == 'rgb(217, 83, 79)') {
			if ($(this).text().length == 2) {
				var char = $(this).text()[1];
			} else {
				var char = $(this).text();
			}
			$(this).css('color', '#d9534f').text(char);
		}
	});
}

/******** Show edit mode ********/
$('#edit_mode').click(function(event) {
	event.preventDefault();

	if ($(this).attr('data-status') == 'true') {
		$('#show_answer').prop('disabled', true);
		$(this).attr('data-status', 'false');
		$(this).text('Завершить кроссворд');
		editMode();
	} else {
		$(this).prop('disabled', true);
		$(this).attr('data-status', 'true');
		$(this).attr('data-status', 'true');
		finishEditMode();
	}

});