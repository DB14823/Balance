$(document).ready(function () {
    function generateCalendar() {
      const calendar = $("#calendar");
      calendar.empty();
  
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const daysInMonth = new Date(2023, 11, 0).getDate(); 
  
      daysOfWeek.forEach(day => {
        calendar.append(`<div class="day">${day}</div>`);
      });
  
      for (let day = 1; day <= daysInMonth; day++) {
        calendar.append(`<div class="day">${day}</div>`);
      }
    }
  
    window.generateCalendar = generateCalendar;
  });
