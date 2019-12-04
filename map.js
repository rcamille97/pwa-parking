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
            const payload = {
                id: Date.now(),
                userName: "test",
                latitude: event.latLng,
                longitude: event.latLng,
                time : Date.now()
            }
            fetch('https://us-central1-pwa-parking.cloudfunctions.net/addLocation',  { 
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                /*'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Methods': "POST",
                'Access-Control-Allow-Headers': "X-Request-With, content-type"*/
                },
                body: JSON.stringify(payload)
            })
            .then(resp => {
                console.log("POST FETCH => ", + resp);
                console.log(resp);
            })
            .catch(error => {
                console.log(error);
                // test si service worker ET "syncManager" existent
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                console.log('SyncManager supported by browser');
                console.log('we are probably offline');
                navigator.serviceWorker.ready.then(registration => {
                    return putLocation(payload, payload.id).then(() => {
                    // Tague le service de synchronisation pour l'utiliser après
                    return registration.sync.register('sync-locations')
                    });
                })
                } else {
                    // TODO browser does NOT support SyncManager: send data to server via ajax
                    console.log('SyncManager NOT supported by your browser');
                }
            })
            .catch(error => console.error(error));

          addMarker(event.latLng, payload["id"]);
        });

        
      }

      markers.forEach(marker => {
        marker.addListener('click', function(event) {
            deleteMarker(marker)
            marker.setMap(null)
            //delete
        });
    });
      // Adds a marker to the map and push to the array.
      function addMarker(location,id) {
        var marker = new google.maps.Marker({
          position: location,
          map: map
        });
        markers.push({"marker" : marker, "id" : id});
      }

      function deleteMarker(marker){
        const payload = {
            id: marker["id"]
        }
        console.log(payload);
    
        fetch('https://us-central1-pwa-parking.cloudfunctions.net/deleteLocation',  { 
            method: 'DELETE', 
            headers: {
              'Content-Type': 'application/json',
            },
            params : {
                'key' : 'id',
                'value' : marker["id"]
            }
            //body: JSON.stringify(payload)
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

      }
    