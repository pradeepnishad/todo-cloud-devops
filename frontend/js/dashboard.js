// Dashboard API integration will be added here.
const API_URL = "https://todo-cloud-devops.onrender.com";


// ========================================
// CHECK LOGIN
// ========================================

const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}


// ========================================
// API HELPER
// ========================================

async function apiRequest(url, options = {}) {

    const response = await fetch(
        `${API_URL}${url}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`,

                ...(options.headers || {})
            }
        }
    );


    // JWT expired / invalid
    if (response.status === 401) {

        localStorage.removeItem("token");

        window.location.href = "login.html";

        return null;
    }


    return response;
}


// ========================================
// LOAD USER
// ========================================

async function loadUser() {

    try {

        const response =
            await apiRequest("/auth/me");

        if (!response) return;

        const user =
            await response.json();

        document.getElementById("userEmail")
            .textContent =
            user.email;

    } catch (error) {

        console.error(
            "Error loading user:",
            error
        );

    }
}


// ========================================
// LOAD STATISTICS
// ========================================

async function loadStats() {

    try {

        const response =
            await apiRequest("/tasks/stats");

        if (!response) return;

        const stats =
            await response.json();


        document.getElementById("totalTasks")
            .textContent =
            stats.total;

        document.getElementById("pendingTasks")
            .textContent =
            stats.pending;

        document.getElementById("completedTasks")
            .textContent =
            stats.completed;

    } catch (error) {

        console.error(
            "Error loading stats:",
            error
        );

    }
}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    const tasksList =
        document.getElementById("tasksList");


    try {

        const response =
            await apiRequest("/tasks");

        if (!response) return;


        const tasks =
            await response.json();


        tasksList.innerHTML = "";


        if (tasks.length === 0) {

            tasksList.innerHTML =
                "<p>No tasks yet. Create your first task!</p>";

            return;
        }


        tasks.forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "task-card";

            taskElement.dataset.taskId =
                task.id;


            taskElement.innerHTML = `

                <div class="task-content">

                    <h3>
                        ${escapeHtml(task.title)}
                    </h3>

                    <p>
                        ${escapeHtml(
                task.description || ""
            )}
                    </p>

                    <small>
                        Status:
                        ${task.status}
                    </small>

                </div>


               <div class="task-actions">

    ${task.status === "pending"
                    ?
                    `<button
            onclick="completeTask(${task.id})"
        >
            Done
        </button>`
                    :
                    ""
                }

    <button
    onclick="showEditForm(${task.id})"
>
    Edit
</button>

    <button
        onclick="deleteTask(${task.id})"
    >
        Delete
    </button>

</div>

            `;


            tasksList.appendChild(
                taskElement
            );

        });

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        tasksList.innerHTML =
            "<p>Unable to load tasks.</p>";

    }
}


// ========================================
// CREATE TASK
// ========================================

const taskForm =
    document.getElementById("taskForm");


taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            document.getElementById(
                "taskTitle"
            ).value;


        const description =
            document.getElementById(
                "taskDescription"
            ).value;


        const message =
            document.getElementById(
                "taskMessage"
            );


        try {

            const response =
                await apiRequest(
                    "/tasks",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            title: title,
                            description: description
                        })
                    }
                );


            if (!response) return;


            const data =
                await response.json();


            if (response.ok) {

                message.textContent =
                    "Task created successfully!";


                taskForm.reset();


                await loadTasks();

                await loadStats();

            } else {

                message.textContent =
                    data.detail ||
                    "Failed to create task.";

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

        }

    }
);


// ========================================
// COMPLETE TASK
// ========================================

