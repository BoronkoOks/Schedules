import * as fs from "fs"
import * as CS from "./ConvertSchedule"
import * as DBI from "./DBInteract"


async function runApp()
{
    // В этом файле прописать либо FromHTML, либо FromDB 
    const toDo = fs.readFileSync("src\\command.txt", "utf8")

    console.log(toDo)

    switch (toDo)
    {
        case "FromHTML": // HTML -> DB
        {
            const readHTML = CS.ReadFromHTMLFile()
            const new_schedule = await DBI.toObjArr(readHTML)
            DBI.insertIntoDB(new_schedule)
        } break

        case "FromDB": // DB -> HTML
        {
            const schedule = await DBI.readFromDB()
            CS.ConvertToTable(schedule)
        } break

        default: break
    }
}

runApp().catch(console.dir)

// ссылку в приложениях