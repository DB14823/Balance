$(document).ready(function () {
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  function normalizeDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function generateCalendar(year, month) {
    const calendar = $("#calendar");
    calendar.empty();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    daysOfWeek.forEach(day => {
      calendar.append(`<div class="day header">${day}</div>`);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.append(`<div class="day empty"></div>`);
    }

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = normalizeDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);

      const tasksForDay = tasks.filter(task => task.date === formattedDate);

      const hasDataClass = tasksForDay.length > 0 ? "has-data" : "";
      const taskSummary = tasksForDay.map(task => `<div>${task.taskName} (${task.type})</div>`).join("");

      calendar.append(`
        <div class="day ${hasDataClass}" data-date="${formattedDate}">
          <div class="day-number">${day}</div>
        </div>
      `);
    }

    $("#calendar").off("click", ".day").on("click", ".day", function () {
      if (!$(this).hasClass("header") && !$(this).hasClass("empty")) {
        const selectedDate = $(this).data("date");
        showDayDetails(selectedDate);
      }
    });
  }
  function showDayDetails(selectedDay) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const tasksForSelectedDay = tasks.filter(task => task.date === selectedDay);

    let totalGamingTime = 0;
    let totalStudyTime = 0;

    tasksForSelectedDay.forEach(task => {
      if (task.type === "Gaming Session") {
        totalGamingTime += parseFloat(task.timeSpent);
      } else if (task.type === "Study Session") {
        totalStudyTime += parseFloat(task.timeSpent);
      }
    });

    if (tasksForSelectedDay.length === 0) {
      alert(`No data has been saved for day ${selectedDay}.`);
      return;
    }

    const formatTime = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60); 
      return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
    };

    const modalContent = `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>Details for ${selectedDay}</h3>
            <span class="close-button">&times;</span>
          </div>
          <div class="modal-body">
            <p><strong>Total Gaming Time:</strong> ${formatTime(totalGamingTime)}</p>
            <p><strong>Total Study Time:</strong> ${formatTime(totalStudyTime)}</p>
            <h4>Task Details:</h4>
            <ul>
              ${tasksForSelectedDay.map(task => `
                <li>
                  <strong>${task.taskName}</strong> (${task.type}): ${formatTime(task.timeSpent)}
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;

    $("body").append(modalContent);

    $(".close-button, .modal-overlay").click(function () {
      $(".modal-overlay").remove();
    });
  }

  function populateYearDropdown() {
    const yearDropdown = $("#yearDropdown");
    yearDropdown.empty();

    const startYear = currentYear - 10;
    const endYear = currentYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      yearDropdown.append(`<option value="${year}" ${year === currentYear ? "selected" : ""}>${year}</option>`);
    }
  }

  function populateMonthDropdown() {
    const monthDropdown = $("#monthDropdown");
    monthDropdown.empty();

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    months.forEach((month, index) => {
      monthDropdown.append(`<option value="${index}" ${index === currentMonth ? "selected" : ""}>${month}</option>`);
    });
  }

  function initializeCalendarView() {
    populateYearDropdown();
    populateMonthDropdown();
    currentYear = parseInt($("#yearDropdown").val());
    currentMonth = parseInt($("#monthDropdown").val());
    generateCalendar(currentYear, currentMonth);
  }

  initializeCalendarView();

  $("#yearDropdown, #monthDropdown").change(function () {
    currentYear = parseInt($("#yearDropdown").val());
    currentMonth = parseInt($("#monthDropdown").val());
    generateCalendar(currentYear, currentMonth);
  });

  $("#calendarView").on("show", function () {
    initializeCalendarView();
  });

  $("#calendarView").on("click", function () {
    generateCalendar(currentYear, currentMonth);
  });

  window.generateCalendar = generateCalendar;
});
