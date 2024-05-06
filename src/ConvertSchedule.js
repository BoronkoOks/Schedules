"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertToTable = exports.ReadFromHTMLFile = void 0;
var fs = require("fs");
var sax_1 = require("sax");
var parser = new sax_1.SAXParser();
// Класс состояний
var State = /** @class */ (function () {
    function State(name) {
        this.name = name;
        this.onopentag = function () { };
        this.onclosetag = function () { };
        this.ontext = function () { };
    }
    return State;
}());
var current; // текущее состояние
// Возможные состояния
var start = new State("start");
var table = new State("table");
var Tr = new State("tr");
var Td = new State("td");
var p = new State("p");
var font = new State("font");
parser.onopentag = function (tag) {
    current.onopentag(tag);
};
parser.onclosetag = function (tagName) {
    current.onclosetag(tagName);
};
parser.ontext = function (t) {
    current.ontext(t);
};
// Считать расписание из таблицы
function ReadFromHTMLFile() {
    var scheduleFromHTML = [[], [], [], [], [], [], [], [], [], [], [], []];
    var FromHtml = fs.readFileSync("src\\34.html", "utf8");
    current = start;
    var col = -1;
    var row = -2;
    start.onopentag = function (tag) {
        if (tag.name == "TABLE") {
            current = table;
        }
    };
    table.onopentag = function (tag) {
        if (tag.name == "TR") {
            current = Tr;
            row++;
            col = -1;
        }
    };
    Tr.onopentag = function (tag) {
        if (tag.name == "TD") {
            current = Td;
            col++;
        }
    };
    Td.onopentag = function (tag) {
        if (tag.name == "P") {
            current = p;
        }
    };
    p.onopentag = function (tag) {
        if (tag.name == "FONT") {
            current = font;
        }
    };
    font.ontext = function (t) {
        if (row > 0 && col > 0 && col <= 5) // считать только пары, не дни недели и не шапку
         {
            scheduleFromHTML[row - 1][col - 1] = t;
        }
    };
    font.onclosetag = function (tagName) {
        if (tagName == "FONT") {
            current = p;
        }
    };
    p.onclosetag = function (tagName) {
        if (tagName == "P") {
            current = Td;
        }
    };
    Td.onclosetag = function (tagName) {
        if (tagName == "TD") {
            current = Tr;
        }
    };
    Tr.onclosetag = function (tagName) {
        if (tagName == "TR") {
            current = table;
        }
    };
    parser.write(FromHtml).close();
    return scheduleFromHTML;
}
exports.ReadFromHTMLFile = ReadFromHTMLFile;
// Создать HTML таблицу с расписанием
function ConvertToTable(schedule) {
    var weekDays = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"];
    var fontSize = "2"; // размер шрифта расписания
    var colorEven = "#0000ff"; // цвет ячеек чётной недели
    var htmlTable = "<!DOCTYPE html><head><title>34 from DB</title>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n    </head>\n\n    <body>\n    <p id=\"Group\"><font face=\"Times New Roman\" size=\"5\" color=\"#0000ff\">\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0443\u0447\u0435\u0431\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B:</font><font face=\"Times New Roman\" size=\"6\" color=\"#ff00ff\"> 22\u0437</font></p>\n    <table border=\"\" cellspacing=\"3\" bordercolor=\"#000000\" cellpadding=\"2\" width=\"801\">\n    <tbody><tr><td>\n    <p><font>\u041F\u0430\u0440\u044B</font></p></td>\n    <td>\n    <p><font>1-\u044F</font></p></td>\n    <td>\n    <p><font>2-\u044F</font></p></td>\n    <td>\n    <p><font>3-\u044F</font></p></td>\n    <td>\n    <p><font>4-\u044F</font></p></td>\n    <td>\n    <p><font>5-\u044F</font></p></td>\n    </tr>\n    <tr><td>\n    <p><font>\u0412\u0440\u0435\u043C\u044F</font></p></td>\n    <td>\n    <p>08:00-09:35</p></td>\n    <td>\n    <p>09:45-11:20</p></td>\n    <td>\n    <p>11:30-13:05</p></td>\n    <td>\n    <p>13:55-15:30</p></td>\n    <td>\n    <p>15:40-17:15</p></td>\n    </tr>\n    ";
    // Нечётная неделя
    for (var i = 0; i < 6; i++) {
        htmlTable += "<tr><td>\n        <p><font size=\"" + fontSize + "\"><i><b>"
            + weekDays[i] +
            "</b></i></font></p></td>\n        ";
        for (var j = 0; j < 5; j++) {
            htmlTable += "<td>\n            <p><font size=\"" + fontSize + "\">"
                + schedule[i][j] +
                "</font></p></td>\n            ";
        }
        +"</tr>";
    }
    htmlTable += "\n    \n    ";
    // Чётная неделя
    for (var i = 6; i < 12; i++) {
        htmlTable += "<tr><td>\n        <p><font size=\"" + fontSize + "\" color=\"" + colorEven + "\"><i><b>"
            + weekDays[i - 6] +
            "</b></i></font></p></td>\n        ";
        for (var j = 0; j < 5; j++) {
            htmlTable += "<td>\n            <p><font size=\"" + fontSize + "\" color=\"" + colorEven + "\">"
                + schedule[i][j] +
                "</font></p></td>\n            ";
        }
        +"</tr>";
    }
    htmlTable += "</tbody></table>\n\n    <style>\n        td{\n            width = 15%\n            height = 28\n            vertical-align: top\n        }\n\n        p{\n            text-align: center\n        }\n\n        #Group{\n            text-align: left\n        }\n\n        body{\n            font-family: \"Arial\"\n        }\n    </style>\n    </body></html>";
    fs.writeFileSync("src\\34_from_DB.html", htmlTable);
}
exports.ConvertToTable = ConvertToTable;
