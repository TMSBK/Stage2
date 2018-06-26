/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /** 
   * For the indexedDB I used snippets and ideas from here: https://github.com/udacity/mws-restaurant-stage-3/pull/3/files 
   * Author: Sharynne Azhar
  **/

  static createRestaurantsStore(restaurants) {

    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    var open = indexedDB.open('RestaurantDataBase', 1);

    open.onupgradeneeded = function() {
      var db = open.result;
      db.createObjectStore('RestaurantObjectStore', { keyPath: 'id' });
      restaurants.forEach(function(restaurant) {
        db.createObjectStore('ReviewsStore-' + restaurant.id, { keyPath: 'id' });
      });
    };

    open.onerror = function(err) {
      console.error('IndexeDB error: ' + err.target.errorCode);
    };

    open.onsuccess = function() {
      var db = open.result;
      var tx = db.transaction('RestaurantObjectStore', 'readwrite');
      var store = tx.objectStore('RestaurantObjectStore');

      restaurants.forEach(function(restaurant) {
        store.put(restaurant);
      });

      tx.oncomplete = function() {
        db.close();
      };
    };
  }

  static createReviewsStore(restaurantId, reviews) {
    // Get the compatible IndexedDB version
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open('RestaurantDataBase', 1);

    // Create the schema
    open.onupgradeneeded = function() {
      var db = open.result;
      db.createObjectStore('ReviewsStore-' + restaurantId, { keyPath: 'id' });
    };


    open.onerror = function(err) {
      console.error('IndexeDB error: ' + err.target.errorCode);
    };

    open.onsuccess = function() {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction('ReviewsStore-' + restaurantId, 'readwrite');
      var store = tx.objectStore('ReviewsStore-' + restaurantId);

      // Add the restaurant data
      reviews.forEach(function(review) {
        store.put(review);
      });

      // Close the db when the transaction is done
      tx.oncomplete = function() {
        db.close();
      };
    };
  }



  static getCachedData(callback) {
    var restaurants = [];

    // Get the compatible IndexedDB version
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    var open = indexedDB.open('RestaurantDataBase', 1);

    open.onsuccess = function() {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction('RestaurantObjectStore', 'readwrite');
      var store = tx.objectStore('RestaurantObjectStore');
      var getData = store.getAll();

      getData.onsuccess = function() {
        callback(null, getData.result);
      };

      // Close the db when the transaction is done
      tx.oncomplete = function() {
        db.close();
      };
    };

  }

  static getCachedReviews(restaurantId, callback) {
    var reviews = [];

    // Get the compatible IndexedDB version
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    var open = indexedDB.open('RestaurantDataBase', 1);

    open.onsuccess = function() {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction('ReviewsStore-' + restaurantId, 'readwrite');
      var store = tx.objectStore('ReviewsStore-' + restaurantId);
      var getData = store.getAll();

      getData.onsuccess = function() {
        callback(null, getData.result);
      };

      // Close the db when the transaction is done
      tx.oncomplete = function() {
        db.close();
      };
    };

  }


  /**
  * Fetch all restaurants.
  */

  static fetchRestaurants(callback) {
    if (navigator.onLine) {

      fetch(DBHelper.DATABASE_URL + '/restaurants', {
      })
      .then(response => response.json()) 
      .then(restaurantsJSON => {
          let restaurants = restaurantsJSON; 
          restaurants.forEach(restaurant => {
              restaurant.photo_small_1x = `${restaurant.id}-300_1x.jpg`;
              restaurant.photo_large_1x = `${restaurant.id}-600_1x.jpg`;
          });
          DBHelper.createRestaurantsStore(restaurants); // Cache restaurants
          callback(null, restaurants);
      }) 
      .catch(err => {
          const error = `Request failed. Returned status of ${err.status}`;
          callback(error, null);
        });

    } else {
        console.log('Browser Offline - Using cached data!');
        DBHelper.getCachedData((error, restaurants) => {
          if (restaurants.length > 0) {
            callback(null, restaurants);
           }
      });
    }
  } 

/* 
Fetching reviews
*/

  static fetchReviews(callback) {
    if (navigator.onLine) {
      fetch(DBHelper.DATABASE_URL + '/reviews', {
      })
      .then(response => response.json())
      .then(reviews => {
        callback(null, reviews);
      })
      .catch(err => {
        const error = `Request failed. Returned status of ${err.status}`;
        callback(error, null);
      });
    } else {
      
    }
  }
  

  static fetchReviewsByRestaurantId(id, callback) {
    if(navigator.onLine) {
    fetch(DBHelper.DATABASE_URL + '/reviews/?restaurant_id=' + id, {
    })
    .then(response => response.json())
    .then(reviews => {
      reviews = reviews.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      DBHelper.createReviewsStore(id, reviews);
      callback(null, reviews);
    })
    .catch(err => {
      const error = `Request failed. Returned status of ${err.status}`;
      callback(error, null);
    });
  } else {
      console.log('Browser Offline - Using cached data!');
      DBHelper.getCachedReviews((error, id, reviews) => {
            console.log('lófasz');
            callback(null, reviews);

      });

  }
  }

  static addRestaurantToFavorites(restaurantId, isFav, callback) {
    const url = DBHelper.DATABASE_URL + '/restaurants/' + restaurantId + '/?is_favorite=' + isFav;
    fetch(url, { method: 'put' })
    .then(response => callback(null, 1))
    .catch(err => callback(err, null));
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}