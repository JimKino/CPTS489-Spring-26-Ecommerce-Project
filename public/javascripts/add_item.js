
productsubmit.addEventListener("click", async function (event) {
    var name = document.getElementById('item_name').value.trim();
    var price = document.getElementById('item_price').value.trim();
    var quantity = document.getElementById('item_quantity').value.trim();
    var desc = document.getElementById('item_desc').value.trim();
    var image = document.getElementById('item_image').value.trim();
    var email = "";
    if (document.cookie != "")
    {
        let details = decodeURIComponent(document.cookie);
        details = details.split(',');
        details = details[0].split(':');
        details = details[2];
        email = details.split("\"")[1];
    }

    const body_object = {
        name,
        price,
        quantity,
        desc,
        image,
        email
    };

    const body_json = JSON.stringify(body_object);

    const response = await fetch("/createListing",{ method: "POST", body: body_json, headers: { "Content-Type": "application/json" } });
});