async function completeTask(taskId) {

    try {

        const response =
            await apiRequest(
                `/tasks/${taskId}/done`,
                {
                    method: "PATCH"
                }
            );


        if (!response) return;


        if (response.ok) {

            await loadTasks();

            await loadStats();

        } else {

            const data =
                await response.json();

            alert(
                data.detail ||
                "Unable to complete task."
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(taskId) {

    const taskCard = document.querySelector(
        `[data-task-id="${taskId}"]`
    );

    if (!taskCard) return;

    // Prevent creating multiple confirmation boxes
    if (taskCard.querySelector(".delete-confirmation")) {
        return;
    }

    const confirmation = document.createElement("div");

    confirmation.className = "delete-confirmation";

    confirmation.innerHTML = `
        <span>Delete this task?</span>

        <button class="confirm-delete">
            Delete
        </button>

        <button class="cancel-delete">
            Cancel
        </button>
    `;

    taskCard.appendChild(confirmation);


    // Cancel
    confirmation
        .querySelector(".cancel-delete")
        .addEventListener("click", function () {

            confirmation.remove();

        });


    // Confirm delete
    confirmation
        .querySelector(".confirm-delete")
        .addEventListener("click", async function () {

            try {

                const response =
                    await apiRequest(
                        `/tasks/${taskId}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response) return;


                if (response.ok) {

                    await loadTasks();

                    await loadStats();

                } else {

                    const data =
                        await response.json();

                    alert(
                        data.detail ||
                        "Unable to delete task."
                    );
                }

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        });
}

// ========================================
// LOGOUT
// ========================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

        }
    );


// ========================================
// HTML ESCAPING
// ========================================


function showEditForm(taskId) {

    const taskCard = document.querySelector(
        `[data-task-id="${taskId}"]`
    );

    if (!taskCard) return;

    // Don't open multiple edit forms
    if (taskCard.querySelector(".edit-form")) {
        return;
    }

    const taskContent =
        taskCard.querySelector(".task-content");

    const currentTitle =
        taskContent.querySelector("h3").textContent.trim();

    const descriptionElement =
        taskContent.querySelector("p");

    const currentDescription =
        descriptionElement
            ? descriptionElement.textContent.trim()
            : "";

    const editForm =
        document.createElement("div");

    editForm.className = "edit-form";

    editForm.innerHTML = `
        <label>Title</label>

        <input
            type="text"
            class="edit-title"
            value="${escapeHtml(currentTitle)}"
        >

        <label>Description</label>

        <textarea
            class="edit-description"
        >${escapeHtml(currentDescription)}</textarea>

        <div class="edit-actions">

            <button class="save-edit">
                Save Changes
            </button>

            <button class="cancel-edit">
                Cancel
            </button>

        </div>
    `;

    taskContent.innerHTML = "";

    taskContent.appendChild(editForm);


    // Cancel
    editForm
        .querySelector(".cancel-edit")
        .addEventListener("click", function () {

            loadTasks();

        });


    // Save
    editForm
        .querySelector(".save-edit")
        .addEventListener("click", async function () {

            const newTitle =
                editForm
                    .querySelector(".edit-title")
                    .value
                    .trim();

            const newDescription =
                editForm
                    .querySelector(".edit-description")
                    .value
                    .trim();


            if (!newTitle) {

                alert("Task title cannot be empty.");

                return;
            }


            try {

                const response =
                    await apiRequest(
                        `/tasks/${taskId}`,
                        {
                            method: "PUT",

                            body: JSON.stringify({
                                title: newTitle,
                                description: newDescription
                            })
                        }
                    );


                if (!response) return;


                if (response.ok) {

                    await loadTasks();

                    await loadStats();

                } else {

                    const data =
                        await response.json();

                    alert(
                        data.detail ||
                        "Unable to update task."
                    );

                }

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        });
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


async function editTask(taskId) {

    const title =
        prompt("Enter new task title:");

    if (title === null || title.trim() === "") {
        return;
    }

    const description =
        prompt("Enter new task description:");

    if (description === null) {
        return;
    }

    try {

        const response =
            await apiRequest(
                `/tasks/${taskId}`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim()
                    })
                }
            );

        if (!response) return;

        if (response.ok) {

            await loadTasks();
            await loadStats();

        } else {

            const data =
                await response.json();

            alert(
                data.detail ||
                "Unable to update task."
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// ========================================
// INITIAL LOAD
// ========================================

loadUser();

loadStats();

loadTasks();