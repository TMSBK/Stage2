class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){var t;fetch(DBHelper.DATABASE_URL,{}).then(e=>e.json()).then(t=>{const n=t;n.forEach(e=>{e.photo_small_1x=`${e.id}-300_1x.jpg`,e.photo_large_1x=`${e.id}-600_1x.jpg`}),e(null,n)}).catch(t=>(t=t,void e(t,null)))}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,s)=>{if(n)t(n,null);else{const n=s.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,s)=>{if(n)t(n,null);else{const n=s.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,s)=>{if(n)t(n,null);else{const n=s.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((s,a)=>{if(s)n(s,null);else{let s=a;"all"!=e&&(s=s.filter(t=>t.cuisine_type==e)),"all"!=t&&(s=s.filter(e=>e.neighborhood==t)),n(null,s)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),s=t.filter((e,n)=>t.indexOf(e)==n);e(null,s)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),s=t.filter((e,n)=>t.indexOf(e)==n);e(null,s)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,neighborhoods,cuisines;navigator.serviceWorker?navigator.serviceWorker.register("../sw.js").then(function(){console.log("Registration worked!")}).catch(function(){console.log("Registration failed!")}):console.log("This browser doesn't support Service Worker!");var markers=[];let restaurant;var map;document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,n.setAttribute("role","Option"),t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,n.setAttribute("role","Option"),t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,s=t.selectedIndex,a=e[n].value,r=t[s].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,r,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),n=document.createElement("img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e)+".jpg",n.srcset=`/minimizedImages/${e.photo_small_1x} 1x,\n                  /minimizedImages/${e.photo_2x} 2x`,n.alt=`${e.name}`,t.append(n);const s=document.createElement("h3");s.innerHTML=e.name,s.setAttribute("tabindex",0),s.classList.add("focus"),t.append(s);const a=document.createElement("p");a.innerHTML=e.neighborhood,a.setAttribute("tabindex",0),a.classList.add("focus"),t.append(a);const r=document.createElement("p");r.innerHTML=e.address,r.setAttribute("tabindex",0),r.classList.add("focus"),t.append(r);const l=document.createElement("a");return l.innerHTML="View Details",l.setAttribute("aria-label",`View details of ${e.name}`),l.href=DBHelper.urlForRestaurant(e),t.append(l),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{const t=document.getElementById("restaurant-name");t.innerHTML=e.name,t.classList.add("focus");const n=document.getElementById("restaurant-address");n.innerHTML=e.address,n.classList.add("focus"),n.setAttribute("aria-label","address of the restaurant "+e.address);const s=document.getElementById("restaurant-img");s.className="restaurant-img",s.alt=`${e.name}`,s.src=DBHelper.imageUrlForRestaurant(e),s.srcset=`/minimizedImages/${e.photo_large_1x} 1x,\n                  /minimizedImages/${e.photo_2x} 2x`,document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");t.setAttribute("aria-label","opening hours of the restaurant"),t.classList.add("focus");for(let n in e){const s=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,a.setAttribute("tabindex",0),a.setAttribute("aria-label",`The opening hours in ${n}`),a.classList.add("focus"),s.appendChild(a);const r=document.createElement("td");r.innerHTML=e[n],r.setAttribute("tabindex",0),r.classList.add("focus"),s.appendChild(r),t.appendChild(s)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",n.setAttribute("tabindex",0),n.classList.add("focus"),t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const s=document.getElementById("reviews-list");e.forEach(e=>{s.appendChild(createReviewHTML(e))}),t.appendChild(s)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,n.setAttribute("class","name"),t.setAttribute("tabindex",0),t.classList.add("focus"),t.setAttribute("aria-label",`Review from ${e.name}`),t.appendChild(n);const s=document.createElement("p");s.innerHTML=e.date,s.setAttribute("class","date"),s.setAttribute("tabindex",0),s.classList.add("focus_white"),t.appendChild(s);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,a.setAttribute("class","rating"),a.setAttribute("tabindex",0),a.classList.add("focus"),t.appendChild(a);const r=document.createElement("p");return r.innerHTML=e.comments,r.setAttribute("class","comments"),r.setAttribute("tabindex",0),r.classList.add("focus"),t.appendChild(r),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null});