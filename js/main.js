let restaurants; // eslint-disable-line
let neighborhoods; // eslint-disable-line
let cuisines; // eslint-disable-line
var map; // eslint-disable-line
var markers = []; // eslint-disable-line

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', (event) => { // eslint-disable-line
    fetchNeighborhoods(); // eslint-disable-line
    fetchCuisines(); // eslint-disable-line
});

/**
 * Fetch all neighborhoods and set their HTML.
 */

fetchNeighborhoods = () => { // eslint-disable-line
    DBHelper.fetchNeighborhoods((error, neighborhoods) => { // eslint-disable-line
        if (error) { // Got an error
            console.error(error); // eslint-disable-line
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML(); // eslint-disable-line
        }
    });
};

/**
 * Set neighborhoods HTML.
 */

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => { // eslint-disable-line
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        option.setAttribute('role', 'option');
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => { // eslint-disable-line
    DBHelper.fetchCuisines((error, cuisines) => { // eslint-disable-line
        if (error) { // Got an error!
            console.error(error); // eslint-disable-line
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML(); // eslint-disable-line
        }
    });
};

/**
 * Set cuisines HTML.
 */

fillCuisinesHTML = (cuisines = self.cuisines) => { // eslint-disable-line
    const select = document.getElementById('cuisines-select');
    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        option.setAttribute('role', 'option');
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */

window.initMap = () => { 
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), { // eslint-disable-line
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants(); // eslint-disable-line
};

/**
 * Toggle map
 */

let toggleButtonMain = document.getElementById('mapToggle');
let gMapMain = document.getElementById('map-container');
gMapMain.style.display = 'none'; 
toggleButtonMain.addEventListener('click', (e)=>{ 
    e.preventDefault(); 
    if(gMapMain.style.display==='none') { 
        toggleButtonMain.innerHTML = 'Hide Map';
        gMapMain.style.display='block'; 
    } else { 
        toggleButtonMain.innerHTML = 'Show Map';
        gMapMain.style.display='none'; 
    } 
});

/**
 * Update page and map for current restaurants.
 */

updateRestaurants = () => { // eslint-disable-line
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => { // eslint-disable-line
        if (error) { // Got an error!
            console.error(error); // eslint-disable-line
        } else {
            resetRestaurants(restaurants); // eslint-disable-line
            fillRestaurantsHTML(); // eslint-disable-line
        }
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */

resetRestaurants = (restaurants) => { // eslint-disable-line
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */

fillRestaurantsHTML = (restaurants = self.restaurants) => { // eslint-disable-line
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant)); // eslint-disable-line
    });

    /* Lazyloads the images */

    new LazyLoad(); // eslint-disable-line
    addMarkersToMap(); // eslint-disable-line
};

/**
 * Create restaurant HTML.
 */

createRestaurantHTML = (restaurant) => { // eslint-disable-line
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant)+'.jpg'; // eslint-disable-line
    image.srcset = `/minimizedImages/${restaurant.photo_small_1x} 1x,
                  /minimizedImages/${restaurant.photo_2x} 2x`;
    image.alt = `${restaurant.name}`;
    li.append(image);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    name.setAttribute('tabindex',0);
    name.classList.add('focus');
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    neighborhood.setAttribute('tabindex',0);
    neighborhood.classList.add('focus');
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    address.setAttribute('tabindex',0);
    address.classList.add('focus');
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.setAttribute('aria-label', `View details of ${restaurant.name}`);
    more.href = DBHelper.urlForRestaurant(restaurant); // eslint-disable-line
    li.append(more);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
 
addMarkersToMap = (restaurants = self.restaurants) => { // eslint-disable-line
    restaurants.forEach(restaurant => {
    // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map); // eslint-disable-line
        google.maps.event.addListener(marker, 'click', () => { // eslint-disable-line
            window.location.href = marker.url;
        });
        self.markers.push(marker);
    });
};
