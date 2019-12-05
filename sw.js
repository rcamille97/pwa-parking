const cacheName = 'places de parking';

self.importScripts('idb/idb.js', 'idb/database.js');

self.addEventListener('install', (evt) => {
    console.log(`sw installé à ${new Date().toLocaleTimeString()}`);
 
    const cachePromise = caches.open(cacheName).then(cache => {
        return cache.addAll([
            'idb/idb.js',
            'idb/database.js',
            'index.html',
            'main.js',
            'style.css',
            'vendors/bootstrap4.min.css',
            'add_place.html',
            'add_place.js',
            'contact.html',
            'contact.js',
            'login.js',
            'signout.js',
            'authLogin.html'
        ])
        .then(console.log('cache initialisé'))
        .catch(console.err);
    });
 
    evt.waitUntil(cachePromise);
 
});

self.addEventListener('activate', (evt) => {
    console.log(`sw activé à ${new Date().toLocaleTimeString()}`);    
});
 
self.addEventListener('fetch', (evt) => {
    if(evt.request.method === 'POST') {
        return;
    }
    console.log('sw intercepte la requête suivante via fetch', evt);
    console.log('url interceptée', evt.request.url);
});

self.addEventListener('fetch', (evt) => {

    if(evt.request.method === 'POST') {
        return;
    }

    evt.respondWith(
        // on doit d'abord faire une requête sur le réseau de ce qui a été intercepté
        fetch(evt.request).then(res => {
            console.log("url récupérée depuis le réseau", evt.request.url);
            // mettre dans le cache le résultat de cette réponse : en clef la requête et en valeur la réponse
            caches.open(cacheName).then(cache => cache.put(evt.request, res));
            // quand on a la réponse on la retourne (clone car on ne peut la lire qu'une fois)
            return res.clone();
        })
        // Si on a une erreur et que l'on arrive pas à récupérer depuis le réseau, on va chercher dans le cache
        .catch(err => {
            console.log("url récupérée depuis le cache", evt.request.url);
            return caches.match(evt.request);
        })
    );

    self.addEventListener('activate', (evt) => {
        console.log(`sw activé à ${new Date().toLocaleTimeString()}`); 
      
        // 5.4 Supprimer les anciennes instances de cache
        let cacheCleanPromise = caches.keys().then(keys => {
            keys.forEach(key => {            
                if(key !== cacheName){
                    caches.delete(key);
                }
            });
        });
     
        evt.waitUntil(cacheCleanPromise);
    });

    self.addEventListener("push", evt => {
        console.log("push event", evt);
        console.log("data envoyée par la push notification :", evt.data.text());
     
        // 8.1 afficher son contenu dans une notification
        const title = evt.data.text();
        const objNotification = {
            body: "ça fonctionne", 
            icon : "images/icons/icon-72x72.png"
        };
        self.registration.showNotification(title, objNotification);
    });

    self.addEventListener('sync', event => {
        console.log('sync event', event);
        if (event.tag === 'sync-locations') {
            console.log('syncing', event.tag);
            event.waitUntil(updateLocationPromise);
        }
    });

    const updateLocationPromise = new Promise(function(resolve, reject) {

        getAllLocations().then(locations => {
            console.log('got locations from sync callback', locations);
            
            // pour chaque item : appel de l'api pour l'ajouter à la base
            locations.map(location => {
                console.log('Attempting fetch', location);
                fetch('https://us-central1-pwa-parking.cloudfunctions.net/addLocation', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(location)
                })
                .then(() => {
                    // Succès : suppression de l'item en local si ajouté en distant
                    console.log('Success update et id supprimée', location.id);
                    return deleteLocation(location.id);
                })
                .catch(err => {
                    // Erreur
                    console.log('Error update et id supprimée', err);
                    resolve(err);
                })
            })
     
        })
    });
    });