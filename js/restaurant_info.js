let restaurant; // eslint-disable-line
var map; // eslint-disable-line

/**
 * Initialize Google map, called from HTML.
 */

window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => { // eslint-disable-line
        if (error) { // Got an error!
            console.error(error); // eslint-disable-line
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), { // eslint-disable-line
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb(); // eslint-disable-line
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map); // eslint-disable-line
        }
    });
};

/**
 * Toggle map
 */

let toggleButton = document.getElementById('mapToggle');
let gMap = document.getElementById('map-container');
gMap.style.display = 'none'; 
toggleButton.addEventListener('click', (e)=>{ 
    e.preventDefault(); 
    if(gMap.style.display==='none') { 
        toggleButton.innerHTML = 'Hide Map';
        gMap.style.display='block'; 
    } else { 
        toggleButton.innerHTML = 'Show Map';
        gMap.style.display='none'; 
    } 
});

/**
 * Get current restaurant from page URL.
 */

fetchRestaurantFromURL = (callback) => { // eslint-disable-line
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id'); // eslint-disable-line
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'; // eslint-disable-line
        callback(error, null); // eslint-disable-line
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => { // eslint-disable-line
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error); // eslint-disable-line
                return;
            }
            fillRestaurantHTML(); // eslint-disable-line
            callback(null, restaurant);
        });
    }
};

/** 
* For fetching I used snippets and ideas from here: https://github.com/udacity/mws-restaurant-stage-3/pull/3/files 
* Author: Sharynne Azhar
**/

