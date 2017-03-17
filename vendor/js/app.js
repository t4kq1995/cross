$(document).ready(function() {
	/******** GLOBALS ********/
	var ROWS = 20;
	var COLUMNS = 20;
	var table = $('table > tbody');
	var TYPE = 'dictionary';
	var WORDS = 10;
	var TEMPLATE = undefined;
	var CATEGORY = 'all';
	var CURRENT_LI = undefined;
	var routing = {
		getwords: 'controller/getwords.php',
		allwords: 'controller/allwords.php',
		ownwords: 'controller/ownwords.php',
		deleteownword: 'controller/deleteownword.php',
		addownword: 'controller/addownword.php',
		gettemplatewords: 'controller/gettemplatewords.php'
	}
	var SHOW_ANSWERS = true;

	/******** Check type or category ********/
	$('li').click(function(event) {
		event.preventDefault();

		if (!$(this).hasClass('disabled')) {
			var class_name = $(this).parent().attr('class').split(' ')[1];
			CURRENT_LI = $(this);

			switch(class_name) {
				case 'type':
					formSettings();
					break;

				case 'category':
					changeWhatCategory();
					break;

				default:
					break;
			}
		}
	});

	var changeWhatCategory = function() {
		var ul = CURRENT_LI.parent();
		ul.find('li').each(function(event) {
			$(this).find('span').remove();
			$(this).addClass('list-group-item-action check');
			if (CURRENT_LI.data('type') == $(this).data('type')) {
				$(this).removeClass('list-group-item-action check');
				$(this).append('<span class="float-xs-right text-success"><i class="fa fa-check" aria-hidden="true"></i></span>');
				CATEGORY = $(this).data('type');
			}
		});
	}

	var changeWhatType = function() {
		var ul = CURRENT_LI.parent();
		ul.find('li').each(function(event) {
			$(this).find('span').remove();
			$(this).addClass('list-group-item-action check');
			if (CURRENT_LI.data('type') == $(this).data('type')) {
				$(this).removeClass('list-group-item-action check');
				$(this).append('<span class="float-xs-right text-success"><i class="fa fa-check" aria-hidden="true"></i></span>');

				if ($(this).data('type') == 'template') {
					/* Block all type li */
					$('body').find('ul.category').find('li').each(function(event) {
						$(this).find('span').remove();
						if (!$(this).hasClass('list-group-item-action')) {
							$(this).addClass('list-group-item-action check');
						}
					});

					$('body').find('ul.category').find('li:first').removeClass('list-group-item-action check').append('<span class="float-xs-right text-success"><i class="fa fa-check" aria-hidden="true"></i></span>');
					CATEGORY = 'all';
					$('body').find('ul.category').find('li.list-group-item-action').each(function(event) {
						$(this).addClass('disabled');
					});
				} else {
					$('body').find('ul.category').find('li.list-group-item-action').each(function(event) {
						$(this).removeClass('disabled');
					});
				}
			}
		});
	}

	var formSettings = function() {
		var body = $('#settings').find('.modal-body');
		body.empty();

		switch(CURRENT_LI.data('type')) {
			case 'dictionary':
				body.append(makeFormsDictionary());
				$('#select_type').attr('data-type', 'dictionary');
				break;

			case 'template':
				body.append(makeFormsTemplate());
				$('#select_type').attr('data-type', 'template');
				break;

			default:
				break;
		}

		$('#settings').modal('show');
	}

	var makeFormsDictionary = function() {
		var div = $('<div/>', {'class': 'form-group row'});
		var label = $('<label/>', {
			'for': 'number_words',
			'class': 'col-xs-4 col-form-label'
		});
		var div_xs = $('<div/>', {'class': 'col-xs-8'});
		var input = $('<input/>', {
			'min': '2',
			'max': '20',
			'class': 'form-control',
			'type': 'number',
			'value': CURRENT_LI.text().split('(')[1].split(')')[0].split(' ')[0],
			'id': 'number_words'
		});

		label.append('Количество слов');
		div_xs.append(input);
		div.append(label).append(div_xs);

		return div;
	}

	var makeFormsTemplate = function() {
		var div_row = $('<div/>', {'class': 'row'});
		var images = ['img1.png', 'img2.png'];
		for (var i = 0; i < images.length; i++) {
			var col = $('<div/>', {'class': 'col-lg-4'});
			var card = $('<div/>', {'class': 'card text-xs-center check-hover', 'data-id': i});
			var img = $('<img/>', {
				'class': 'card-img-top',
				'src': 'vendor/images/' + images[i],
				'width': '100%',
				'alt': 'Card image'
			});
			var block = $('<div/>', {'class': 'card-block'});
			var p = $('<p/>', {'class': 'card-text'});

			p.append('Шаблон №' + (i+1));
			block.append(p);
			card.append(img).append(block);
			col.append(card);

			div_row.append(col);
		}
		return div_row;
	}

	$('#settings').on('hide.bs.modal', function (e) {
		$('#select_type').unbind('click');
	});

	$('#settings').on('shown.bs.modal', function() {
		/* Card click */
		$('.card').click(function(event) {
			event.preventDefault();

			if ($(this).hasClass('check-active')) {
				$(this).removeClass('check-active');
				TEMPLATE = undefined;
			} else {
				$(this).parent().parent().find('.card').each(function(event) {
					if ($(this).hasClass('check-active')) {
						$(this).removeClass('check-active');
					}
				});

				$(this).addClass('check-active');
				TEMPLATE = $(this).data('id');
			}
		});

		/* Button click */
		$('#select_type').click(function(event) {
			event.preventDefault();
			type = $(this).attr('data-type');

			switch(type) {
				case 'dictionary':
					if ($('#number_words').val() >= 2 && $('#number_words').val() <= 20) {
						TYPE = 'dictionary';
						WORDS = $('#number_words').val();
						CURRENT_LI.text('Генерация по словарю (' + WORDS + ' слов)');
					}
					break;

				case 'template':
					TYPE = 'template';
					CURRENT_LI.text('Генерация по шаблону (Шаблон №' + (TEMPLATE + 1) + ')');
					break;

				default:
					break;
			}
			changeWhatType();
			$('#settings').modal('hide');
		});
	});

	/******** Build empty fields ********/
	var buildSquare = function(rows, cols, table) {
		table.empty();
		for (var i = 0; i < ROWS; i++) {
			var tr = $('<tr/>', {'data-row-id': i});
			for (var j = 0; j < COLUMNS; j++) {
				var td = $('<td/>', {'data-column-id': j, 'class': 'text-xs-center'});
				tr.append(td.append('&nbsp;'));
			}
			table.append(tr);
		}
	}

	/******** Get count words ********/
	var getCountWords = function() {
		return $.ajax({
			type: "GET",
			dataType: "json",
      		url: routing.allwords
  		});
	}

	/******** Show count words ********/
	var showCountWords = function() {
		/* Get count words */
		var count_words = getCountWords();

		count_words.success(function(data) {
			$('#total').text(data.data[0].total);
		});

		count_words.error(function(data) {
			console.log('Не удалось загрузить общее количество слов - ', data);
		});
	}

	/******** Show words by categories ********/
	var showWordsCat = function(categories) {
		$('#tech').text(categories['tech']);
		$('#sport').text(categories['sport']);
		$('#science').text(categories['science']);
	}

	/******** Make word list ********/
	var makeWordList = function() {
		return $.ajax({
			type: "POST",
			dataType: "json",
      		url: routing.getwords,
      		data: {
      			'category': CATEGORY,
      			'words': WORDS
      		}
  		});
	}

	/******** Make word list by template ********/
	var makeWordListTemplate = function() {
		return $.ajax({
			type: "POST",
			dataType: "json",
      		url: routing.gettemplatewords,
      		data: {
      			'category': CATEGORY
      		}
  		});
	}

	/******** Construct crossword by template ********/
	var constructCrosswordByTeamplate = function() {
		main(SHOW_ANSWERS, TEMPLATE);
	}

	/******** Construct crossword ********/
	var constructCrosswordByDict = function() {
		var words = [];
		var clues = [];
		var categories = {
			'tech': 0,
			'sport': 0,
			'science': 0
		};
		var words_result = makeWordList();

		words_result.success(function(data) {
			for (var i = 0; i < data.data.length; i++) {
				words.push(data.data[i].word.toLowerCase());
				clues.push(data.data[i].clue);
				categories[data.data[i].category] += 1;
				console.log(data.data[i].category);
			}

			/* Get words by categories */
			showWordsCat(categories);

			try {
				var cw = new Crossword(words, clues, ROWS, COLUMNS);
				var tries = 10;
    			var grid = cw.getSquareGrid(tries);
			} catch (error) {
				new PNotify({
    				title: 'Ошибка',
    				text: error,
    				type: 'error'
				});
			}

    		if (grid != null) {
    			var legend = cw.getLegend(grid);

	    		cw.ShowLegend(legend);
	    		CrosswordUtils.toHtml(grid, SHOW_ANSWERS, ROWS, COLUMNS, TYPE);

	    		/* Change status */
	    		$('#status').removeClass('text-warning').removeClass('text-danger').addClass('text-success').text('построено');
    		} else {
    			/* Change status */
	    		$('#status').removeClass('text-warning').removeClass('text-success').addClass('text-danger').text('повтор генерации');
	    		constructCrosswordByDict();
    		}

		});

		words_result.error(function(data) {
			console.log('Не удалось загрузить список слов - ', data);
		});
	}

	/******** Start generate crossword ********/
	$('#start_cross').click(function(event) {
		event.preventDefault();

		/* Build field */
		buildSquare(ROWS, COLUMNS, table);

		/* Start timer generator */
		var start = Date.now();

		switch(TYPE) {
			case 'dictionary':
				constructCrosswordByDict();
				break;

			default:
				constructCrosswordByTeamplate();
				break;
		}

		/* End timer generator */
		var end = Date.now();
		/* Show time */
		$('#time_collapse').text((end - start) / 100);

		/* Show extra buttons */
		$('#extra_buttons').prop('hidden', false);
		checkExtraButtons(SHOW_ANSWERS);

		/* Enable / disable print / pdf */
		$('#print').prop('disabled', SHOW_ANSWERS);
	});

	/******** Start generate ********/
	var startGenerate = function() {
		/* Build field */
		buildSquare(ROWS, COLUMNS, table);

		/* Show count words */
		showCountWords();
	}

	/******** Enable switcher ********/
	$('#myswitch').switchable({
        click: function(ev, checked) {
            SHOW_ANSWERS = checked;
        }
    });

	/******** Print cross ********/
    $('#print').click(function() {
        var printing_css = '<style media=print>span {display:none;} td {width:25px; height:25px;} li {list-style-type:none;} p{font-size:8px; position:absolute; margin-top:-10px;}</style>';
        var print_table = $('#print_table').clone();
        print_table.find('td').each(function(event) {
        	if ($(this).css('background-image') != '') {
        		$(this).html('<p>' + $(this).css('background-image').split('/')[3].split('.')[0] + '</p>');
        	} else if ($(this).text() != '&nbsp;') {
        		$(this).html('');
        	}
        });
        var html_to_print = printing_css + print_table.html() + $('#tasks_cross').html();
        var iframe = $('<iframe id="print_frame">');
        $('body').append(iframe);
        var doc = $('#print_frame')[0].contentDocument || $('#print_frame')[0].contentWindow.document;
        var win = $('#print_frame')[0].contentWindow || $('#print_frame')[0];
        doc.getElementsByTagName('body')[0].innerHTML = html_to_print;
        win.print();
        $('iframe').remove();
    });

    /******** Show own cross ********/
    $('#show_own').click(function(event) {
    	event.preventDefault();
  		$('#show_own_cross').modal('show');
    });

    /******** Get info about own words ********/
    var getOwnWords = function() {
    	return $.ajax({
			type: "GET",
			dataType: "json",
      		url: routing.ownwords
  		});
    }

    /******** Ajax delete own word ********/
	var deleteOwnWord = function(id) {
		return $.ajax({
			type: "POST",
			dataType: "json",
      		url: routing.deleteownword,
      		data: {
      			'id': id
      		}
  		});
	}

    /******** Delete word element ********/
    var deleteWordElement = function() {
    	$('.card_link').click(function(event) {
			event.preventDefault();
			var word_delete = deleteOwnWord($(this).attr('data-id'));

			word_delete.success(function(data) {
				buildInfoOwnWords();
				showCountWords();
			});

			word_delete.error(function(data) {
				console.log('Произошла ошибка при удалении собственного слова - ', data);
			});
		});
    }

    /******** Build card cheme words ********/
    var buildInfoOwnWords = function() {
    	var words = getOwnWords();

    	words.success(function(data) {
    		var body = $('#show_own_cross').find('.modal-body');
    		var body_div = $('<div/>', {'class': 'text-xs-center'});
    		body_div.append("<img src='vendor/images/status.gif'>");
    		body_div.append("<br><span>Загрузка...</span>");

    		body.empty();
    		body.append(body_div);

    		var row = $('<div/>', {'class': 'row'});

    		if (data.data.length > 0) {
    			for (var i = 0; i < data.data.length; i++) {
	    			var col = $('<div/>', {'class': 'col-lg-6'});
	    			var card = $('<div/>', {'class': 'card card_own'});
	    			var card_block = $('<div/>', {'class': 'card-block'});
	    			var h4 = $('<h4/>', {'class': 'card-title'});
	    			var p = $('<p/>', {'class': 'card-text'});
	    			var a_delete = $('<a/>', {'href': '', 'class': 'card-link card_link', 'data-id': data.data[i].id_word});

	    			a_delete.append('<i class="fa fa-times" aria-hidden="true"></i>');
	    			h4.append(data.data[i].word);
	    			h4.append(a_delete);
	    			p.append(data.data[i].clue);

	    			card_block.append(h4);
	    			card_block.append(p);
	    			//card_block.append(a_delete);
	    			col.append(card.append(card_block));

	    			row.append(col);
	    		}

	    		body.empty();
	    		body.append(row);
    		} else {
    			body.empty();
    			row.append("<div class='col-lg-12 text-xs-center'><span>Словарь пуст<span></div>");
    			body.append(row);
    		}

    		/* Delete word if element exists */
    		deleteWordElement();
    	});

    	words.error(function(data) {
    		console.log('Не удалось загрузить слова из своего словаря - ', data);
    	})
    }

    /******** Show modal own cross ********/
    $('#show_own_cross').on('shown.bs.modal', function (e) {
  		buildInfoOwnWords();
	});

	/******** Button add new own word ********/
	$('#add_new_word').click(function(event) {
		event.preventDefault();
		$('#modal_add_new_word').modal('show');
	});

	/******** Unbind for avoid exception ********/
	$('#modal_add_new_word').on('hide.bs.modal', function (e) {
		$('#add_new_word_modal').unbind('click');
	});

	/******** Add new own word ajax ********/
	var addNewOwnWord = function(word, clue) {
		return $.ajax({
			type: "POST",
			dataType: "json",
      		url: routing.addownword,
      		data: {
      			'word': word,
      			'clue': clue
      		}
  		});
	}

	/******** Add new own word modal ********/
	$('#modal_add_new_word').on('show.bs.modal', function (e) {
  		$('#add_new_word_modal').click(function(event) {
  			event.preventDefault();
  			var word = $('#word_modal').val();
  			var clue = $('#clue_modal').val();

  			if (word != '' && clue != '') {
  				var insert_word = addNewOwnWord(word, clue);

  				insert_word.success(function(data) {
  					$('#word_modal').val('');
  					$('#clue_modal').val('');

  					new PNotify({
    					title: 'Успешно',
    					text: 'Слово добавлено в Ваш словарь',
    					type: 'success'
					});

					showCountWords();

					$('#modal_add_new_word').modal('hide');
  				});

  				insert_word.error(function(data) {
  					console.log('Ошибка при добавлении слова в словарь - ', data);
  				});
  			}
  		});
	});

	/******** Main ********/
	$(window).on('load', function() {
  		$('#preloader_status').fadeOut();
  		$('#preloader').delay(350).fadeOut('slow');
  		$('body').delay(350).css({'overflow':'visible'});
	});

	startGenerate();

});