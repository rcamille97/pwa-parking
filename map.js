var map;
var markers = [];

var currentUser = firebase.auth().currentUser;
//get current user

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
  console.log(currentUser)
  showMarkers()
}

function showMarker(location,id, user){
  var infowindow = new google.maps.InfoWindow({
    content: user + " s'est garé ici à " + id
  });
  var marker = new google.maps.Marker({
    position: location,
    icon: 'images/multiplo.png',
    map: map
  });
  marker.addListener('click', function(event) {
    if (currentUser != null) {
      userId = currentUser.providerId;
      if (userId != user){
        infowindow.open(map, marker);
      }else{
        deleteMarker(marker)
      }
    }
  });
  markers.push({"marker" : marker, "id" : id, "userId" : user});
}
// Adds a marker to the map and push to the array.
function addMarker(location,id) {
  const payload = {
    id: parseInt(id),
    userId : currentUser.providerId,
    userName: "test",
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
    marker.setMap(null)
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
  setMapOnAll(map);
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function getMarkers(){
  fetch('https://us-central1-pwa-parking.cloudfunctions.net/getLocations')
        .then(response => {
            response.json()
                .then(locations => {
                    
                  locations.forEach(l => {
                    showMarker(new google.maps.LatLng({lat: l.latitude, lng: l.longitude}),l.id,l.userId)
                  });
                });
        })
        .catch(console.error);
}
