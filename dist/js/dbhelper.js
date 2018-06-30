class DBHelper{static get DATABASE_URL(){return"http://localhost:1337"}static createRestaurantsStore(e){var t=(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("RestaurantDataBase",1);t.onupgradeneeded=function(){var n=t.result;n.createObjectStore("RestaurantObjectStore",{keyPath:"id"}),e.forEach(function(e){n.createObjectStore("ReviewsStore-"+e.id,{keyPath:"id"})})},t.onerror=function(e){console.error("IndexeDB error: "+e.target.errorCode)},t.onsuccess=function(){var n=t.result,a=n.transaction("RestaurantObjectStore","readwrite"),r=a.objectStore("RestaurantObjectStore");e.forEach(function(e){r.put(e)}),a.oncomplete=function(){n.close()}}}static createReviewsStore(e,t){var n=(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("RestaurantDataBase",1);n.onupgradeneeded=function(){n.result.createObjectStore("ReviewsStore-"+e,{keyPath:"id"})},n.onerror=function(e){console.error("IndexeDB error: "+e.target.errorCode)},n.onsuccess=function(){var a=n.result,r=a.transaction("ReviewsStore-"+e,"readwrite"),o=r.objectStore("ReviewsStore-"+e);t.forEach(function(e){o.put(e)}),r.oncomplete=function(){a.close()}}}static getCachedData(e){var t=(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("RestaurantDataBase",1);t.onsuccess=function(){var n=t.result,a=n.transaction("RestaurantObjectStore","readwrite"),r=a.objectStore("RestaurantObjectStore").getAll();r.onsuccess=function(){e(null,r.result)},a.oncomplete=function(){n.close()}}}static getCachedReviews(e,t){var n=(window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB).open("RestaurantDataBase",1);n.onsuccess=function(){var a=n.result,r=a.transaction("ReviewsStore-"+e,"readwrite"),o=r.objectStore("ReviewsStore-"+e).getAll();o.onsuccess=function(){t(null,o.result)},r.oncomplete=function(){a.close()}}}static fetchRestaurants(e){navigator.onLine?fetch(DBHelper.DATABASE_URL+"/restaurants",{}).then(e=>e.json()).then(t=>{let n=t;n.forEach(e=>{e.photo_small_1x=`${e.id}-300_1x.jpg`,e.photo_large_1x=`${e.id}-600_1x.jpg`}),DBHelper.createRestaurantsStore(n),e(null,n)}).catch(t=>{const n=`Request failed. Returned status of ${t.status}`;e(n,null)}):(console.log("Browser Offline - Using cached data!"),DBHelper.getCachedData((t,n)=>{n.length>0&&e(null,n)}))}static fetchReviews(e){navigator.onLine&&fetch(DBHelper.DATABASE_URL+"/reviews",{}).then(e=>e.json()).then(t=>{e(null,t)}).catch(t=>{const n=`Request failed. Returned status of ${t.status}`;e(n,null)})}static fetchReviewsByRestaurantId(e,t){navigator.onLine?fetch(DBHelper.DATABASE_URL+"/reviews/?restaurant_id="+e,{}).then(e=>e.json()).then(n=>{n=n.sort(function(e,t){return new Date(t.createdAt)-new Date(e.createdAt)}),DBHelper.createReviewsStore(e,n),t(null,n)}).catch(e=>{const n=`Request failed. Returned status of ${e.status}`;t(n,null)}):(console.log("Browser Offline - Using cached data!"),DBHelper.getCachedReviews(e,(e,n)=>{t(null,n)}))}static addRestaurantToFavorites(e,t,n){const a=DBHelper.DATABASE_URL+"/restaurants/"+e+"/?is_favorite="+t;fetch(a,{method:"put"}).then(e=>n(null,1)).catch(e=>n(e,null))}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,a)=>{if(n)t(n,null);else{const n=a.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((a,r)=>{if(a)n(a,null);else{let a=r;"all"!=e&&(a=a.filter(t=>t.cuisine_type==e)),"all"!=t&&(a=a.filter(e=>e.neighborhood==t)),n(null,a)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),a=t.filter((e,n)=>t.indexOf(e)==n);e(null,a)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),a=t.filter((e,n)=>t.indexOf(e)==n);e(null,a)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}