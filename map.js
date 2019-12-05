var map;
var markers = [];
var firebaseConfig = {
  apiKey: "AIzaSyDKLoSf1KtAZ9Xc_j6hWtAtVmHRIDg0AvY",
  authDomain: "pwa-parking.firebaseapp.com",
  databaseURL: "https://pwa-parking.firebaseio.com",
  projectId: "pwa-parking",
  storageBucket: "pwa-parking.appspot.com",
  messagingSenderId: "40154814758",
  appId: "1:40154814758:web:37e0ee7d1046693d1d09e7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var currentUser

var index

//get current user
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user
  }
});


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 42.298326, lng: 9.153767},
      zoom: 20,
      disableDefaultUI: true
  });
  // This event listener will call addMarker() when the map is clicked.
  map.addListener('click', function(event) {
    addMarker(event.latLng, Date.now());
  });
  showMarkers()
}

function showMarker(location,id, user){
  var date = new Date(parseInt(id))
  console.log(date)
  if(date.getMinutes() < 10){
    minutes = "0" + date.getMinutes()
  }else{
    minutes = date.getMinutes()
  }
  var infowindow = new google.maps.InfoWindow({
    content: user.userName + " s'est garé ici à " + date.getHours() + "h" + minutes
  });
  var marker = new google.maps.Marker({
    position: location,
    icon: 'images/multiplo.png',
    map: map
  });
  markers.push({"marker" : marker, "id" : id});

  marker.addListener('click', function(event) {
    userId = currentUser.uid;
    if ((userId != user.userId) && user.userId){
      infowindow.open(map, marker);
      console.log(userId)
      console.log(user.userId)
    }else{
          deleteMarker(marker,id)
      }
  });
  index = index + 1
  updateUI()
  
  
}
// Adds a marker to the map and push to the array.
function addMarker(location,id) {
  
  const payload = {
    id: parseInt(id),
    userId : currentUser.uid,
    userName: currentUser.email,
    latitude: location.lat(),
    longitude: location.lng(),
    time : parseInt(id)
}
fetch('https://us-central1-pwa-parking.cloudfunctions.net/addLocation',  { 
    method: 'POST', 
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
})
.then(resp => {
    console.log("POST FETCH => ", + resp);
    console.log(resp);
})
.catch(error => {
    console.log(error);
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
    console.log('SyncManager supported by browser');
    console.log('we are probably offline');
    navigator.serviceWorker.ready.then(registration => {
        return putLocation(payload, payload.id).then(() => {
        return registration.sync.register('sync-locations')
        });
    })
    } else {
        console.log('SyncManager NOT supported by your browser');
    }
})
  showMarker(location,id, currentUser.providerId)
}

function deleteMarker(marker, id){
  const payload = {
    'id': id
  }
  console.log(payload);

  fetch('https://us-central1-pwa-parking.cloudfunctions.net/deleteLocation?id=' + id,  { 
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(payload)
    })
    .then(resp => {
        console.log("POST FETCH => ", + resp);
      console.log(resp);
    })
    .catch(error => {
        console.log(error);
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        console.log('SyncManager supported by browser');
        console.log('we are probably offline');
        navigator.serviceWorker.ready.then(registration => {
          return putLocation(payload, payload.id).then(() => {
            return registration.sync.register('sync-locations')
          });
        })
      } else {
          console.log('SyncManager NOT supported by your browser');
        }
    })
    .catch(error => console.error(error));

    index = index - 1
    marker.setMap(null)
   updateUI()
}


// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i]["marker"].setMap(map);
  }
  
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}
// Shows any markers currently in the array.
function showMarkers() {
  getMarkers()
  index = markers.length
  setMapOnAll(map);
  
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  markers.forEach(marker => {
      deleteMarker(marker["marker"],marker['id'])
  });
  clearMarkers();
  markers = [];
}

function getMarkers(){
  fetch('https://us-central1-pwa-parking.cloudfunctions.net/getLocations')
        .then(response => {
            response.json()
                .then(locations => {
                    
                  locations.forEach(l => {
                    showMarker(new google.maps.LatLng({lat: l.latitude, lng: l.longitude}),l.id,l)
                  });
                });
        })
        .catch(console.error);
}

function updateUI(){
  const infoDiv = document.querySelector('#footerInfo');
  var placesRestantes = 150 - index
  if (placesRestantes >1 )
    infoDiv.innerHTML = "Nombre de place occupées: " + index + ". Il reste " + placesRestantes + " places.";
  else 
    infoDiv.innerHTML = "Nombre de place occupées: " + index + ". Il reste " + placesRestantes + " place.";
}


