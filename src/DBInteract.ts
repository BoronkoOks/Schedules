import {Collection, MongoClient, ObjectId} from "mongodb"

const CONNECTION = "mongodb://localhost:27017/"
const DBName = "Schedules"

const client = new MongoClient(
    CONNECTION, 
    {
        monitorCommands: true
    }
)



// Преподаватели
class Teacher{
    _id: ObjectId = new ObjectId()

    constructor(
        public Name: string,
        public position?: string
    ) {}
}

// Пары
class Lesson{
    _id: ObjectId = new ObjectId()

    public lessonName: string = "-"
    public classroom?: string
    public teacherPos?: string
    public teacher?: string
    public teacherID?: ObjectId
    public lessonType?: string
    public subgroup?: number
    
    public lesson2Name?: string
    public classroom2?: string
    public teacher2Pos?: string
    public teacher2?: string
    public teacher2ID?: ObjectId
    public subgroup2?: number

    constructor(){}
}

// Само расписание
class Schedule{
    _id: ObjectId = new ObjectId()

    constructor(
        public week: string,
        public weekDay: string,
        public lessons: Array<Lesson> = []
    )
    {}
}



// Найти либо добавить преподавателя
async function FindOrInsertTeacher(name: string, position: string)
{
    let teacher: Teacher = new Teacher(name, position)

    try
    {
        await client.connect()

        const db = client.db(DBName)
        const teachers_db = db.collection("Teachers") as Collection<Teacher>

        const teachersDB_list = await teachers_db.find({Name: name}).toArray()


        if (teachersDB_list.length > 0) // преподаватель уже есть в базе
        {
            teacher = teachersDB_list[0] as Teacher // заменить данные объекта на данные из базы
        }
        else // нет - добавить
        {
            await teachers_db.insertOne(teacher)
        }
    }
    finally
    {
        await client.close()
    }

    return teacher
}


// Индекс первого упоминания аудитории
function IndexOf_a (dataString: string)
{
    // варианты записи (могут встретиться оба в одной строке)
    let ind = dataString.indexOf(" а.")
    let ind_ = dataString.indexOf(" - а.")

    if (ind_ != -1 && ind_ < ind) // сравнить, что встречается раньше
    {
        ind = ind_
    }

    return ind
}


