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
  
    function saveTimes() {
      const gameTime = elapsedTime1 / 60000; 
      const studyTime = elapsedTime2 / 60000; 
  
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
      if (gameTime > 0) {
        tasks.push({
          taskName: "Game Time",
          timeSpent: gameTime.toFixed(2),
          deadline: new Date().toISOString().split('T')[0],
          type: "Gaming Session"
        });
      }
  
      if (studyTime > 0) {
        tasks.push({
          taskName: "Study Time",
          timeSpent: studyTime.toFixed(2),
          deadline: new Date().toISOString().split('T')[0],
          type: "Study Session"
        });
      }
  
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks(tasks);
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
  
    $("#saveTimes").click(function () {
      saveTimes();
    });
  
    updateTimerDisplay('timerDisplay1', elapsedTime1);
    updateTimerDisplay('timerDisplay2', elapsedTime2);
  });
  
  