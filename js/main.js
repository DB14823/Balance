let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

$(document).ready(function () {
  let unsavedTasks = [];
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  renderTasks(tasks);

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

        const normalizedData = data.map(task => ({
          ...task,
          date: normalizeDate(task.date),
        }));

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

  function convertToHoursMinutesSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-UK", options).format(date);
  }
  function normalizeDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  window.normalizeDate = normalizeDate;
  $("#saveToCalendar").click(function () {
    const selectedDate = $("#datePicker").val();
    if (!selectedDate) {
      alert("Please select a date!");
      return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks = tasks.filter(task => task.date !== selectedDate);

    $("#gamingTableBody tr, #studyTableBody tr").each(function () {
      const taskName = $(this).find("td:first").text().trim();
      const timeSpentText = $(this).find("td:nth-child(2)").text().trim();
      const tableId = $(this).closest("tbody").attr("id");
      const type = tableId === "gamingTableBody" ? "Gaming Session" : "Study Session";

      console.log("Raw timeSpentText:", timeSpentText);


      let timeSpent = 0;

      if (timeSpentText) {
        const timeParts = timeSpentText
          .replace(/h|m|s/g, "")
          .trim()
          .split(" ")
          .map(Number);

        console.log("Parsed timeParts:", timeParts);

        const hours = timeParts[0] || 0;
        const minutes = timeParts[1] || 0;
        const seconds = timeParts[2] || 0;

        timeSpent = hours * 3600 + minutes * 60 + seconds;
      } else {
        console.warn(`Empty timeSpentText for task "${taskName}"`);
        return;
      }

      const newTask = {
        taskName,
        timeSpent,
        type,
        date: selectedDate,
      };
      console.log("New task to save:", newTask);

      const taskExists = tasks.some(task =>
        task.taskName === newTask.taskName &&
        task.timeSpent === newTask.timeSpent &&
        task.type === newTask.type &&
        task.date === newTask.date
      );

      if (!taskExists) {
        tasks.push(newTask);
      }
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    $("#gamingTableBody").empty().append("<tr><td colspan='3'>No gaming sessions to display.</td></tr>");
    $("#studyTableBody").empty().append("<tr><td colspan='3'>No study sessions to display.</td></tr>");

    generateCalendar(currentYear, currentMonth);

    alert(`Tasks have been saved to ${selectedDate}!`);
  });
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

      let timeSpentFormatted = convertToHoursMinutesSeconds(item.timeSpent);

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
      type: $("#type").val(),
    };

    console.log("New task:", task);

    unsavedTasks.push(task);

    renderTasks(unsavedTasks);

    $("#taskForm")[0].reset();
  });


});
$("#downloadData").click(function () {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (tasks.length === 0) {
    alert("No data available to download!");
    return;
  }

  const jsonData = JSON.stringify({ tasks }, null, 2); 

  const blob = new Blob([jsonData], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "calendarData.json";

  a.click();

  URL.revokeObjectURL(a.href);
});
$("#uploadData").change(function (event) {
  const file = event.target.files[0];

  if (!file) {
    alert("No file selected!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const uploadedData = JSON.parse(e.target.result);

      if (!uploadedData.tasks || !Array.isArray(uploadedData.tasks)) {
        alert("Invalid file format! Please upload a valid JSON file.");
        return;
      }

      localStorage.setItem("tasks", JSON.stringify(uploadedData.tasks));

      generateCalendar(currentYear, currentMonth);

      alert("Calendar data successfully uploaded!");
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      alert("Failed to upload calendar data. Please ensure the file is a valid JSON file.");
    }
  };

  reader.readAsText(file);
});
$("#deleteAll").click(function () {
  const confirmDelete = confirm("Are you sure you want to delete all tasks?");
  if (!confirmDelete) {
    return;
  }

  $("#gamingTableBody").empty().append("<tr><td colspan='3'>No gaming sessions to display.</td></tr>");
  $("#studyTableBody").empty().append("<tr><td colspan='3'>No study sessions to display.</td></tr>");

  unsavedTasks = [];

  localStorage.removeItem("tasks");

  alert("All tasks have been deleted!");
});