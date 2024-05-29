"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTeacherSchedule = exports.readFromDB = exports.insertIntoDB = exports.toObjArr = void 0;
var mongodb_1 = require("mongodb");
var CONNECTION = "mongodb://localhost:27017/";
var DBName = "Schedules";
var client = new mongodb_1.MongoClient(CONNECTION, {
    monitorCommands: true
});
// Преподаватели
var Teacher = /** @class */ (function () {
    function Teacher(Name, position) {
        this.Name = Name;
        this.position = position;
        this._id = new mongodb_1.ObjectId();
    }
    return Teacher;
}());
// Пары
var Lesson = /** @class */ (function () {
    function Lesson() {
        this._id = new mongodb_1.ObjectId();
        this.lessonName = "-";
        this.lessonNumber = 1;
    }
    return Lesson;
}());
// Само расписание
var Schedule = /** @class */ (function () {
    function Schedule(week, weekDay, group, lessons) {
        if (lessons === void 0) { lessons = []; }
        this.week = week;
        this.weekDay = weekDay;
        this.group = group;
        this.lessons = lessons;
        this._id = new mongodb_1.ObjectId();
    }
    return Schedule;
}());
// Найти либо добавить преподавателя
function FindOrInsertTeacher(name, position) {
    return __awaiter(this, void 0, void 0, function () {
        var teacher, db, teachers_db, teachersDB_list;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teacher = new Teacher(name, position);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 7, 9]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    db = client.db(DBName);
                    teachers_db = db.collection("Teachers");
                    return [4 /*yield*/, teachers_db.find({ Name: name }).toArray()];
                case 3:
                    teachersDB_list = _a.sent();
                    if (!(teachersDB_list.length > 0)) return [3 /*break*/, 4];
                    teacher = teachersDB_list[0]; // заменить данные объекта на данные из базы
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, teachers_db.insertOne(teacher)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, client.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/, teacher];
            }
        });
    });
}
// Индекс первого упоминания аудитории
function IndexOf_a(dataString) {
    // варианты записи (могут встретиться оба в одной строке)
    var ind = dataString.indexOf(" а.");
    var ind_ = dataString.indexOf(" - а.");
    if (ind_ != -1 && ind_ < ind) // сравнить, что встречается раньше
     {
        ind = ind_;
    }
    return ind;
}
// Разбиение информации string на поля класса Lesson
function stringToLesson(lesson_str, lesson_number) {
    return __awaiter(this, void 0, void 0, function () {
        var lessonTypes, positions, toWrite, db, teachers_db, lesson, k, startPos, toWrite_teacher, end_1, name_1, teacher, k, end_2, name_2, teacher, sg_1, sg_2, end, end_, k, toWrite_teacher, end_3, name_3, teacher, k, end_4, name_4, teacher;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lessonTypes = ["лек.", "пр.кср.", "пр.", "лаб."];
                    positions = ["ст.пр.", "доц."];
                    lesson_str = lesson_str.trim();
                    toWrite = lesson_str != "" ? lesson_str : "_";
                    db = client.db(DBName);
                    teachers_db = db.collection("Teachers");
                    lesson = new Lesson();
                    lesson.lessonNumber = lesson_number;
                    if (!(toWrite != "_" && toWrite != "-")) return [3 /*break*/, 14];
                    // тип занятия
                    for (k = 0; k < lessonTypes.length; k++) {
                        if (toWrite.indexOf(lessonTypes[k]) > -1) {
                            lesson.lessonType = lessonTypes[k];
                            toWrite = toWrite.replace(lessonTypes[k], "");
                            break;
                        }
                    }
                    startPos = toWrite.indexOf("ГПД");
                    if (!(startPos > -1)) return [3 /*break*/, 2];
                    toWrite_teacher = toWrite.slice(0, startPos - 1);
                    end_1 = toWrite_teacher.lastIndexOf(" ") // последний пробел (а нужен предпоследний)
                    ;
                    toWrite_teacher = toWrite_teacher.slice(0, end_1);
                    end_1 = toWrite_teacher.lastIndexOf(" "); // предпоследний пробел
                    name_1 = toWrite.slice(end_1 + 1, startPos - 1);
                    return [4 /*yield*/, FindOrInsertTeacher(name_1, "ГПД")]; // записать преподавателя
                case 1:
                    teacher = _a.sent() // записать преподавателя
                    ;
                    lesson.teacherID = teacher._id;
                    lesson.teacherPos = teacher.position;
                    lesson.teacher = teacher.Name;
                    toWrite = toWrite.replace(lesson.teacher + " " + lesson.teacherPos, "").trim();
                    return [3 /*break*/, 6];
                case 2:
                    k = 0;
                    _a.label = 3;
                case 3:
                    if (!(k < positions.length)) return [3 /*break*/, 6];
                    startPos = toWrite.indexOf(positions[k]);
                    if (!(startPos > -1)) return [3 /*break*/, 5];
                    end_2 = IndexOf_a(toWrite) // найти упоминание аудитории
                    ;
                    name_2 = toWrite.slice(startPos + positions[k].length, end_2).trim();
                    return [4 /*yield*/, FindOrInsertTeacher(name_2, positions[k])]; // записать преподавателя
                case 4:
                    teacher = _a.sent() // записать преподавателя
                    ;
                    lesson.teacherID = teacher._id;
                    lesson.teacherPos = teacher.position;
                    lesson.teacher = teacher.Name;
                    toWrite = toWrite.replace(positions[k] + " " + name_2, "").trim();
                    return [3 /*break*/, 6];
                case 5:
                    k++;
                    return [3 /*break*/, 3];
                case 6:
                    sg_1 = toWrite.indexOf("- 1 п/г");
                    sg_2 = toWrite.indexOf("- 2 п/г");
                    if (sg_1 > -1 && sg_2 > -1) // если занятия у обеих подгрупп
                     { // сначала записать ту, которая упоминается раньше
                        if (sg_1 < sg_2) {
                            lesson.subgroup = 1;
                            toWrite = toWrite.replace("- 1 п/г", "");
                        }
                        else {
                            lesson.subgroup = 2;
                            toWrite = toWrite.replace("- 2 п/г", "");
                        }
                    }
                    else // не более одной подгруппы
                     {
                        if (sg_1 > -1) {
                            lesson.subgroup = 1;
                            toWrite = toWrite.replace("- 1 п/г", "");
                        }
                        else {
                            if (sg_2 > -1) {
                                lesson.subgroup = 2;
                                toWrite = toWrite.replace("- 2 п/г", "");
                            }
                        }
                    }
                    end = toWrite.indexOf(" а.");
                    end_ = toWrite.indexOf(" - а.");
                    if (end_ != -1 && end_ < end) {
                        end = end_;
                        lesson.lessonName = toWrite.slice(0, end);
                        toWrite = toWrite.replace(lesson.lessonName + " - а.", "").trim();
                    }
                    else {
                        lesson.lessonName = toWrite.slice(0, end);
                        toWrite = toWrite.replace(lesson.lessonName + " а.", "").trim();
                    }
                    lesson.lessonName = lesson.lessonName.trim();
                    // Проверить, есть ли ещё одна подгруппа в это же время
                    startPos = -1;
                    for (k = 0; k < positions.length; k++) {
                        if (toWrite.indexOf(positions[k]) > -1) {
                            startPos = toWrite.indexOf(positions[k]);
                            break;
                        }
                    }
                    if (!(startPos == -1)) return [3 /*break*/, 7];
                    lesson.classroom = toWrite; // записать кабинет
                    return [3 /*break*/, 14];
                case 7:
                    end = toWrite.indexOf(" ");
                    lesson.classroom = toWrite.slice(0, end);
                    toWrite = toWrite.replace(lesson.classroom, "").trim();
                    // Должности и преподаватели
                    // ГПД
                    startPos = toWrite.indexOf("ГПД");
                    if (!(startPos > -1)) return [3 /*break*/, 9];
                    toWrite_teacher = toWrite.slice(0, startPos - 1);
                    end_3 = toWrite_teacher.lastIndexOf(" ") // последний пробел (а нужен предпоследний)
                    ;
                    toWrite_teacher = toWrite_teacher.slice(0, end_3);
                    end_3 = toWrite_teacher.lastIndexOf(" "); // предпоследний пробел
                    name_3 = toWrite.slice(end_3 + 1, startPos - 1);
                    return [4 /*yield*/, FindOrInsertTeacher(name_3, "ГПД")]; // записать преподавателя
                case 8:
                    teacher = _a.sent() // записать преподавателя
                    ;
                    lesson.teacher2ID = teacher._id;
                    lesson.teacher2Pos = teacher.position;
                    lesson.teacher2 = teacher.Name;
                    toWrite = toWrite.replace(lesson.teacher2 + " " + lesson.teacher2Pos, "").trim();
                    return [3 /*break*/, 13];
                case 9:
                    k = 0;
                    _a.label = 10;
                case 10:
                    if (!(k < positions.length)) return [3 /*break*/, 13];
                    startPos = toWrite.indexOf(positions[k]);
                    if (!(startPos > -1)) return [3 /*break*/, 12];
                    end_4 = IndexOf_a(toWrite) // найти упоминание аудитории
                    ;
                    name_4 = toWrite.slice(startPos + positions[k].length, end_4).trim();
                    return [4 /*yield*/, FindOrInsertTeacher(name_4, positions[k])]; // записать преподавателя
                case 11:
                    teacher = _a.sent() // записать преподавателя
                    ;
                    lesson.teacher2ID = teacher._id;
                    lesson.teacher2Pos = teacher.position;
                    lesson.teacher2 = teacher.Name;
                    toWrite = toWrite.replace(positions[k] + " " + name_4, "").trim();
                    return [3 /*break*/, 13];
                case 12:
                    k++;
                    return [3 /*break*/, 10];
                case 13:
                    // Подгруппы
                    if (toWrite.indexOf("- 1 п/г") > -1) {
                        lesson.subgroup2 = 1;
                        toWrite = toWrite.replace("- 1 п/г", "");
                    }
                    else {
                        if (toWrite.indexOf("- 2 п/г") > -1) {
                            lesson.subgroup2 = 2;
                            toWrite = toWrite.replace("- 2 п/г", "");
                        }
                    }
                    // Название занятия
                    end = toWrite.indexOf(" а.");
                    end_ = toWrite.indexOf(" - а.");
                    if (end_ != -1 && end_ < end) {
                        lesson.lesson2Name = toWrite.slice(0, end_);
                        toWrite = toWrite.replace(lesson.lesson2Name + " - а.", "").trim();
                    }
                    else {
                        lesson.lesson2Name = toWrite.slice(0, end);
                        toWrite = toWrite.replace(lesson.lesson2Name + " а.", "").trim();
                    }
                    lesson.lesson2Name = lesson.lesson2Name.trim();
                    lesson.classroom2 = toWrite.trim();
                    _a.label = 14;
                case 14: return [2 /*return*/, lesson];
            }
        });
    });
}
// Из массива строк в массив объектов типа Schedule
function toObjArr(HTMLdata) {
    return __awaiter(this, void 0, void 0, function () {
        var weekDays, days, i, lessons, j, _a, _b, i, lessons, j, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    weekDays = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"];
                    days = [];
                    i = 0;
                    _e.label = 1;
                case 1:
                    if (!(i < 6)) return [3 /*break*/, 7];
                    lessons = [];
                    j = 0;
                    _e.label = 2;
                case 2:
                    if (!(j < 5)) return [3 /*break*/, 5];
                    _b = (_a = lessons).push;
                    return [4 /*yield*/, stringToLesson(HTMLdata[i][j], j + 1)];
                case 3:
                    _b.apply(_a, [_e.sent()]);
                    _e.label = 4;
                case 4:
                    j++;
                    return [3 /*break*/, 2];
                case 5:
                    days.push(new Schedule("Нечетная", weekDays[i], HTMLdata[12][0], lessons));
                    _e.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7:
                    i = 6;
                    _e.label = 8;
                case 8:
                    if (!(i < 12)) return [3 /*break*/, 14];
                    lessons = [];
                    j = 0;
                    _e.label = 9;
                case 9:
                    if (!(j < 5)) return [3 /*break*/, 12];
                    _d = (_c = lessons).push;
                    return [4 /*yield*/, stringToLesson(HTMLdata[i][j], j + 1)];
                case 10:
                    _d.apply(_c, [_e.sent()]);
                    _e.label = 11;
                case 11:
                    j++;
                    return [3 /*break*/, 9];
                case 12:
                    days.push(new Schedule("Четная", weekDays[i - 6], HTMLdata[12][0], lessons));
                    _e.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 8];
                case 14: return [2 /*return*/, days];
            }
        });
    });
}
exports.toObjArr = toObjArr;
// Обновление данных в базе
function insertIntoDB(newSchedule, group) {
    return __awaiter(this, void 0, void 0, function () {
        var db, schedule_db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 4, 6]);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db(DBName);
                    schedule_db = db.collection("Schedule");
                    return [4 /*yield*/, schedule_db.deleteMany({ group: group })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, schedule_db.insertMany(newSchedule)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, client.close()];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.insertIntoDB = insertIntoDB;
// Считать расписание из базы и конвертировать его в строковый массив
function readFromDB(group) {
    return __awaiter(this, void 0, void 0, function () {
        var schedule_strArr, db, schedule_db, schedule, i, j, lesson, toWrite;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    schedule_strArr = [[], [], [], [], [], [], [], [], [], [], [], []];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, , 4, 6]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _e.sent();
                    db = client.db(DBName);
                    schedule_db = db.collection("Schedule");
                    return [4 /*yield*/, schedule_db.find({ group: group }).toArray()];
                case 3:
                    schedule = _e.sent();
                    for (i = 0; i < 12; i++) {
                        for (j = 0; j < schedule[i].lessons.length; j++) {
                            lesson = schedule[i].lessons[j];
                            toWrite = "";
                            if (lesson.lessonName.length > 1) {
                                if (lesson.lessonType != undefined) {
                                    toWrite += lesson.lessonType;
                                }
                                toWrite += lesson.lessonName;
                                if (((_a = lesson.teacherPos) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                                    toWrite += " " + lesson.teacherPos;
                                }
                                if (((_b = lesson.teacher) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                                    toWrite += " " + lesson.teacher;
                                }
                                if (lesson.subgroup != undefined) {
                                    toWrite += "- " + lesson.subgroup.toString() + "п/г ";
                                }
                                toWrite += " а." + lesson.classroom;
                                if (lesson.lesson2Name != undefined) {
                                    if (lesson.lesson2Name != "-") {
                                        toWrite += " " + lesson.lesson2Name;
                                    }
                                    if (((_c = lesson.teacher2Pos) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                                        toWrite += " " + lesson.teacherPos;
                                    }
                                    if (((_d = lesson.teacher2) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                                        toWrite += " " + lesson.teacher2;
                                    }
                                    if (lesson.subgroup2 != undefined) {
                                        toWrite += "- " + lesson.subgroup.toString() + "п/г ";
                                    }
                                    toWrite += " а." + lesson.classroom2;
                                }
                            }
                            else {
                                toWrite = "-";
                            }
                            schedule_strArr[i][j] = toWrite;
                        }
                    }
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, client.close()];
                case 5:
                    _e.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/, schedule_strArr];
            }
        });
    });
}
exports.readFromDB = readFromDB;
// Разбить на строковый массив пары одного дня (для преподавателей)
function lessonsForDay(schedules, teacher) {
    var lessons = ["-", "-", "-", "-", "-"];
    var j = 0;
    for (var k = 0; k < schedules.length; k++) {
        var lesson = schedules[k].lessons;
        var toWrite = "";
        while (lesson.lessonNumber > j + 1) // пропустить пустые позиции
         {
            j++;
        }
        if (lesson.lessonType != undefined) {
            toWrite += lesson.lessonType;
        }
        if (lesson.teacher == teacher) {
            toWrite += lesson.lessonName + " " + schedules[k].group; // пара и группа
            if (lesson.lessonType == "лек.") // сразу записать другие группы, если это лекция
             {
                var next = 1;
                while (k + next < schedules.length) {
                    var lessonNext = schedules[k + next].lessons;
                    if (lessonNext.lessonType == "лек." &&
                        lesson.lessonNumber == lessonNext.lessonNumber) {
                        toWrite += "+" + schedules[k + next].group;
                        next++;
                    }
                }
                k += next;
            }
            if (lesson.subgroup != undefined) // записать подгруппу
             {
                toWrite += "- " + lesson.subgroup.toString() + "п/г ";
            }
            toWrite += " а." + lesson.classroom;
        }
        else {
            if (lesson.lesson2Name != undefined) {
                toWrite += " " + lesson.lesson2Name + " " + schedules[k].group; // пара и группа
                if (lesson.subgroup2 != undefined) // записать подгруппу
                 {
                    toWrite += "- " + lesson.subgroup.toString() + " п/г ";
                }
                toWrite += " а." + lesson.classroom2;
            }
        }
        lessons[j] = toWrite;
        j++;
    }
    return lessons;
}
// Считать расписание из базы и конвертировать его в строковый массив (для преподавателя)
function readTeacherSchedule(teacher) {
    return __awaiter(this, void 0, void 0, function () {
        var weekDays, schedule_strArr, db, schedules_db, teachers_db, teacherID, i, schedules, i, schedules;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    weekDays = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"];
                    schedule_strArr = [[], [], [], [], [], [], [], [], [], [], [], []];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 13, 15]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    db = client.db(DBName);
                    schedules_db = db.collection("Schedule");
                    return [4 /*yield*/, db.collection("Teachers")];
                case 3:
                    teachers_db = _a.sent();
                    return [4 /*yield*/, teachers_db.find({ Name: teacher }).toArray()];
                case 4:
                    teacherID = _a.sent();
                    if (!(teacherID.length > 0)) return [3 /*break*/, 12];
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < 6)) return [3 /*break*/, 8];
                    return [4 /*yield*/, schedules_db.aggregate([
                            { $unwind: "$lessons" },
                            { $match: { $and: [{ week: "Нечетная" }, { weekDay: weekDays[i] },
                                        { $or: [{ "lessons.teacher": teacher }, { "lessons.teacher2": teacher }] }] } },
                            { $sort: {
                                    "lessons.lessonNumber": 1,
                                    group: 1
                                } }
                        ]).toArray()];
                case 6:
                    schedules = _a.sent();
                    schedule_strArr[i] = lessonsForDay(schedules, teacher);
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    i = 6;
                    _a.label = 9;
                case 9:
                    if (!(i < 12)) return [3 /*break*/, 12];
                    return [4 /*yield*/, schedules_db.aggregate([
                            { $unwind: "$lessons" },
                            { $match: { $and: [{ week: "Четная" }, { weekDay: weekDays[i - 6] },
                                        { $or: [{ "lessons.teacher": teacher }, { "lessons.teacher2": teacher }] }] } },
                            { $sort: {
                                    "lessons.lessonNumber": 1,
                                    group: 1
                                } }
                        ]).toArray()];
                case 10:
                    schedules = _a.sent();
                    schedule_strArr[i] = lessonsForDay(schedules, teacher);
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12: return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, client.close()];
                case 14:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/, schedule_strArr];
            }
        });
    });
}
exports.readTeacherSchedule = readTeacherSchedule;
