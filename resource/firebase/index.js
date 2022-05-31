const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const serviceAccount = require('../../reasnsapp-firebase-adminsdk-tumyf-fb1878b6b4.json');

const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

module.exports = admin;