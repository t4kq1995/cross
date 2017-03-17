var map = [];
var mapTasks = [[],[]];

var stats = {}
var words = [];
var clue = [];

/* Crossword Cell object */
var CrossCell = function(letter, across, down, findAcrross, findDown, index, is_start, clue) {
    this.letter = letter;
    this.across = across;
    this.down = down;
    this.findAcrross = findAcrross;
    this.findDown = findDown;
    this.index = index;
    this.is_start = is_start;
    this.clue = null;
}

var grid_1 = [];


var makeMap = function(grid) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == '*') {
                checkDirection(i, j, grid);
            }
        }
    }
}

var checkExists = function(row, column) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].index[0] == row && map[i].index[1] == column) {
            return i;
        }
    }
    return false;
}

var checkDirection = function(row, column, grid) {
    var isChange = false;
    // Right
    if (column != grid[row].length - 1 && grid[row][column + 1] == '*') {
        map.push(new CrossCell(null, true, false, true, null, [row, column], false));
        isChange = true;
    }

    // Bottom
    if (row != grid.length - 1 && grid[row + 1][column] == '*') {
        if (isChange) {
            map[checkExists(row, column)].down = true;
            map[checkExists(row, column)].findDown = true;
            map[checkExists(row, column)].is_start = true;
        } else {
            map.push(new CrossCell(null, false, true, null, true, [row, column], false));
            isChange = true;
        }
    }

    if (!isChange) {
        map.push(new CrossCell(null, false, false, null, false, [row, column], false));
    }
}

var findEmptyLetter = function() {
    for (var i = 0; i < map.length; i++) {
        if (map[i].findAcrross == true || map[i].findDown == true) {
            map[i].is_start = true;
            return i;
        }
    }
    return false;
}

var is_numeric = function(str) {
    return /^\d+$/.test(str);
}

var is_letter = function(str) {
    return str.length === 1 && str.match(/[a-zа-я]/i);
}

var findFullWay = function() {
    var firstLetter = findEmptyLetter();
    console.log('find letter - ', map[firstLetter]);
    if (is_numeric(firstLetter)) {
        var way = map[firstLetter].findAcrross ? 'across' : 'down';
        console.log('way - ', way);
        var counter = 1;

        if (way == 'across') {

            var row = map[firstLetter].index[0];
            var column = map[firstLetter].index[1] + 1;

            for (var i = 0; i < map.length; i++) {
                if (map[i].index[0] == row && map[i].index[1] == column) {
                    counter += 1;
                    column += 1;
                }
            }

        } else {

            var row = map[firstLetter].index[0] + 1;
            var column = map[firstLetter].index[1];

            for (var i = 0; i < map.length; i++) {
                if (map[i].index[0] == row && map[i].index[1] == column) {
                    counter += 1;
                    row += 1;
                }
            }
        }

        return counter;

    } else {
        throw "We have no empty letters";
    }
}

var canPutLetter = function(element, letter) {
    console.log('can put - ', element.letter, letter);
    return (element.letter == null || element.letter == letter) ? true : false;
}

var tryToPutWord = function(word, clue) {
    var firstLetter = findEmptyLetter();
    var way = map[firstLetter].findAcrross ? 'across' : 'down';
    var counter = 0;
    if (way == 'across') {

        var row = map[firstLetter].index[0];
        var column = map[firstLetter].index[1];

        for (var i = 0; i < map.length; i++) {
            if (map[i].index[0] == row && map[i].index[1] == column && canPutLetter(map[i], word[counter])) {
                map[i].letter = word[counter];
                map[i].findAcrross = null;
                counter += 1;
                column += 1;
            }
        }

    } else {

        var row = map[firstLetter].index[0];
        var column = map[firstLetter].index[1];

        for (var i = 0; i < map.length; i++) {
            if (map[i].index[0] == row && map[i].index[1] == column && canPutLetter(map[i], word[counter])) {
                map[i].letter = word[counter];
                map[i].findDown = null;
                counter += 1;
                row += 1;
            }
        }
    }

    if (counter == word.length) {
        map[firstLetter].clue = [way, clue];
        return true;
    } else {
        return false;
    }
}

var getElementFromMap = function(row, column) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].index[0] == row && map[i].index[1] == column) {
            return map[i].letter;
        }
    }
    return false;
}

var isLetterStart = function(row, column) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].index[0] == row && map[i].index[1] == column) {
            return map[i].is_start;
        }
    }
}

var addTask = function(row, column, label) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].index[0] == row && map[i].index[1] == column) {
            if (map[i].clue[0] == 'across') {
                mapTasks[0].push([label, map[i].clue[1]]);
            } else {
                mapTasks[1].push([label, map[i].clue[1]]);
            }
        }
    }
}

var showTasks = function() {
    var mapLegend = ['.horizontal', '.vertical'];
    var step = 0;
    for (var k in mapTasks) {
        var html = [];
        for (var i = 0; i < mapTasks[k].length; i++) {
            html.push("<li class='legend'><strong>" + mapTasks[k][i][0] + ".</strong> " + mapTasks[k][i][1] + "</li>");
        }

        /* Add to html map */
        $('body').find(mapLegend[step]).empty().html(html.join('\n'));
        step++;
    }
}

