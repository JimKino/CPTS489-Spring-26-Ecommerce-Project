const review_submit = document.getElementById("review_submit");
const input_review = document.getElementById("input_review");
const btnReview = document.getElementById("btnReview");

btnReview.addEventListener("click", function (event) {
    input_review.classList.add("visible");
});

review_submit.addEventListener("click", function (event) {
    input_review.classList.remove("visible");
});