// Разбиение информации string на поля класса Lesson
async function stringToLesson (lesson_str: string)
{
    const lessonTypes = ["лек.", "пр.кср.", "пр.", "лаб."]
    const positions = ["ст.пр.", "доц."]

    lesson_str = lesson_str.trim()
    let toWrite = lesson_str != ""? lesson_str : "_"

    const db = client.db(DBName)
    const teachers_db = db.collection("Teachers") as Collection<Teacher>

    const lesson = new Lesson()

    
    if (toWrite != "_")
    {
        // тип занятия
        for (let k = 0; k < lessonTypes.length; k++)
        {
            if (toWrite.indexOf(lessonTypes[k]) > -1)
            {
                lesson.lessonType = lessonTypes[k]
                toWrite = toWrite.replace(lessonTypes[k], "")

                break
            }
        }


        // Должности и преподаватели

        // отдельно проверить ГПД

        let startPos = toWrite.indexOf("ГПД")

        if (startPos > -1)
        {
            let toWrite_teacher = toWrite.slice(0, startPos-1)
            let end = toWrite_teacher.lastIndexOf(" ") // последний пробел (а нужен предпоследний)

            toWrite_teacher = toWrite_teacher.slice(0, end)
            end = toWrite_teacher.lastIndexOf(" ") // предпоследний пробел

            let name = toWrite.slice(end+1, startPos-1)

            const teacher = await FindOrInsertTeacher(name, "ГПД") // записать преподавателя

            lesson.teacherID = teacher._id
            lesson.teacherPos = teacher.position
            lesson.teacher = teacher.Name

            toWrite = toWrite.replace(lesson.teacher + " " + lesson.teacherPos, "").trim()
        }
        else // не ГПД
        {
            for (let k = 0; k < positions.length; k++)
            {
                startPos = toWrite.indexOf(positions[k])

                if (startPos > -1)
                {
                    const end = IndexOf_a(toWrite) // найти упоминание аудитории

                    const name = toWrite.slice(startPos + positions[k].length, end).trim()
                    const teacher = await FindOrInsertTeacher(name, positions[k]) // записать преподавателя

                    lesson.teacherID = teacher._id
                    lesson.teacherPos = teacher.position
                    lesson.teacher = teacher.Name
                    
                    toWrite = toWrite.replace(positions[k] + " " + name, "").trim()

                    break
                }
            }
        }
        
        
        // Подгруппы

        const sg_1 = toWrite.indexOf("- 1 п/г")
        const sg_2 = toWrite.indexOf("- 2 п/г")

        if (sg_1 > -1 && sg_2 > -1) // если занятия у обеих подгрупп
        { // сначала записать ту, которая упоминается раньше
            if (sg_1 < sg_2)
            {
                lesson.subgroup = 1
                toWrite = toWrite.replace("- 1 п/г", "")
            }
            else
            {
                lesson.subgroup = 2
                toWrite = toWrite.replace("- 2 п/г", "")
            }
        }
        else // не более одной подгруппы
        {
            if (sg_1 > -1)
            {
                lesson.subgroup = 1
                toWrite = toWrite.replace("- 1 п/г", "")
            }
            else
            {
                if (sg_2 > -1)
                {
                    lesson.subgroup = 2
                    toWrite = toWrite.replace("- 2 п/г", "")
                }
            }
        }
        
        // Название занятия

        let end = toWrite.indexOf(" а.")
        let end_ = toWrite.indexOf(" - а.")

        if (end_ != -1 && end_ < end)
        {
            end = end_

            lesson.lessonName = toWrite.slice(0, end)
            toWrite = toWrite.replace(lesson.lessonName + " - а.", "").trim()
        }
        else
        {
            lesson.lessonName = toWrite.slice(0, end)
            toWrite = toWrite.replace(lesson.lessonName + " а.", "").trim()
        }

        lesson.lessonName = lesson.lessonName.trim()


        // Проверить, есть ли ещё одна подгруппа в это же время

        startPos = -1

        for (let k = 0; k < positions.length; k++)
        {
            if (toWrite.indexOf(positions[k]) > -1)
            {
                startPos = toWrite.indexOf(positions[k])

                break
            }
        }

        if (startPos == -1) // на этом всё
        {
            lesson.classroom = toWrite // записать кабинет
        }
        else // извлечь информацию о втором занятии, проводимом в это же время
        {
            end = toWrite.indexOf(" ")
            lesson.classroom = toWrite.slice(0, end)

            toWrite = toWrite.replace(lesson.classroom, "").trim()


            // Должности и преподаватели

            // ГПД

            startPos = toWrite.indexOf("ГПД")

            if (startPos > -1)
            {
                let toWrite_teacher = toWrite.slice(0, startPos-1)
                let end = toWrite_teacher.lastIndexOf(" ") // последний пробел (а нужен предпоследний)

                toWrite_teacher = toWrite_teacher.slice(0, end)
                end = toWrite_teacher.lastIndexOf(" ") // предпоследний пробел

                let name = toWrite.slice(end+1, startPos-1)

                const teacher = await FindOrInsertTeacher(name, "ГПД") // записать преподавателя

                lesson.teacher2ID = teacher._id
                lesson.teacher2Pos = teacher.position
                lesson.teacher2 = teacher.Name

                toWrite = toWrite.replace(lesson.teacher2 + " " + lesson.teacher2Pos, "").trim()
            }
            else // не ГПД
            {
                for (let k = 0; k < positions.length; k++)
                {
                    startPos = toWrite.indexOf(positions[k])

                    if (startPos > -1)
                    {
                        const end = IndexOf_a(toWrite) // найти упоминание аудитории

                        const name = toWrite.slice(startPos + positions[k].length, end).trim()
                        const teacher = await FindOrInsertTeacher(name, positions[k]) // записать преподавателя

                        lesson.teacher2ID = teacher._id
                        lesson.teacher2Pos = teacher.position
                        lesson.teacher2 = teacher.Name
                        
                        toWrite = toWrite.replace(positions[k] + " " + name, "").trim()

                        break
                    }
                }
            }


            // Подгруппы

            if (toWrite.indexOf("- 1 п/г") > -1)
            {
                lesson.subgroup2 = 1
                toWrite = toWrite.replace("- 1 п/г", "")
            }
            else
            {
                if (toWrite.indexOf("- 2 п/г") > -1)
                {
                    lesson.subgroup2 = 2
                    toWrite = toWrite.replace("- 2 п/г", "")
                }
            }
        

            // Название занятия
    
            end = toWrite.indexOf(" а.")
            end_ = toWrite.indexOf(" - а.")
    
            if (end_ != -1 && end_ < end)
            {
                lesson.lesson2Name = toWrite.slice(0, end_)
                toWrite = toWrite.replace(lesson.lesson2Name + " - а.", "").trim()
            }
            else
            {
                lesson.lesson2Name = toWrite.slice(0, end)
                toWrite = toWrite.replace(lesson.lesson2Name + " а.", "").trim()
            }
    
            lesson.lesson2Name = lesson.lesson2Name.trim()
            lesson.classroom2 = toWrite.trim()
        }
    }

    return lesson
}


