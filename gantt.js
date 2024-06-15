const Chart = require('cli-chart');

class Task {
    constructor(id, duration, dependencies = []) {
        this.id = id;  
        this.duration = duration;  
        this.dependencies = dependencies;  
        this.earliestStart = 0;  
        this.latestStart = 0;  
    }
}

function calculateSchedule(tasks) {
  
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id, task));

   
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

    tasks.forEach(task => calculateEarliestStart(task));

    const projectCompletionTime = Math.max(...tasks.map(task => task.earliestStart + task.duration));

  
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


    tasks.forEach(task => calculateLatestStart(task));

 
    tasks.forEach(task => {
        task.reserve = task.latestStart - task.earliestStart;
    });

    return tasks;
}

function readInput(input) {

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
