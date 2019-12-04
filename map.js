var map;
var markers = [];


function initMap() {
  //var haightAshbury = {lat: 37.769, lng: -122.446};

  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 42.298326, lng: 9.153767},
      zoom: 20,
      disableDefaultUI: true
  });

  // This event listener will call addMarker() when the map is clicked.
  map.addListener('click', function(event) {
    addMarker(event.latLng, Date.now());
  });

  /*markers.forEach(marker => {
    marker.addListener('click', function(event) {
      console.log("AAAAA")
    });
  })*/
  showMarkers()
}

function showMarker(location,id){
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  marker.addListener('click', function(event) {
    console.log("AAAAA")
    deleteMarker(marker)
  });
  markers.push({"marker" : marker, "id" : id});
}
// Adds a marker to the map and push to the array.
function addMarker(location,id) {
  const payload = {
    id: parseInt(id),
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
  showMarker(location,id)
}

function deleteMarker(marker){
  /*const payload = {
    'key' : 'id',
    'value' : marker["id"]
  }*/
  const payload = {
    'id': marker["id"]
  }
  console.log(payload);

  fetch('https://us-central1-pwa-parking.cloudfunctions.net/deleteLocation',  { 
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
      },
      params : JSON.stringify(payload),
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
                    showMarker(new google.maps.LatLng({lat: l.latitude, lng: l.longitude}),l.id)
                  });
                });
        })
        .catch(console.error);
}