const btnSubmit = document.getElementById("btnSubmit");

btnSubmit.addEventListener("click", function (event) {

    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const card = document.getElementById("card").value;
    const experation = document.getElementById("experation").value;
    const cvv = document.getElementById("cvv").value;

    const error = document.getElementById("error");

    error.classList.remove("visible");

    let isValid = true;

    if (fname === ""){
        isValid = false;
    }

    if (lname === ""){
        isValid = false;
    }

    if (card.length != 16){
        isVaid = false;
    }

    if (experation.length != 5){
        isVaid = false;
    }

    if (cvv.length != 3){
        isVaid = false;
    }

    if (!isValid){
        event.preventDefault();
        error.classList.add("visible");
        return;
    }
});
