const url = window.location.href;
const split_url = url.split('=');
const id = split_url[1];

const body_object = {
    id
};

const body_json = JSON.stringify(body_object);

fetch("/itemPopulate", { method: "POST", body: body_json, headers: { "Content-Type": "application/json" }})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    const image = document.getElementById('productImage');
    const desc = document.getElementById('productDesc');
    const buy = document.getElementById('productBuy');
    image.innerHTML += `<img src="/images/${data.listImage}">`;
    desc.innerHTML += `<h1>${data.listName}</h1>
    <h2>$${data.listPrice}</h2>
    <p>${data.listDesc}</p>`;
    buy.innerHTML += `<h2>$${data.listPrice}</h2>
    <button type="submit" class="btn btn-primary">Add to Cart</button>`;
})

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
