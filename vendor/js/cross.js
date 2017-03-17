/***** Make crossword cell - empty or with char *****/
function CrosswordCell(letter) {
    this.char = letter;
    this.across = undefined;
    this.down = undefined;
}

/***** Check if it is start of word or not *****/
function CrosswordCellNode(is_start_of_word, index) {
    this.is_start_of_word = is_start_of_word;
    this.index = index;
}

function WordElement(word, index) {
    this.word = word;
    this.index = index;
}

function Crossword(words_in, clues_in, rows, cols) {
    var GRID_ROWS = rows;
    var GRID_COLS = cols;
    var char_index = {};
    var bad_words;

    this.getSquareGrid = function(max_tries) {
        var best_grid = null;
        var best_ratio = 0;
        for (var i = 0; i < max_tries; i++){
            var a_grid = this.getGrid(1);
            if (a_grid == null) continue;
            var ratio = Math.min(a_grid.length, a_grid[0].length) * 1.0 / Math.max(a_grid.length, a_grid[0].length);
            if (ratio > best_ratio) {
                best_grid = a_grid;
                best_ratio = ratio;
            }

            if (best_ratio == 1) break;
        }
        return best_grid;
    }

    this.getGrid = function(max_tries) {
        for (var tries = 0; tries < max_tries; tries++){
            clear();
            var start_dir = randomDirection();
            var r = Math.floor(grid.length / 2);
            var c = Math.floor(grid[0].length / 2);
            var word_element = word_elements[0];
            if (start_dir == "across") {
                c -= Math.floor(word_element.word.length / 2);
            } else {
                r -= Math.floor(word_element.word.length / 2);
            }

            if (canPlaceWordAt(word_element.word, r, c, start_dir) !== false) {
                placeWordAt(word_element.word, word_element.index, r, c, start_dir);
            } else {
                bad_words = [word_element];
                return null;
            }

            var groups = [];
            groups.push(word_elements.slice(1));
            for (var g = 0; g < groups.length; g++) {
                word_has_been_added_to_grid = false;
                // try to add all the words in this group to the grid
                for (var i = 0; i < groups[g].length; i++) {
                    var word_element = groups[g][i];
                    var best_position = findPositionForWord(word_element.word);
                    if (!best_position) {
                        // make the new group (if needed)
                        if (groups.length - 1 == g) groups.push([]);
                        // place the word in the next group
                        groups[g + 1].push(word_element);
                    } else {
                        var r = best_position["row"], c = best_position["col"], dir = best_position['direction'];
                        placeWordAt(word_element.word, word_element.index, r, c, dir);
                        word_has_been_added_to_grid = true;
                    }
                }
                // if we haven't made any progress, there is no point in going on to the next group
                if (!word_has_been_added_to_grid) break;
            }
            // no need to try again
            if (word_has_been_added_to_grid) return minimizeGrid();
        }

        bad_words = groups[groups.length - 1];
        return null;
    }

    this.getBadWords = function() {
        return bad_words;
    }

    this.getLegend = function(grid) {
        var groups = {"across" : [], "down" : []};
        var position = 1;
        for(var r = 0; r < grid.length; r++) {
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
                var increment_position = false;
                // check across and down
                for(var k in groups){
                    // does a word start here? (make sure the cell isn't null, first)
                    if(cell && cell[k] && cell[k]['is_start_of_word']){
                        var index = cell[k]['index'];
                        groups[k].push({"position" : position, "index" : index, "clue" : clues_in[index], "word" : words_in[index]});
                        increment_position = true;
                    }
                }

                if(increment_position) position++;
            }
        }
        return groups;
    }

    /* Show legend help */
    this.ShowLegend = function(groups) {
    	var mapLegend = ['.horizontal', '.vertical'];
    	var step = 0;
		for (var k in groups) {
			var html = [];
			for (var i = 0; i < groups[k].length; i++) {
				html.push("<li class='legend'><strong>" + groups[k][i]['position'] + ".</strong> " + groups[k][i]['clue'] + "</li>");
			}

			/* Add to html map */
			$('body').find(mapLegend[step]).empty().html(html.join('\n'));
			step++;
		}
	}

    // move the grid onto the smallest grid that will fit it
    var minimizeGrid = function() {
        // find bounds
        var r_min = GRID_ROWS - 1, r_max = 0, c_min = GRID_COLS - 1, c_max = 0;
        for (var r = 0; r < GRID_ROWS; r++) {
            for (var c = 0; c < GRID_COLS; c++) {
                var cell = grid[r][c];
                if (cell != null){
                    if (r < r_min) r_min = r;
                    if (r > r_max) r_max = r;
                    if (c < c_min) c_min = c;
                    if (c > c_max) c_max = c;
                }
            }
        }
        // initialize new grid
        var rows = r_max - r_min + 1;
        var cols = c_max - c_min + 1;
        var new_grid = new Array(rows);
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                new_grid[r] = new Array(cols);
            }
        }

        // copy the grid onto the smaller grid
        for (var r = r_min, r2 = 0; r2 < rows; r++, r2++) {
            for (var c = c_min, c2 = 0; c2 < cols; c++, c2++) {
                new_grid[r2][c2] = grid[r][c];
            }
        }

        return new_grid;
    }

    // helper for placeWordAt();
    var addCellToGrid = function(word, index_of_word_in_input_list, index_of_char, r, c, direction) {
        var char = word.charAt(index_of_char);
        if (grid[r][c] == null) {
            grid[r][c] = new CrosswordCell(char);

            // init the char_index for that character if needed
            if (!char_index[char]) char_index[char] = [];

            // add to index
            char_index[char].push({"row" : r, "col" : c});
        }

        var is_start_of_word = index_of_char == 0;
        grid[r][c][direction] = new CrosswordCellNode(is_start_of_word, index_of_word_in_input_list);
    }

    // place the word at the row and col indicated (the first char goes there)
    // the next chars go to the right (across) or below (down), depending on the direction
    var placeWordAt = function(word, index_of_word_in_input_list, row, col, direction) {
        if (direction == "across"){
            for(var c = col, i = 0; c < col + word.length; c++, i++) {
                addCellToGrid(word, index_of_word_in_input_list, i, row, c, direction);
            }
        } else if(direction == "down") {
            for(var r = row, i = 0; r < row + word.length; r++, i++){
                addCellToGrid(word, index_of_word_in_input_list, i, r, col, direction);
            }
        } else {
            throw "Invalid Direction";
        }
    }

    // you can only place a char where the space is blank, or when the same
    // character exists there already
    // returns false, if you can't place the char
    // 0 if you can place the char, but there is no intersection
    // 1 if you can place the char, and there is an intersection
    var canPlaceCharAt = function(char, row, col) {
        // no intersection
        if (grid[row][col] == null) return 0;
        // intersection!
        if (grid[row][col]['char'] == char) return 1;

        return false;
    }

    // determines if you can place a word at the row, column in the direction
    var canPlaceWordAt = function(word, row, col, direction) {
        // out of bounds
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return false;

        if (direction == "across"){
            // out of bounds (word too long)
            if (col + word.length > grid[row].length) return false;
            // can't have a word directly to the left
            if (col - 1 >= 0 && grid[row][col - 1] != null) return false;
            // can't have word directly to the right
            if (col + word.length < grid[row].length && grid[row][col+word.length] != null) return false;

            // check the row above to make sure there isn't another word
            // running parallel. It is ok if there is a character above, only if
            // the character below it intersects with the current word
            for (var r = row - 1, c = col, i = 0; r >= 0 && c < col + word.length; c++, i++) {
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // same deal as above, we just search in the row below the word
            for (var r = row + 1, c = col, i = 0; r < grid.length && c < col + word.length; c++, i++) {
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for (var c = col, i = 0; c < col + word.length; c++, i++) {
                var result = canPlaceCharAt(word.charAt(i), row, c);
                if (result === false) return false;
                intersections += result;
            }

        } else if(direction == "down") {
            // out of bounds
            if (row + word.length > grid.length) return false;
            // can't have a word directly above
            if (row - 1 >= 0 && grid[row - 1][col] != null) return false;
            // can't have a word directly below
            if (row + word.length < grid.length && grid[row+word.length][col] != null) return false;

            // check the column to the left to make sure there isn't another
            // word running parallel. It is ok if there is a character to the
            // left, only if the character to the right intersects with the
            // current word
            for (var c = col - 1, r = row, i = 0; c >= 0 && r < row + word.length; r++, i++) {
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if (!can_place_here) return false;
            }

            // same deal, but look at the column to the right
            for (var c = col + 1, r = row, i = 0; r < row + word.length && c < grid[r].length; r++, i++) {
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if (!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for (var r = row, i = 0; r < row + word.length; r++, i++) {
                var result = canPlaceCharAt(word.charAt(i, 1), r, col);
                if (result === false) return false;
                intersections += result;
            }
        } else {
            throw "Invalid Direction";
        }
        return intersections;
    }

    var randomDirection = function() {
        return Math.floor(Math.random() * 2) ? "across" : "down";
    }

    var findPositionForWord = function(word) {
        // check the char_index for every letter, and see if we can put it there in a direction
        var bests = [];
        for (var i = 0; i < word.length; i++) {
            var possible_locations_on_grid = char_index[word.charAt(i)];
            if (!possible_locations_on_grid) continue;
            for (var j = 0; j < possible_locations_on_grid.length; j++) {
                var point = possible_locations_on_grid[j];
                var r = point['row'];
                var c = point['col'];
                // the c - i, and r - i here compensate for the offset of character in the word
                var intersections_across = canPlaceWordAt(word, r, c - i, "across");
                var intersections_down = canPlaceWordAt(word, r - i, c, "down");

                if (intersections_across !== false)
                    bests.push({"intersections" : intersections_across, "row" : r, "col" : c - i, "direction" : "across"});
                if (intersections_down !== false)
                    bests.push({"intersections" : intersections_down, "row" : r - i, "col" : c, "direction" : "down"});
            }
        }

        if (bests.length == 0) return false;

        // find a good random position
        var best = bests[Math.floor(Math.random() * bests.length)];

        return best;
    }

    var clear = function() {
        for (var r = 0; r < grid.length; r++){
            for (var c = 0; c < grid[r].length; c++){
                grid[r][c] = null;
            }
        }
        char_index = {};
    }

    // constructor
    if (words_in.length < 2) throw "Кроссворд должен состоять хотя бы из двух слов";
    if (words_in.length != clues_in.length) throw "Количество слов должно совпадать с количеством объяснений";

    // build the grid;
    var grid = new Array(GRID_ROWS);
    for (var i = 0; i < GRID_ROWS; i++) {
        grid[i] = new Array(GRID_COLS);
    }

    // build the element list (need to keep track of indexes in the originial input arrays)
    var word_elements = [];
    for (var i = 0; i < words_in.length; i++) {
        word_elements.push(new WordElement(words_in[i], i));
    }

    // I got this sorting idea from http://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword/1021800#1021800
    // seems to work well
    word_elements.sort(function(a, b){ return b.word.length - a.word.length; });
}

var CrosswordUtils = {
    PATH_TO_PNGS_OF_NUMBERS : "vendor/images/numbers/",

    centerScreen: function(grid, rows, cols) {
    	return {
    		x: Math.round((rows - grid[0].length) / 2),
    		y: Math.round((cols - grid.length) / 2)
    	}
    },

    toHtml: function(grid, show_answers, rows, cols, category) {
        if (grid == null) return;
        var label = 1;
        var fault_x = 0;
		var fault_y = 0;

        if (category == 'dictionary') {
        	var fault = this.centerScreen(grid, rows, cols);
        	fault_x = fault.x;
        	fault_y = fault.y
        }

        if (show_answers) {
        	$('.table').addClass('table-bordered');
        } else {
        	$('.table').removeClass('table-bordered');
        }

        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].length; j++) {
                var cell = grid[i][j];
                var char = '';
                var is_start_of_word = false;
                if (cell != null) {
                    char = cell['char'];
                    is_start_of_word = (cell['across'] && cell['across']['is_start_of_word']) || (cell['down'] && cell['down']['is_start_of_word']);
                }

                if (is_start_of_word) {
                    var img_url = CrosswordUtils.PATH_TO_PNGS_OF_NUMBERS + label + ".png";
                    $('body').find('tr[data-row-id=' + (i + fault_x) + ']').find('td[data-column-id=' + (j + fault_y) + ']').attr("style", "background-image: url(" + img_url + ")");
                    label++;
                }

                if (show_answers) {
                	if (char == '&') {
                		$('body').find('tr[data-row-id=' + (i + fault_x) + ']').find('td[data-column-id=' + (j + fault_y) + ']').css('background-color', "#000");
                	} else {
                		$('body').find('tr[data-row-id=' + (i + fault_x) + ']').find('td[data-column-id=' + (j + fault_y) + ']').html(char);
                	}
                } else {
                	if (char != '') {
                		$('body').find('tr[data-row-id=' + (i + fault_x) + ']').find('td[data-column-id=' + (j + fault_y) + ']').css('border', '1px solid grey').html("<span class='char_not_show'>" + char + "</span>");
                	}
                }
            }
        }
    }
}