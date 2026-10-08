// History API integration will be added here.
const API_URL = "https://todo-cloud-devops.onrender.com";

const token = localStorage.getItem("token");


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {

    window.location.href = "login.html";

}


// ========================================
// LOAD HISTORY
// ========================================

async function loadHistory() {

    const historyList =
        document.getElementById("historyList");


    try {

        const response = await fetch(
            `${API_URL}/tasks/history`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

            return;
        }


        const tasks =
            await response.json();


        historyList.innerHTML = "";


        if (tasks.length === 0) {

            historyList.innerHTML =
                "<p>No completed tasks yet.</p>";

            return;
        }


        tasks.forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "task-card";


            const completedDate =
                task.completed_at
                    ? new Date(
                        task.completed_at
                    ).toLocaleString()
                    : "Unknown";


            taskElement.innerHTML = `

                <div class="task-content">

                    <h3>
                        ✓ ${escapeHtml(task.title)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            task.description || ""
                        )}
                    </p>

                    <small>
                        Completed:
                        ${completedDate}
                    </small>

                </div>

            `;


            historyList.appendChild(
                taskElement
            );

        });


    } catch (error) {

        console.error(error);

        historyList.innerHTML =
            "<p>Unable to load task history.</p>";

    }

}


// ========================================
// HTML ESCAPING
// ========================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


// ========================================
// INITIAL LOAD
// ========================================

loadHistory();