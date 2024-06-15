const Chart = require('cli-chart');

class Task {
    constructor(id, duration, dependencies = []) {
        this.id = id;  // Унікальний ідентифікатор задачі
        this.duration = duration;  // Тривалість виконання задачі
        this.dependencies = dependencies;  // Список ідентифікаторів задач, від яких залежить дана задача
        this.earliestStart = 0;  // Найраніший старт (обчислюється)
        this.latestStart = 0;  // Найпізніший старт (обчислюється)
    }
}

function calculateSchedule(tasks) {
    // Побудова графу задач
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Функція для обчислення найранішого старту задач
    function calculateEarliestStart(task) {
        if (task.earliestStart !== 0) return task.earliestStart;
        let earliest = 0;
        for (let dep of task.dependencies) {
            const depTask = taskMap.get(dep);
            earliest = Math.max(earliest, calculateEarliestStart(depTask) + depTask.duration);
        }
        task.earliestStart = earliest;
        return earliest;
    }

    // Обчислення найранішого старту для всіх задач
    tasks.forEach(task => calculateEarliestStart(task));

    // Визначення максимального часу завершення проекту
    const projectCompletionTime = Math.max(...tasks.map(task => task.earliestStart + task.duration));

    // Функція для обчислення найпізнішого старту задач
    function calculateLatestStart(task) {
        if (task.latestStart !== 0) return task.latestStart;
        if (task.dependencies.length === 0) {
            task.latestStart = projectCompletionTime - task.duration;
        } else {
            let latest = projectCompletionTime;
            for (let dep of task.dependencies) {
                const depTask = taskMap.get(dep);
                latest = Math.min(latest, calculateLatestStart(depTask) - task.duration);
            }
            task.latestStart = latest;
        }
        return task.latestStart;
    }

    // Обчислення найпізнішого старту для всіх задач
    tasks.forEach(task => calculateLatestStart(task));

    // Обчислення резерву часу для всіх задач
    tasks.forEach(task => {
        task.reserve = task.latestStart - task.earliestStart;
    });

    return tasks;
}

function readInput(input) {
    // Парсинг JSON-даних про задачі
    return input.map(data => new Task(data.id, data.duration, data.dependencies));
}

function displaySchedule(tasks) {
    tasks.forEach(task => {
        console.log(`Task ${task.id}: Earliest Start = ${task.earliestStart}, Latest Start = ${task.latestStart}, Reserve = ${task.reserve}`);
    });
}

function renderGanttChart(tasks) {
    const chart = new Chart({
        xlabel: 'Time',
        ylabel: 'Tasks',
        width: 60,
        height: tasks.length + 2,
        direction: 'right',
        lmargin: 15,
        step: 1
    });

    tasks.forEach(task => {
        const label = `Task ${task.id}`;
        const start = task.earliestStart;
        const end = task.earliestStart + task.duration;
        chart.addBar(end - start, label);
    });

    console.log(chart.toString());
}

const input = [
    {id: 1, duration: 4, dependencies: []},
    {id: 2, duration: 2, dependencies: [1]},
    {id: 3, duration: 1, dependencies: [1]},
    {id: 4, duration: 3, dependencies: [2, 3]}
];

console.log("Reading input...");
const tasks = readInput(input);
console.log("Calculating schedule...");
const scheduledTasks = calculateSchedule(tasks);
console.log("Displaying schedule...");
displaySchedule(scheduledTasks);
console.log("Rendering Gantt chart...");
renderGanttChart(scheduledTasks);
console.log("Done.");