// Из массива строк в массив объектов типа Schedule
export async function toObjArr(HTMLdata: string[][])
{
    const weekDays = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"]
    
    let days: Schedule[] = []


    for (let i = 0; i < 6; i++)
    {
        let lessons: Lesson[] = []

        for (let j = 0; j < 5; j++)
        {
            lessons.push(await stringToLesson(HTMLdata[i][j]))
        }
        
        days.push(new Schedule("Нечетная", weekDays[i], lessons))
    }

    for (let i = 6; i < 12; i++)
    {
        let lessons: Lesson[] = []

        for (let j = 0; j < 5; j++)
        {
            lessons.push(await stringToLesson(HTMLdata[i][j]))
        }
        
        days.push(new Schedule("Четная", weekDays[i-6], lessons))

    }
    
    return days
}


// Обновление данных в базе
export async function insertIntoDB(newSchedule: Schedule[])
{
    try
    {
        await client.connect()
        const db = client.db(DBName)

        const schedule_db = db.collection("Schedule_22z") as Collection<Schedule>
        schedule_db.drop()

        await schedule_db.insertMany(newSchedule)
    }
    finally
    {
        await client.close();
    }
}


// Считать расписание из базы и конвертировать его в строковый массив
export async function readFromDB()
{
    let schedule_strArr: string[][] = [[], [], [], [], [], [], [], [], [], [], [], []]

    try
    {
        await client.connect()
        const db = client.db(DBName)

        const schedule_db = db.collection("Schedule_22z") as Collection<Schedule>

        const schedule: Schedule[] = await schedule_db.find().toArray()

        for (let i = 0; i < 12; i++)
        {
            for(let j = 0; j < schedule[i].lessons.length; j++)
            {
                const lesson: Lesson | undefined = schedule[i].lessons[j]

                let toWrite = ""

                if (lesson.lessonName.length > 1)
                {
                    if (lesson.lessonType != undefined)
                    {
                        toWrite += lesson.lessonType
                    }

                    toWrite += lesson.lessonName
                    
                    if (lesson.teacherPos?.length > 0)
                    {
                        toWrite += " " + lesson.teacherPos
                    }

                    if (lesson.teacher?.length > 0)
                    {
                        toWrite += " " + lesson.teacher
                    }

                    if (lesson.subgroup != undefined)
                    {
                        toWrite += "- " + lesson.subgroup.toString() + "п/г "
                    }

                    toWrite += " а." + lesson.classroom

                    if (lesson.lesson2Name != undefined)
                    {
                        if (lesson.lesson2Name != "-")
                        {
                            toWrite += " " + lesson.lesson2Name
                        }
                        
                        if (lesson.teacher2Pos?.length > 0)
                        {
                            toWrite += " " + lesson.teacherPos
                        }

                        if (lesson.teacher2?.length > 0)
                        {
                            toWrite += " " + lesson.teacher2
                        }

                        if (lesson.subgroup2 != undefined)
                        {
                            toWrite += "- " + lesson.subgroup.toString() + "п/г "
                        }

                        toWrite += " а." + lesson.classroom2
                    }
                }
                else
                {
                    toWrite = "-"
                }

                schedule_strArr[i][j] = toWrite
            }
        }
    }
    finally
    {
        await client.close();
    }

    return schedule_strArr
}
