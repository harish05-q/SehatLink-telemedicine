const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// AGORA TOKEN GENERATION
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const generateAgoraToken = (req, res) => {
    const channelName = req.query.channelName;
    if (!channelName) {
        return res.status(400).json({ error: 'channelName is required' });
    }

    const uid = 0; // The user ID, 0 allows any user to join
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );

    return res.json({ token });
};

app.get('/api/agora-token', generateAgoraToken);

// SYMPTOM CHECKER ENDPOINT
// This new version is more reliable at finding the file
app.get('/api/symptoms', (req, res) => {
    // Create an absolute path to the file
    const filePath = path.join(__dirname, 'symptoms.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // This will give us a more detailed error in the server terminal
            console.error("Error reading symptoms.json:", err);
            return res.status(500).send('Error reading symptom data on the server.');
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
