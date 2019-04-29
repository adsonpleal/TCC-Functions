const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

// TODO: improve this function when firebase's team updates their subcollections queries
exports.onEventCreated = functions.firestore
    .document('users/{userId}/events/{eventId}')
    .onCreate(async (snap, context) => {
        const event = snap.data()
        if (event.fromNotification) return
        const userId = context.params.userId
        const users = await db.collection('users').listDocuments()
        await Promise.all(users.map(async user => {
            const subjects = await user
                .collection('subjects')
                .where("code", "==", event.subject.code)
                .where("classGroup", "==", event.subject.classGroup)
                .get()
            if (subjects.size > 0 && user.id != userId) {
                await user.collection('notifications').add({ event })
            }
        }))
    })