fetchReviewsFromURL = (callback) => { // eslint-disable-line
    if (self.reviews) { // reviews already fetched!
        callback(null, self.reviews);
        return;
    }
    const id = getParameterByName('id'); // eslint-disable-line
    if (!id) { // no id found in URL
        error = 'No review id in URL'; // eslint-disable-line
        callback(error, null); // eslint-disable-line
    } else {
        DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => { // eslint-disable-line
            self.reviews = reviews;
            if (!reviews) {
                fillReviewsHTML(null);
                return;
            }
            fillReviewsHTML();
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */

let svg = document.getElementById('svg');

fillRestaurantHTML = (restaurant = self.restaurant) => { // eslint-disable-line
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
    name.classList.add('focus');

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    address.classList.add('focus');
    address.setAttribute('aria-label','address of the restaurant ' + restaurant.address);

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = `${restaurant.name}`;
    image.src = DBHelper.imageUrlForRestaurant(restaurant); // eslint-disable-line
    image.srcset = `/minimizedImages/${restaurant.photo_large_1x} 1x,
                  /minimizedImages/${restaurant.photo_2x} 2x`;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    if (restaurant.is_favorite === 'false') {
        svg.innerHTML = '<svg id="fav" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path d="M12 9.229c.234-1.12 1.547-6.229 5.382-6.229 2.22 0 4.618 1.551 4.618 5.003 0 3.907-3.627 8.47-10 12.629-6.373-4.159-10-8.722-10-12.629 0-3.484 2.369-5.005 4.577-5.005 3.923 0 5.145 5.126 5.423 6.231zm-12-1.226c0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-7.962-9.648-9.028-12-3.737-2.338-5.262-12-4.27-12 3.737z"/></svg>';
    } else {
        svg.innerHTML = '<svg id="fav" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path d="M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z"/></svg>';
    }

    /* Lazyloads the images */
    new LazyLoad(); // eslint-disable-line


    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML(); // eslint-disable-line
    }
    // fill reviews
    fetchReviewsFromURL(); // eslint-disable-line
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => { // eslint-disable-line
    const hours = document.getElementById('restaurant-hours');
    hours.setAttribute('aria-label','opening hours of the restaurant');
    hours.classList.add('focus');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        day.setAttribute('tabindex',0);
        day.setAttribute('aria-label', `The opening hours in ${key}`);
        day.classList.add('focus');
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        time.setAttribute('tabindex',0);
        time.classList.add('focus');
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */

const fillReviewsHTML = (reviews = self.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    title.setAttribute('tabindex',0);
    title.classList.add('focus');
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review)); // eslint-disable-line
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */

createReviewHTML = (review) => { // eslint-disable-line
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    name.setAttribute('class', 'name' );
    li.setAttribute('tabindex',0);
    li.classList.add('focus');
    li.setAttribute('aria-label', `Review from ${review.name}`);
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = moment(review.createdAt).format('ddd, MMM Do YYYY'); // eslint-disable-line
    date.setAttribute('class', 'date' );
    date.setAttribute('tabindex',0);
    date.classList.add('focus_white');
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.setAttribute('class', 'rating' );
    rating.setAttribute('tabindex',0);
    rating.classList.add('focus');
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.setAttribute('class', 'comments' );
    comments.setAttribute('tabindex',0);
    comments.classList.add('focus');
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */

fillBreadcrumb = (restaurant=self.restaurant) => { // eslint-disable-line
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */

getParameterByName = (name, url) => { // eslint-disable-line
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/* Creating comment form */

let radioButtonValue = '';

function ratingTracker(radioButton) { // eslint-disable-line
    radioButtonValue = radioButton.value;
    const ratingSign = document.getElementById('ratingSign');
    ratingSign.textContent = radioButtonValue + ' points';

    for (let i=1; i <= 5; i++) {
        let radioElement= document.getElementById(i);
        if (i<=radioButtonValue) {
            radioElement.classList.add('radioInputSpanBackground');
        } else {
            radioElement.classList.remove('radioInputSpanBackground');
        }
    }
}

function handleFavorite(restaurant = self.restaurant) {
    const filledHeart = '<svg id="fav" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path d="M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z"/></svg>';
    const emptyHeart = '<svg id="fav" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path d="M12 9.229c.234-1.12 1.547-6.229 5.382-6.229 2.22 0 4.618 1.551 4.618 5.003 0 3.907-3.627 8.47-10 12.629-6.373-4.159-10-8.722-10-12.629 0-3.484 2.369-5.005 4.577-5.005 3.923 0 5.145 5.126 5.423 6.231zm-12-1.226c0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-7.962-9.648-9.028-12-3.737-2.338-5.262-12-4.27-12 3.737z"/></svg>';

    if (svg.innerHTML.includes('3.737z')) {
        
        DBHelper.addRestaurantToFavorites(restaurant.id, true, (err, res) => { // eslint-disable-line
            svg.innerHTML = filledHeart;
        });
    } else {
        
        DBHelper.addRestaurantToFavorites(restaurant.id, false, (err, res) => { // eslint-disable-line
            svg.innerHTML = emptyHeart;
        });
    }
}

svg.addEventListener('click', function() {
    handleFavorite();
});

let online_offline = '';

if (navigator.onLine) {
    online_offline = true;
    console.log(online_offline); // eslint-disable-line
} else {
    online_offline = false;
    console.log(online_offline); // eslint-disable-line
}

let review = '';
let name = '';
let comment = '';
let rating = '';
let id = '';

window.addEventListener('offline', function(e) { // eslint-disable-line
    online_offline = false;
    console.log(online_offline); // eslint-disable-line
}, false);

/** 
* For the posting I used snippets and ideas from here: https://github.com/udacity/mws-restaurant-stage-3/pull/3/files 
* Author: Sharynne Azhar
**/

const makeReview = (restaurant = self.restaurant) => { // eslint-disable-line
    name = document.getElementById('nameInput').value;
    comment = document.getElementById('comment').value;
    rating = radioButtonValue;
    id = restaurant.id;
    if (online_offline === true) {  
        if (name != '' && comment != '') {
            review = {
                restaurant_id: id,
                name: name,
                rating: rating,
                comments: comment,
            };
            fetch(DBHelper.DATABASE_URL + '/reviews', { // eslint-disable-line
                method: 'post',
                body: JSON.stringify(review)
            })
                .then(response => response.json())
                .catch(error => { // eslint-disable-line
                    console.log('Something went wrong submitting your review'); // eslint-disable-line
                });
            window.location.reload();
        }
        return false;
    } else {
        console.log('Offline!'); // eslint-disable-line
        if (name != '' && comment != '') {
            review = {
                restaurant_id: id,
                name: name,
                rating: rating,
                comments: comment,
            };
            return false;
        }
    }
};

window.addEventListener('online', function(e) { // eslint-disable-line
    online_offline = true;
    if (name != '' && comment != '') {
        fetch(DBHelper.DATABASE_URL + '/reviews', { // eslint-disable-line
            method: 'post',
            body: JSON.stringify(review)
        })
            .then(response => response.json())
            .catch(error => { // eslint-disable-line
                console.log('Something went wrong submitting your review'); // eslint-disable-line
            });
        window.location.reload();
    }
    return false;
});