var showCross = function(show_answers, grid, stats) {
    PATH_TO_PNGS_OF_NUMBERS : "vendor/images/numbers/";
    var label = 1;

    if (show_answers) {
        $('.table').addClass('table-bordered');
    } else {
        $('.table').removeClass('table-bordered');
    }

    $('#tech').text(stats['tech']);
    $('#science').text(stats['science']);
    $('#sport').text(stats['sport']);
    $('#status').removeClass('text-warning').removeClass('text-danger').addClass('text-success').text('построено');

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var cell = grid[i][j];

            switch(cell) {
                case '#':
                    $('body').find('tr[data-row-id=' + i + ']').find('td[data-column-id=' + j + ']').css('background-color', "#d8d9db").css('border', '1px solid grey');
                    break;

                case '*':
                    var isStart = isLetterStart(i, j);

                    if (isStart) {
                        var img_url = CrosswordUtils.PATH_TO_PNGS_OF_NUMBERS + label + ".png";
                        addTask(i, j, label);
                        $('body').find('tr[data-row-id=' + i + ']').find('td[data-column-id=' + j + ']').attr("style", "background-image: url(" + img_url + ")");
                        label++;
                    }

                    var char = getElementFromMap(i, j);
                    if (show_answers) {
                        if (is_letter(char)) {
                            $('body').find('tr[data-row-id=' + i + ']').find('td[data-column-id=' + j + ']').css('border', '1px solid grey').html(char);
                        } else {
                            throw 'We have no such letter';
                        }
                    } else {
                        if (is_letter(char)) {
                            $('body').find('tr[data-row-id=' + i + ']').find('td[data-column-id=' + j + ']').css('border', '1px solid grey').html("<span class='char_not_show'>" + char + "</span>");
                        } else {
                            throw 'We have no such letter';
                        }
                    }
                    break;

                default:
                    throw 'Invalid input grid';
                    break;
            }
        }

        showTasks();
    }
}

var formTemplate = function(template) {
    switch(template) {
        case 0:
            stats = {'tech': 2, 'science': 7, 'sport': 1}
            words = ['вихрь', 'инженю', 'ряд', 'нонсенс', 'светоч', 'тримикс', 'макабр', 'камео', 'оферта', 'ремарка'];
            clue = [
                'Вращательное или вихревое движения, придаваемое поступающей в цилиндр смеси за счет смешения впускного тракта.',
                'Амплуа актрисы, исполняющей простодушных и наивных девушек.',
                'Группа строп, крепящихся к куполу в точках, расположенных на одной линии вдоль крыла.(Парапланеризм)',
                'Бессмыслица, нелепость.',
                'То, что является источником истины, правды, свободы, просвещения.',
                'Центральная часть колеса.',
                'Смесь газов гелия, азота и кислорода, которая используется для очень глубоких погружений.(Дайвинг)',
                'Танец смерти.',
                'Появление известной персоны в кинофильме в эпизодической роли.',
                'Предложение заключить сделку.',
                'Поправка.'
            ];

            grid_1 = [
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '*', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '*', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '*', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '*', '#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '*', '#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ];

            break;

        case 1:
            stats = {'tech': 3, 'science': 5, 'sport': 2}
            words = ['ареометр', 'епитимия', 'инсургент', 'ментор', 'неофит', 'форсунка', 'табу', 'ступица', 'цевье', 'крен'];
            clue = [
                'Прибор для измерения плотности жидкости. В частности, электролита, с целью оценки степени заряженности аккумулятора.',
                'Наказание в христианстве: пост, молитвы и т.д.',
                'Участник вооруженного восстания; повстанец.',
                'Наставник.',
                'Новообращённый в какую-либо религию; новичок в каком-либо деле.',
                'Устройство для впрыска жидкости.',
                'Запрет.',
                'Центральная часть колеса.',
                'Накладка в передней части оружия, предназначенная для его удержания второй рукой.(Пейнтбол)',
                'Поворот плоскости кайта относительно продольной оси.(Кайтинг)'
            ];
            grid_1 = [
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '*', '*', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '*', '*', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '*', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '*', '*', '*', '*', '*', '*', '*', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '*', '#', '#', '*', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '*', '*', '*', '*', '#', '#', '*', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '*', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '*', '*', '*', '*', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '*', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ];
            break;

        default:
            break;
    }
}

var main = function(show_answers, template) {
    map = [];
    mapTasks = [[],[]];

    formTemplate(template);

    /* Make cell grid from normal grid */
    makeMap(grid_1);

    var start = findEmptyLetter();

    while (is_numeric(start)) {
        /* Get first word length */
        var length_word = findFullWay();
        var correct_words = [];
        var correct_clue = [];
        for (var i = 0; i < words.length; i++) {
            if (words[i].length == length_word) {
                correct_clue.push(clue[i]);
                correct_words.push(words[i]);
            }
        }

        if (correct_words.length > 0) {
            for (var i = 0; i < correct_words.length; i++) {
                var answer = tryToPutWord(correct_words[i], correct_clue[i]);
                if (answer) break;
            }
        } else {
            throw 'We can not find correct words';
        }

        start = findEmptyLetter();
    }

    showCross(show_answers, grid_1, stats);
}



