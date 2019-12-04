const userNameField = document.querySelector('#userName');
const latitudeField = document.querySelector('#latitude');
const longitudeField = document.querySelector('#longitude');
const addLocationForm = document.querySelector('#add-location-form');

addLocationForm.addEventListener('submit', evt => {
    evt.preventDefault();
    
    const payload = {
        id: Date.now(),
        userName: userNameField.value,
        latitude: latitudeField.value,
        longitude: longitudeField.value,
        time : Date.now()
    }
    console.log(payload);

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
      // 9.5 Ajouter les données en local lors de la déconnexion
      // Hors ligne le POST échoue
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
      .then(() => {
        clearForm();
      })
      .catch(error => console.error(error));
     
      // 9.5 Ajouter les données en local lors de la déconnexion
      // Vide le formulaire
      const clearForm = () => {
        
        userNameField.value = '',
        latitudeField.value = '',
        longitudeField.value = '',
        userNameField.focus();
      }; 
})

