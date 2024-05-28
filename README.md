Файлы в src:
+ command.txt - в нём прописывается команда, которая будет выполняться при запуске приложения;
+ Application.ts - главный файл, в котором считывается команда из command.txt и вызываются функции из других файлов;
+ ConvertSchedule.ts - отвечает за чтение/запись html-файла;
+ DBInteract.ts - отвечает за чтение/запись данных в БД;
+ schedule.html - файл, из которого считывается расписание;
+ schedule_fromDB.html - файл, в который записывается расписание из БД (создаётся при выполнении команды FromDB, необязательно иметь при запуске).


Компиляция и запуск:

tsc src\Application.ts</br>
node src\Application.js</br>


Варианты команд в command.txt:
+ FromHTML  (считать из html в БД)
+ FromDB    (записать из БД в html)</br>

Для выполнения FromDB во второй строке указать название группы либо фамилию И.О. преподавателя
