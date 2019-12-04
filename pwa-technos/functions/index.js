const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();
const reflocations = db.ref('/locations');

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from a Severless Database!");
});

const getLocationsFromDatabase = (res) => {
  let locations = [];

  return reflocations.on('value', (snapshot) => {
    snapshot.forEach((location) => {
      let objlocations = location.val();
      objlocations.id = location.key;
      locations.push(objlocations);
    });   
    res.status(200).json(locations);
  }, (error) => {
    res.status(500).json({
      message: `Something went wrong. ${error}`
    })
  })
};

exports.addLocation = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'POST') {
      return res.status(500).json({
        message: 'Not allowed'
      })
    }
    console.log(req.body);
    const location = req.body;
    reflocations.child(location.id).set(location);
    getLocationsFromDatabase(res);
  });
});

exports.getLocations = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'GET') {
      return res.status(500).json({
        message: 'Not allowed'
      });
    }
    getLocationsFromDatabase(res)
  });
});

exports.deleteLocation = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'DELETE') {
      return res.status(500).json({
        message: 'Not allowed'
      })
    }
    const id = req.query.id 
    reflocations.child(id).remove()
    getLocationsFromDatabase(res)
  })
})