$(document).ready(function () {
  let timer1, timer2;
  let startTime1, startTime2;
  let elapsedTime1 = 0, elapsedTime2 = 0;
  let isRunning1 = false, isRunning2 = false;



  function updateTimerDisplay(timerId, elapsedTime) {
    const time = new Date(elapsedTime);
    const hours = String(time.getUTCHours()).padStart(2, '0');
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(time.getUTCSeconds()).padStart(2, '0');
    $(`#${timerId}`).text(`${hours}:${minutes}:${seconds}`);
  }

  function convertToHoursMinutesSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function startTimer1() {
    if (!isRunning1) {
      startTime1 = Date.now() - elapsedTime1;
      timer1 = setInterval(() => {
        elapsedTime1 = Date.now() - startTime1;
        updateTimerDisplay('timerDisplay1', elapsedTime1);
      }, 1000);
      isRunning1 = true;
    }
    if (isRunning2) {
      pauseTimer2();
    }
  }

  function startTimer2() {
    if (!isRunning2) {
      startTime2 = Date.now() - elapsedTime2;
      timer2 = setInterval(() => {
        elapsedTime2 = Date.now() - startTime2;
        updateTimerDisplay('timerDisplay2', elapsedTime2);
      }, 1000);
      isRunning2 = true;
    }
    if (isRunning1) {
      pauseTimer1();
    }
  }

  function pauseTimer1() {
    if (isRunning1) {
      clearInterval(timer1);
      isRunning1 = false;
    }
  }

  function pauseTimer2() {
    if (isRunning2) {
      clearInterval(timer2);
      isRunning2 = false;
    }
  }

  function pauseBothTimers() {
    pauseTimer1();
    pauseTimer2();
  }

  function appendTaskToTable(task) {
    const timeSpentFormatted = convertToHoursMinutesSeconds(task.timeSpent);
    const row = `
      <tr>
        <td>${task.taskName}</td>
        <td>${timeSpentFormatted}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-task">Delete</button>
        </td>
      </tr>
    `;

    if (task.type === "Gaming Session") {
      $("#gamingTableBody").append(row);
    } else if (task.type === "Study Session") {
      $("#studyTableBody").append(row);
    }

    $(".delete-task").off("click").on("click", function () {
      const row = $(this).closest("tr");
      const taskName = row.find("td:first").text();
      const timeSpentFormatted = row.find("td:nth-child(2)").text();
      const tableId = row.closest("tbody").attr("id");
      const type = tableId === "gamingTableBody" ? "Gaming Session" : "Study Session";

      const [hours, minutes, seconds] = timeSpentFormatted
        .replace(/[hms]/g, "")
        .trim()
        .split(" ")
        .map(Number);
      const timeSpent = hours * 3600 + minutes * 60 + seconds;

      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks = tasks.filter(task => {
        return !(
          task.taskName === taskName &&
          task.timeSpent === timeSpent &&
          task.type === type
        );
      });
      localStorage.setItem("tasks", JSON.stringify(tasks));

      row.remove();

      if ($("#gamingTableBody").children().length === 0) {
        $("#gamingTableBody").append("<tr><td colspan='3'>No gaming sessions to display.</td></tr>");
      }
      if ($("#studyTableBody").children().length === 0) {
        $("#studyTableBody").append("<tr><td colspan='3'>No study sessions to display.</td></tr>");
      }
    });
  }


  function saveGameTime() {
    const gameTime = elapsedTime1 / 1000;

    if (gameTime > 0) {
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const newTask = {
        taskName: "Game Time",
        timeSpent: gameTime,
        type: "Gaming Session",
        date: normalizeDate(new Date()),
      };

      const taskExists = tasks.some(task =>
        task.taskName === newTask.taskName &&
        task.timeSpent === newTask.timeSpent &&
        task.type === newTask.type &&
        task.date === newTask.date
      );

      if (!taskExists) {
        tasks.push(newTask);
      }

      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderTasks(tasks);


    }
  }

  function saveStudyTime() {
    const studyTime = elapsedTime2 / 1000;

    if (studyTime > 0) {
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const newTask = {
        taskName: "Study Time",
        timeSpent: studyTime,
        type: "Study Session",
        date: normalizeDate(new Date()),
      };

      const taskExists = tasks.some(task =>
        task.taskName === newTask.taskName &&
        task.timeSpent === newTask.timeSpent &&
        task.type === newTask.type &&
        task.date === newTask.date
      );

      if (!taskExists) {
        tasks.push(newTask);
      }

      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderTasks(tasks);

    }
  }

  $("#startTimer1").click(function () {
    startTimer1();
  });

  $("#startTimer2").click(function () {
    startTimer2();
  });

  $("#pauseTimers").click(function () {
    pauseBothTimers();
  });

  $("#saveGameTime").click(function () {
    saveGameTime();
  });

  $("#saveStudyTime").click(function () {
    saveStudyTime();
  });

  updateTimerDisplay('timerDisplay1', elapsedTime1);
  updateTimerDisplay('timerDisplay2', elapsedTime2);

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  $("#gamingTableBody").empty();
  $("#studyTableBody").empty();

  tasks.forEach(task => appendTaskToTable(task));
});