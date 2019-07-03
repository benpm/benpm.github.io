function randomPhoto(params) {
    const httpRequest = new XMLHttpRequest();
    const url = "https://api.unsplash.com/photos/random?client_id=b2e7e6a8244c9f4a62418e04d2633c32431eeed8b058fb82d3239a0f47cdccd9";
    httpRequest.open("GET", url);
    httpRequest.send();

    httpRequest.onload = (e) => {
        responseObj = JSON.parse(httpRequest.responseText);
        imgUrl = responseObj.urls.full;
        document.getElementById("image").style.backgroundImage = `url(${imgUrl})`;
    }
}

document.body.addEventListener("click", randomPhoto);
document.body.addEventListener("keyup", randomPhoto);

randomPhoto();