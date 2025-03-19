let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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
    gamingTableBody.append("<tr><td colspan='2'>No gaming sessions to display.</td></tr>");
    studyTableBody.append("<tr><td colspan='2'>No study sessions to display.</td></tr>");
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

  console.log("Gaming table body:", gamingTableBody.html());
  console.log("Study table body:", studyTableBody.html());

  $(".delete-task").off("click").on("click", function () {
    $(this).closest("tr").remove();

    if (gamingTableBody.children().length === 0) {
      gamingTableBody.append("<tr><td colspan='3'>No gaming sessions to display.</td></tr>");
    }
    if (studyTableBody.children().length === 0) {
      studyTableBody.append("<tr><td colspan='3'>No study sessions to display.</td></tr>");
    }
  });
}

$(document).ready(function () {
  renderTasks(tasks);

  fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
      console.log("Data fetched:", data);

      if (tasks.length === 0) {
        tasks = data;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        console.log("Updated tasks:", tasks);
        renderTasks(tasks);
      }
    })
    .catch(error => console.error("Error fetching data.json:", error));

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
});