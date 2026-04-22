const btnRegister = document.getElementById("btnRegister");
btnRegister.addEventListener("click", function (event) {
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("registerError");
    error.style.display = "none";
    let isValid = true;
    let isValid2 = true;
    
    if (fname === "") {
        isValid = false;
    }
    if (lname === "") {
        isValid = false;
    }
    if (email === "") {
        isValid = false;
    }
    if (password === "") {
        isValid = false;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !emailRegex.test(email)) {
        isValid2 = false;
    }
    
    if (!isValid || !isValid2) {
        event.preventDefault();
        if (!isValid2) {
            error.textContent = "Please input a valid email address";
        } else {
            error.textContent = "Please fill out all fields";
        }
        error.style.display = "block";
        return;
    }
});

const btnSubmit = document.getElementById("btnSubmit");

btnSubmit.addEventListener("click", async function (event) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");
    error.style.display = "none";
    let isValid = true;
    
    // Basic validation only
    if (email === "") {
        isValid = false;
    }
    if (password === "") {
        isValid = false;
    }
    
    if (!isValid) {
        event.preventDefault();
        error.textContent = "Please enter both email and password";
        error.style.display = "block";
        return;
    }
});