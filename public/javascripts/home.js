fetch("/homePopulate", { method: "POST", headers: { "Content-Type": "application/json" }})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log(data);
    for(let i = 0; i < data.length; i++)
    {
        const main = document.getElementById('main');
        const item = document.createElement('div');
        item.classList.add('productContainer');
        item.innerHTML += `
        <div class="productImage">
            <img src="/images/${data[i].listImage}">
        </div>
        <div class="productDesc">
            <h1>${data[i].listName}</h1>
            <h2>$${data[i].listPrice}</h2>
            <p>${data[i].listDesc}</p>
        </div>
        <a href="/productPage?id=${data[i].listNo}">
        <button type="submit" class="btn btn-primary">Item Page</button>
        </a>`;
        main.append(item);
    }
})
