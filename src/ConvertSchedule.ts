import * as fs from "fs"
import { SAXParser, QualifiedTag, Tag } from "sax"


const parser = new SAXParser()

// Класс состояний
class State {
    constructor(public name: string) { }
    onopentag: (tag: Tag | QualifiedTag) => void = () => { }
    onclosetag: (tagName: string) => void = () => { }
    ontext: (t: string) => void = () => { }
}

let current: State // текущее состояние

// Возможные состояния
const start = new State("start")
const table = new State("table")
const Tr = new State("tr")
const Td = new State("td")
const p = new State("p")
const font = new State("font")

parser.onopentag = function (tag: Tag | QualifiedTag): void {
    current.onopentag(tag)
}

parser.onclosetag = function (tagName: string): void {
    current.onclosetag(tagName)
}

parser.ontext = function (t: string): void {
    current.ontext(t)
}


// Считать расписание из таблицы
export function ReadFromHTMLFile()
{
    const scheduleFromHTML: string[][] = [[], [], [], [], [], [], [], [], [], [], [], []]

    let FromHtml = fs.readFileSync("src\\34.html", "utf8")

    current = start

    let col = -1
    let row = -2

    start.onopentag = function (tag): void {
        if (tag.name == "TABLE")
        {
            current = table
        }
    }

    table.onopentag = function (tag): void {
        if (tag.name == "TR")
        {
            current = Tr

            row++
            col = -1
        }
    }

    Tr.onopentag = function (tag): void {
        if (tag.name == "TD")
        {
            current = Td

            col++
        }
    }

    Td.onopentag = function (tag): void {
        if(tag.name == "P")
        {
            current = p
        }
    }

    p.onopentag = function (tag): void {
        if(tag.name == "FONT")
        {
            current = font
        }
    }

    font.ontext = function(t: string): void {
        if (row > 0 && col > 0 && col <= 5) // считать только пары, не дни недели и не шапку
        {
            scheduleFromHTML[row-1][col-1] = t
        }
    }

    font.onclosetag = function (tagName: string): void {
        if (tagName == "FONT")
        {
            current = p
        }
    }

    p.onclosetag = function (tagName: string): void {
        if (tagName == "P")
        {
            current = Td
        }
    }

    Td.onclosetag = function (tagName: string): void {
        if (tagName == "TD")
        {
            current = Tr
        }
    }

    Tr.onclosetag = function (tagName: string): void {
        if (tagName == "TR")
        {
            current = table
        }
    }

    parser.write(FromHtml).close()

    return scheduleFromHTML
}


// Создать HTML таблицу с расписанием
export function ConvertToTable(schedule: string[][])
{
    const weekDays = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"]

    const fontSize = "2" // размер шрифта расписания
    const colorEven = "#0000ff" // цвет ячеек чётной недели

    let htmlTable = `<!DOCTYPE html><head><title>34 from DB</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body>
    <p id="Group"><font face="Times New Roman" size="5" color="#0000ff">Расписание занятий учебной группы:</font><font face="Times New Roman" size="6" color="#ff00ff"> 22з</font></p>
    <table border="" cellspacing="3" bordercolor="#000000" cellpadding="2" width="801">
    <tbody><tr><td>
    <p><font>Пары</font></p></td>
    <td>
    <p><font>1-я</font></p></td>
    <td>
    <p><font>2-я</font></p></td>
    <td>
    <p><font>3-я</font></p></td>
    <td>
    <p><font>4-я</font></p></td>
    <td>
    <p><font>5-я</font></p></td>
    </tr>
    <tr><td>
    <p><font>Время</font></p></td>
    <td>
    <p>08:00-09:35</p></td>
    <td>
    <p>09:45-11:20</p></td>
    <td>
    <p>11:30-13:05</p></td>
    <td>
    <p>13:55-15:30</p></td>
    <td>
    <p>15:40-17:15</p></td>
    </tr>
    `

    // Нечётная неделя
    for (let i = 0; i < 6; i++)
    {
        htmlTable += `<tr><td>
        <p><font size="` + fontSize + `"><i><b>`
        + weekDays[i] +
        `</b></i></font></p></td>
        `

        for (let j = 0; j < 5; j++)
        {
            htmlTable += `<td>
            <p><font size="` + fontSize + `">`
            + schedule[i][j] +
            `</font></p></td>
            `
        }

        + `</tr>`
    }

    htmlTable += `
    
    `

    // Чётная неделя
    for (let i = 6; i < 12; i++)
    {
        htmlTable += `<tr><td>
        <p><font size="` + fontSize + `" color="` + colorEven + `"><i><b>`
        + weekDays[i-6] +
        `</b></i></font></p></td>
        `

        for (let j = 0; j < 5; j++)
        {
            htmlTable += `<td>
            <p><font size="` + fontSize + `" color="` + colorEven + `">`
            + schedule[i][j] +
            `</font></p></td>
            `
        }

        + `</tr>`
    }
    
    htmlTable += `</tbody></table>

    <style>
        td{
            width = 15%
            height = 28
            vertical-align: top
        }

        p{
            text-align: center
        }

        #Group{
            text-align: left
        }

        body{
            font-family: "Arial"
        }
    </style>
    </body></html>`

    fs.writeFileSync("src\\34_from_DB.html", htmlTable)
}




