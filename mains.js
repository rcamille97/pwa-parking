console.log('hello depuis main');
const locationsDiv = document.querySelector('#locations');

function loadLocations(locations) {
    fetch('https://us-central1-pwa-parking.cloudfunctions.net/getLocations')
        .then(response => {
            response.json()
                .then(locations => {
                    
                    const allLocations = locations.map(l => `<div><b>${l.userName} s'est garé ici :  (${l.longitude},${l.latitude}) </b> <b> le ${convertToDate(l.time)}</b> </div>`)
                            .join('');
            
                            locationsDiv.innerHTML = allLocations; 
                });
        })
        .catch(console.error);
}

function convertToDate(timestamp){
    var date = new Date(timestamp);
    var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 9)
        minutes = '0' + minutes
    var seconds = date.getSeconds()
    if (seconds < 9)
        seconds = '0' + seconds
    return day + " " + month + " " + year + " à " + hours + "h" + minutes + "min" + seconds + "sec";
}
// 3.2
if(navigator.serviceWorker) {
	// Enregistrement du service worker
    navigator.serviceWorker
        .register('sw.js')
        
        // 8.4 Récupération ou création d'une souscription auprès d'un push service
        .then(registration =>{
        
        	// tentative d'obtention d'une souscription
            // public vapid key générée par web-push, en prod appel d'api via fetch plutôt que static
            const publicKey = "BIYh2FJ7M2cXco8V1VpRPofTF92i3NK1Jq54Bs6Sx_qSh782qv5En1DDcUFtD06Z8RRVY6X2wxxlJYsSUGnRB40";
            registration.pushManager.getSubscription().then(subscription => {
            
            	// Déjà une souscription, on l'affiche
                if(subscription){
                    console.log("subscription", subscription);
                    extractKeysFromArrayBuffer(subscription);
                    return subscription;
                }
                
                // Pas de souscription
                else{
                    // demande de souscription (clef convertie en buffer pour faire la demande)
                    const convertedKey = urlBase64ToUint8Array(publicKey);
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedKey
                    })
                    .then(newSubscription => {
                    	// Affiche le résultat pour vérifier
                        console.log('newSubscription', newSubscription);
                        extractKeysFromArrayBuffer(newSubscription);
                        return newSubscription;
                    })

                }
            })
        })
        .catch(err => console.error('service worker NON enregistré', err));
}

// 8.4 Récupération ou création d'une souscription auprès d'un push service
// Fonction pour récupérer les clés de la souscription afin de les utiliser pour notification
function extractKeysFromArrayBuffer(subscription){
    // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
    const keyArrayBuffer = subscription.getKey('p256dh');
    const authArrayBuffer = subscription.getKey('auth');
    const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(keyArrayBuffer)));
    const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authArrayBuffer)));
    console.log('p256dh key', keyArrayBuffer, p256dh);
    console.log('auth key', authArrayBuffer, auth);
    
    // Paramètres nécessaires à l'objet de notification pushSubscription
    console.log('endpoint :');
    console.dir(subscription.endpoint);
    console.log('p256dh key :', p256dh);
    console.log('auth key :', auth);
}


// 8.4 Récupération ou création d'une souscription auprès d'un push service
// Fonction pour convertir string en array buffer pour envoie au push service
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

loadLocations(locations);