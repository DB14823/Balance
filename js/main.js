let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks(data) {
  console.log("Rendering tasks:", data);

  if (!Array.isArray(data) || data.length === 0) {
    console.error("renderTasks: No valid data to display.");
    return;
  }

  let gamingTableBody = $("#gamingTableBody");
  let studyTableBody = $("#studyTableBody");
  gamingTableBody.empty();
  studyTableBody.empty();

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      console.warn("Skipping invalid item:", item);
      return;
    }

    let row = `
      <tr>
        <td>${item.taskName}</td>
        <td>${item.timeSpent}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-task" data-index="${index}">Delete</button>
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

  $(".delete-task").click(function () {
    let index = $(this).data("index");
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks(tasks);
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
      timeSpent: $("#timeSpent").val(),
      type: $("#type").val()
    };

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks(tasks);

    $("#taskForm")[0].reset();
  });
});
