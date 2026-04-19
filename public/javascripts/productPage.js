const review_submit = document.getElementById("review_submit");
const input_review = document.getElementById("input_review");
const btnReview = document.getElementById("btnReview");
const stars = document.querySelectorAll('.star');

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        stars.forEach((s, i) => {
            s.classList.toggle('selected', i <= index);
        });
    });
});

btnReview.addEventListener("click", function (event) {
    input_review.classList.add("visible");
});

review_submit.addEventListener("click", function (event) {
    input_review.classList.remove("visible");
});
