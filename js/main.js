$(document).ready(function () {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const isGamingTableEmpty = $("#gamingTableBody tr").length === 0 || $("#gamingTableBody").text().includes("No gaming sessions to display.");
  const isStudyTableEmpty = $("#studyTableBody tr").length === 0 || $("#studyTableBody").text().includes("No study sessions to display.");

  const isJsonDataFetched = localStorage.getItem("jsonDataFetched");

  if (isGamingTableEmpty && isStudyTableEmpty && !isJsonDataFetched) {
    console.log("Tables are empty. Fetching data from JSON file...");
    fetch("data/data.json")
      .then(response => response.json())
      .then(data => {
        console.log("Data fetched from JSON file:", data);

        let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];

        tasks = [...existingTasks, ...data];

        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("jsonDataFetched", "true"); 
        console.log("Tasks loaded from JSON file and merged with existing tasks:", tasks);

        renderTasks(tasks);
      })
      .catch(error => console.error("Error fetching data.json:", error));
  } else {
    console.log("Rendering tasks from localStorage...");
    renderTasks(tasks);
  }

  function convertToMinutesAndSeconds(decimalTime) {
    let minutes = Math.floor(decimalTime);
    let seconds = Math.round((decimalTime - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function renderTasks(data) {
    console.log("Rendering tasks:", data);

    let gamingTableBody = $("#gamingTableBody");
    let studyTableBody = $("#studyTableBody");
    gamingTableBody.empty();
    studyTableBody.empty();

    if (!Array.isArray(data) || data.length === 0) {
      gamingTableBody.append("<tr><td colspan='3'>No gaming sessions to display.</td></tr>");
      studyTableBody.append("<tr><td colspan='3'>No study sessions to display.</td></tr>");
      return;
    }

    data.forEach((item) => {
      if (!item || typeof item !== "object") {
        console.warn("Skipping invalid item:", item);
        return;
      }

      let timeSpentFormatted = convertToMinutesAndSeconds(item.timeSpent);

      let row = `
        <tr>
          <td>${item.taskName}</td>
          <td>${timeSpentFormatted}</td>
          <td>
            <button class="btn btn-danger btn-sm delete-task">Delete</button>
          </td>
        </tr>
      `;

      if (item.type === "Gaming Session") {
        gamingTableBody.append(row);
      } else if (item.type === "Study Session") {
        studyTableBody.append(row);
      }
    });

    $(".delete-task").off("click").on("click", function () {
      const row = $(this).closest("tr");
      const taskName = row.find("td:first").text();
      const timeSpentFormatted = row.find("td:nth-child(2)").text();
      const tableId = row.closest("tbody").attr("id");
      const type = tableId === "gamingTableBody" ? "Gaming Session" : "Study Session";

      const [minutes, seconds] = timeSpentFormatted.split(":").map(Number);
      const timeSpent = minutes + seconds / 60;

      tasks = tasks.filter(task => {
        const taskTimeSpent = typeof task.timeSpent === "number" ? task.timeSpent : parseFloat(task.timeSpent);
        return !(task.taskName === taskName && taskTimeSpent.toFixed(2) === timeSpent.toFixed(2) && task.type === type);
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

  window.renderTasks = renderTasks;

  function populateDateDropdown() {
    const dateDropdown = $("#dateDropdown");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); 
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    dateDropdown.empty(); 

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dateDropdown.append(`<option value="${formattedDate}">${formattedDate}</option>`);
    }
  }

  populateDateDropdown();

  $("#taskForm").submit(function (event) {
    event.preventDefault();

    let task = {
      taskName: $("#taskName").val(),
      timeSpent: parseFloat($("#timeSpent").val()), 
      type: $("#type").val()
    };

    console.log("New task:", task); 

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("Tasks after adding new task:", tasks);
    renderTasks(tasks);

    $("#taskForm")[0].reset();
  });

  $("#saveToCalendar").click(function () {
    const selectedDate = $("#datePicker").val();
    if (!selectedDate) {
      alert("Please select a date!");
      return;
    }
  
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    };
  
    const formattedDate = formatDate(selectedDate);
  
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    $("#gamingTableBody tr, #studyTableBody tr").each(function () {
      const taskName = $(this).find("td:first").text();
      const timeSpentText = $(this).find("td:nth-child(2)").text();
      const tableId = $(this).closest("tbody").attr("id");
      const type = tableId === "gamingTableBody" ? "Gaming Session" : "Study Session";
  
      const [minutes, seconds] = timeSpentText.split(":").map(Number);
      const timeSpent = minutes + seconds / 60;
  
      const existingTaskIndex = tasks.findIndex(task =>
        task.taskName === taskName &&
        task.timeSpent === timeSpent &&
        task.type === type
      );
  
      if (existingTaskIndex !== -1) {
        tasks[existingTaskIndex].deadline = selectedDate;
      } else {
        const newTask = {
          taskName,
          timeSpent,
          type,
          deadline: selectedDate,
        };
  
        tasks.push(newTask);
      }
    });
  
    localStorage.setItem("tasks", JSON.stringify(tasks));
    alert(`Tasks have been saved to ${formattedDate}!`);
  });
});
