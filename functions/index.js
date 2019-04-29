const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

// TODO: improve this function when firebase's team updates their subcollections queries
exports.onEventCreated = functions.firestore
    .document('users/{userId}/events/{eventId}')
    .onCreate((snap, context) => {
        let event = snap.data()
        if (event.fromNotification) return null
        let userId = context.params.userId
        return db.collection('users')
            .listDocuments()
            .then((users) => Promise.all(users
                .filter((user) => user.id !== userId)
                .map((user) => user
                    .collection('subjects')
                    .where("code", "==", event.subject.code)
                    .where("classGroup", "==", event.subject.classGroup)
                    .get()
                    .then((_) => user.collection('notifications').add({ event }))
                )
            ))
    })
