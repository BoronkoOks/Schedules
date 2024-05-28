import * as fs from "fs"
import * as CS from "./ConvertSchedule"
import * as DBI from "./DBInteract"


async function runApp()
{
    const toDo = fs.readFileSync("src\\command.txt", "utf8")

    let command = "", group = ""

    if (toDo == "FromHTML")
    {
        command = toDo
    }
    else
    {
        command = toDo.slice(0, toDo.indexOf("\n"))
        group = toDo.slice(toDo.indexOf("\n") + 1).trim()
    }

    console.log(command)
    console.log(group)

    switch (command.trim())
    {
        case "FromHTML": // HTML -> DB
        {
            const readHTML = CS.ReadFromHTMLFile()
            const new_schedule = await DBI.toObjArr(readHTML)
            DBI.insertIntoDB(new_schedule, readHTML[12][0])
        } break

        case "FromDB": // DB -> HTML
        {
            if (group.length <= 3) // Расписание группы
            {
                const schedule = await DBI.readFromDB(group)
                CS.ConvertToTable(schedule, group.trim())
            }
            else // Расписание преподавателей
            {
                const schedule = await DBI.readTeacherSchedule(group.trim().toUpperCase())
                CS.ConvertToTable(schedule, group.trim().toUpperCase())
            }
        } break

        default: break
    }
}

runApp().catch(console.dir)
