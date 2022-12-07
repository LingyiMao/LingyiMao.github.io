const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector("#Destination");
const numberInput = document.querySelector("#number-of-people");
const dataInput = document.querySelector('.datetime-checkin');
const infoPage = document.querySelector(".accommodation-info");
const mainPage = document.querySelector(".main-page");
const bookingPage = document.querySelector(".booking-page");
const lastPage = document.querySelector('.last-page');
const totalPrice = document.querySelector('.total-price');
const guestNumber = document.querySelector('#guests');
let accommodationArray;
let locationArray;

async function getAccommodation() {
    let response = await fetch("./information.json");
    let data = await response.json();
    accommodationArray = data.accommodations;
    locationArray = data.places;

    prepareSearch()
    displayAccomodationLocations(locationArray);
}


//flatpickr function
let daysLengthTotal;
config = {
    dateFormat: "d-m-Y",
    mode: "range",
    onClose: function (selectedDates, dateStr, instance) {
        let daysInRange = document.getElementsByClassName('inRange');
        daysLengthTotal = daysInRange.length + 1;
    }
}
flatpickr("input[type=datetime]", config);



//display accommodation location and accommodation cards function
function displayAccomodationCards(array) {
    let cardHtml = "";
    for (let accommodationData of array) {
        const cardsElment = `<div class="accommodation-content__card">
        <img src="./images/${accommodationData.name}.jpg" alt="${accommodationData.name}">
        <div class="accommodation-content__info">
        <div class="accommodation-content__name">
        <h3>${accommodationData.name}</h3>
        <h3 class="price">NZ$${accommodationData.price}</h3>
        </div>
        <h5>per night</h5>
        <div class="accommodation-content__rating">
        <div class="accommodation-content__location">
        <i class="fa-solid fa-location-dot"></i>
        <h4>${accommodationData.location}</h4>
        </div>
        <div class="stars">
        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
        </div>
        </div>
        </div>
        </div>`

        cardHtml += cardsElment
    }
    document.querySelector(".accommodation-content").innerHTML = cardHtml;

    const cardList = document.querySelectorAll(".accommodation-content__card");
    for (let card of cardList) {
        card.addEventListener('click', function () {
            infoPage.classList.remove('hidden');
            addDetailsToInfopage(card, array);
        })
    }
}


function displayAccomodationLocations(array) {
    let locationHtml = "";
    for (let locationData of array) {
        const locationCardElement = `<div class="destination-content__location" data-id=${locationData.locationID}>
        <img src="./images/${locationData.location}.jpg" alt="${locationData.location}">
        <h3>${locationData.location}</h3>
    </div>`
        locationHtml += locationCardElement
    }
    document.querySelector(".destination-content").innerHTML = `<h2>Top Destination</h2>` + locationHtml;

    const locationList = document.querySelectorAll(".destination-content__location");
    for (let location of locationList) {
        location.addEventListener('click', function (event) {
            const locationString = event.currentTarget.dataset.id;
            displayFilterLocationCards(locationString);
        })
    }
}


function displayFilterLocationCards(locationID) {
    let matches = [];
    for (let location of accommodationArray) {
        if (location.locationID === parseInt(locationID)) {
            matches.push(location);
        }
    }
    displayAccomodationCards(matches);
}


//search and filter function
function prepareSearch() {
    searchInput.addEventListener("input", function () {
        filterLocationCards(searchInput.value);
    });
    
}



function filterLocationCards(filterString) {
    let matches = [];
    for (let location of accommodationArray) {
        if (location.location.toLowerCase().includes(filterString.toLowerCase())) {
            matches.push(location);
        }
    }
    filterLocationCardsByNumber(matches);
}


function filterLocationCardsByNumber(array) {

    numberInput.addEventListener('input', function () {
        let matches = [];
        for (let location of array) {
            if (parseInt(numberInput.value) >= location.mingroupsize && parseInt(numberInput.value) <= location.maxgroupsize) {
                matches.push(location);
            }
        }
        filterLocationByDate(matches);
    })
}

function filterLocationByDate(array) {
    let matches = [];
    searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (daysLengthTotal === undefined) {
            alert('Please select the date')
        } else {
        for(let location of array) {
            if(daysLengthTotal >= location.minnights && daysLengthTotal <= location.maxnights){
                matches.push(location);
            }
        }
        displayAccomodationCards(matches);
    }
    });
}



//add all the user input information to the different pages
function addDetailsToInfopage(card, array) {
    //all the information add to the info page (name, price, location, image, total-price
    document.querySelector('.accommodation-info__date').value = dataInput.value;
    const hotelPrice = parseInt(((card.querySelector('.price').innerText).match(/\d+/g)).toString());
    document.querySelector('.hotel-name').innerText = card.querySelector('h3').innerText;
    document.querySelector('.hotel-price').innerText = card.querySelector('.price').innerText + " " + "per night";
    document.querySelector('.location-name').innerText = card.querySelector('h4').innerText;
    document.querySelector('.hotel-image').src = card.querySelector('img').src;
    totalPrice.innerText = "Total:" + " " + card.querySelector('.price').innerText + " per night";
    guestNumber.value = numberInput.value;

    //sleeps number for different type of accommodations
    for (let data of array) {
        if (data.price === hotelPrice) {
            if (data.mingroupsize === data.maxgroupsize) {
                document.querySelector('.room-size').innerText = "sleeps " + data.mingroupsize;
            } else {
                document.querySelector('.room-size').innerText = "sleeps " + data.mingroupsize + " - " + data.maxgroupsize;
            }
        }
    }

    //meals choice
    const choiceList = document.querySelectorAll('#choice');
    for (let choice of choiceList) {
        if (choice.addEventListener('click', function () {
            totalPrice.innerText = "Total: NZ$" + (hotelPrice + parseInt(choice.value) * guestNumber.value) + " per night";
        })) {
            guestNumber.addEventListener('input', function () {
                totalPrice.innerText = "Total: NZ$" + (hotelPrice + parseInt(choice.value) * guestNumber.value) + " per night";
            })
        }
    }
    addDetailsToBookingpage(card, choiceList);
    showMap(card.querySelector('h4').innerText);
}


