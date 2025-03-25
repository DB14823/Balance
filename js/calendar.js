$(document).ready(function () {
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); 

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

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      calendar.append(`<div class="day" data-date="${formattedDate}">${day}</div>`);
    }

    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        calendar.append(`<div class="day empty"></div>`);
      }
    }

    $(".day").not(".header").not(".empty").click(function () {
      const selectedDate = $(this).data("date");
      showDayDetails(selectedDate);
    });
  }

  function showDayDetails(selectedDate) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    const tasksForDay = tasks.filter(task => task.deadline === selectedDate);
  
    let totalGamingTime = 0;
    let totalStudyTime = 0;
  
    tasksForDay.forEach(task => {
      if (task.type === "Gaming Session") {
        totalGamingTime += parseFloat(task.timeSpent);
      } else if (task.type === "Study Session") {
        totalStudyTime += parseFloat(task.timeSpent);
      }
    });
  
    if (tasksForDay.length === 0) {
      alert(`No data has been saved for ${selectedDate}.`);
      return;
    }
  
    const totalTime = totalGamingTime + totalStudyTime;
    const gamingPercentage = totalTime > 0 ? ((totalGamingTime / totalTime) * 100).toFixed(2) : 0;
    const studyPercentage = totalTime > 0 ? ((totalStudyTime / totalTime) * 100).toFixed(2) : 0;
  
    const modalContent = `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>Details for ${selectedDate}</h3>
            <span class="close-button">&times;</span>
          </div>
          <div class="modal-body">
            <p><strong>Total Gaming Time:</strong> ${totalGamingTime.toFixed(2)} hours (${gamingPercentage}%)</p>
            <p><strong>Total Study Time:</strong> ${totalStudyTime.toFixed(2)} hours (${studyPercentage}%)</p>
          </div>
        </div>
      </div>
    `;
  
    console.log("Appending modal content:", modalContent);
    $("body").append(modalContent);
    console.log("Modal appended to body.");
      
    $(".modal-overlay").remove();
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

  $("#yearDropdown, #monthDropdown").change(function () {
    currentYear = parseInt($("#yearDropdown").val());
    currentMonth = parseInt($("#monthDropdown").val());
    generateCalendar(currentYear, currentMonth);
  });

  populateYearDropdown();
  populateMonthDropdown();
  generateCalendar(currentYear, currentMonth);

  window.generateCalendar = generateCalendar;
});