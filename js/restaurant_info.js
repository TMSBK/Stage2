let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // reviews already fetched!
    callback(null, self.reviews);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No review id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        fillReviewsHTML(null);
        return;
      }
      fillReviewsHTML();
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.classList.add("focus");

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.classList.add("focus");
  address.setAttribute("aria-label","address of the restaurant " + restaurant.address);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `/minimizedImages/${restaurant.photo_large_1x} 1x,
                  /minimizedImages/${restaurant.photo_2x} 2x`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviewsFromURL();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute("aria-label","opening hours of the restaurant");
  hours.classList.add("focus");
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.setAttribute("tabindex",0);
    day.setAttribute("aria-label", `The opening hours in ${key}`);
    day.classList.add("focus");
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute("tabindex",0);
    time.classList.add("focus");
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.reviews) => {
  /*console.log(reviews)*/
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.setAttribute("tabindex",0);
  title.classList.add("focus");
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute("class", "name" );
  li.setAttribute("tabindex",0);
  li.classList.add("focus");
  li.setAttribute("aria-label", `Review from ${review.name}`);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = moment(review.createdAt).format('ddd, MMM Do YYYY');
  date.setAttribute("class", "date" );
  date.setAttribute("tabindex",0);
  date.classList.add("focus_white");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("class", "rating" );
  rating.setAttribute("tabindex",0);
  rating.classList.add("focus");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute("class", "comments" );
  comments.setAttribute("tabindex",0);
  comments.classList.add("focus");
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

let radioButtonValue = '';

function ratingTracker(radioButton) {
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

const makeReview = (restaurant = self.restaurant) => {

  let name = document.getElementById('nameInput').value;
  let comment = document.getElementById('comment').value;
  let rating = radioButtonValue;
  let id = restaurant.id;

  if (name != '' && comment != '') {
    let review = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment,
    };

    fetch(DBHelper.DATABASE_URL + '/reviews', {
      method: 'post',
      body: JSON.stringify(review)
    })
    .then(response => response.json())
    .catch(error => {
      console.log('Something went wrong submitting your review');
    });

    window.location.reload();
  }

  return false;
};

/*function deleteReview(review_id) {
      fetch(DBHelper.DATABASE_URL + '/reviews/' + review_id, {
      method: 'delete',
    });
}*/