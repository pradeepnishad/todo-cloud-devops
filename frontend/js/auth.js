const API_URL = "http://127.0.0.1:8000";


// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("message");


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                message.textContent =
                    "Registration successful! Redirecting to login...";


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1500);

            } else {

                message.textContent =
                    data.detail ||
                    "Registration failed.";

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

        }

    });
}



// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");


        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                // Save JWT token
                localStorage.setItem(
                    "token",
                    data.access_token
                );


                message.textContent =
                    "Login successful! Redirecting...";


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1000);

            } else {

                message.textContent =
                    data.detail ||
                    "Login failed.";

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

        }

    });
}