function addDetailsToBookingpage(bookingInfo, array) {
    const hotelPrice = parseInt(((bookingInfo.querySelector('.price').innerText).match(/\d+/g)).toString())
    const hotelName = document.querySelector('.booking-page__hotel-names').innerText = bookingInfo.querySelector('h3').innerText;
    document.querySelector('.check-in-date').innerText = dataInput.value;
    document.querySelector('.booking-page__location-name').innerText = bookingInfo.querySelector('h4').innerText;
    document.querySelector('.booking-page__image').src = bookingInfo.querySelector('img').src;
    document.querySelector('.nights-number').innerText = "$" + hotelPrice + " X " + daysLengthTotal;
    document.querySelector('.nights-price').innerText = "$ " + hotelPrice * daysLengthTotal;
    document.querySelector('.guest-number').innerText = numberInput.value;


    for (let choice of array) {
        choice.addEventListener('click', function () {
            const extraPrice = choice.value * guestNumber.value * daysLengthTotal;
            document.querySelector('.extra-price').innerText = "$" + choice.value * guestNumber.value * daysLengthTotal;
            const finalPrice = document.querySelector('.booking-page__price').innerText = "$ " + (hotelPrice * daysLengthTotal + extraPrice);
            addInfoToLastpage(hotelName, finalPrice);
        })
    }
    
    guestNumber.addEventListener('input', function () {
        if (numberInput.value !== guestNumber.value) {
            document.querySelector('.guest-number').innerText = guestNumber.value;
        }})
};



function addInfoToLastpage(hotelName, totalPrice) {
    document.querySelector('.last-page__destination-name').innerText = hotelName;
    document.querySelector('.last-page__total-price').innerText = totalPrice;
    document.querySelector('.last-page__checkin-date').innerText = dataInput.value;
}


//map function
function showMap(locationName) {
    for (let location of locationArray) {
        if (locationName.toString() === location.location) {
            let map = L.map('map').setView([location.locationLatitude, location.locationLongitude], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap'
            }).addTo(map);
            let marker = L.marker([location.markerLatitude, location.markerLongitude]).addTo(map);
        }
    }
}



//hotel image slider on the info page
const imageElement = document.querySelectorAll('.hotel-image__wrapper');
const bannerButtonDiv = document.querySelector('.banner-buttons');
let bannerButtonsHtml = ``;
for (let i = 0; i < imageElement.length; i++) {
    bannerButtonsHtml += `<input type="radio" name="banner-buttons-group" value="${i}" class="banner-button">`;
  }
bannerButtonDiv.innerHTML = bannerButtonsHtml;
let radioButtonsArray = document.querySelectorAll(".banner-button");
for (let radioButton of radioButtonsArray) {
  radioButton.addEventListener("click", switchBannerImage);
}
function switchBannerImage(event) {
    let selectedImageIndex = event.target.value;
    for (let image of imageElement) {
      image.classList.remove("active");
    }
    imageElement[selectedImageIndex].classList.add("active");
  }




//function for open and close each page
function openBookingpage() {
    let choiceVaule = 0;
    const choiceList = document.querySelectorAll('#choice');
    for(choice of choiceList) {
        choice.addEventListener('click', function(){
             choiceVaule = parseInt(choice.value) ;
             console.log(choiceVaule)
        })
    }

    const button = document.querySelector('.booking-button');
    button.addEventListener('click', function (event) {
        event.preventDefault();
            if(choiceVaule >= 15) {
                mainPage.classList.add('hidden');
                infoPage.classList.add('hidden');
                bookingPage.classList.remove('hidden');
            } else {
                alert('please choose an extra option')
            }
    })
    backToInfopage();
}

function backToInfopage() {
    const button = document.querySelector('#booking-page__back-button');
    button.addEventListener('click', function () {
        bookingPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        infoPage.classList.remove('hidden');
    })
}


function openLastpage() {
    const button = document.querySelector('.booking-page__booking-button');
    button.addEventListener('click', function () {
        bookingPage.classList.add('hidden');
        lastPage.classList.remove('hidden');
    })
    backToHomePage();
}

function backToHomePage() {
    const button = document.querySelector('.last-page__back-home');
    button.addEventListener('click', function () {
        lastPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
    })

}


function closeInfopage() {
    document.querySelector('#back-button').addEventListener('click', function () {
        infoPage.classList.add('hidden');
    })
}


closeInfopage();
openBookingpage();
openLastpage();
getAccommodation();