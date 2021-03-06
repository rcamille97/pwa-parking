var map;
var markers = [];
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
    if (currentUser === undefined) {
      console.log("please wait user defined")
    }else {
      addMarker(event.latLng, Date.now());
    }
  });
  showMarkers()
}

function showMarker(location, id, object){
  var date = new Date(parseInt(id))
  console.log(date)
  if(date.getMinutes() < 10){
    minutes = "0" + date.getMinutes()
  }else{
    minutes = date.getMinutes()
  }
  var marker = new google.maps.Marker({
    position: location,
    icon: 'images/multiplo.png',
    map: map
  });
  markers.push(id = {"marker" : marker, "id" : id});

  addMarkerListener(marker, id, object);

  index = index + 1
  updateUI()
  return marker;
}

function addMarkerListener(marker, dbId, object) {
  var date = new Date(parseInt(object.id))
  var infowindow = new google.maps.InfoWindow({
    content: object.userName + " s'est garé ici à " + date.getHours() + "h" + minutes
  });
  marker.addListener('click', function(event) {
    userId = currentUser.uid;
    if ((userId != object.userId) && object.userId){
      infowindow.open(map, marker);
      console.log(userId);
    }else{
          deleteMarker(marker, object.id);
      }
  });
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
  object = new Object();
  object.id = parseInt(id);
  object.userId = currentUser.uid;
  object.userName = currentUser.email;
  object.latitude = location.lat();
  object.longitude = location.lng();
  object.time = parseInt(id);

  return showMarker(location, id, object);
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
                    showMarker(new google.maps.LatLng({lat: l.latitude, lng: l.longitude}),l.id, l)
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


