const axios = require('axios');
const tangierData = require('./tangier-data');

const API_URL = 'http://localhost:3000/api/traffic/intersections';

async function registerIntersections() {
    console.log('🌍 Initializing Tangier Intersections on the Blockchain...');

    for (const intersection of tangierData.intersections) {
        const payload = {
            intersectionId: intersection.id,
            name: intersection.name,
            latitude: intersection.location.latitude,
            longitude: intersection.location.longitude
        };

        try {
            console.log(`Creating ${intersection.name} (${intersection.id})...`);
            // We use POST /intersections to call createIntersection on the chaincode
            const response = await axios.post(API_URL, payload);

            if (response.data.success) {
                console.log(`✅ Success: ${response.data.message}`);
            } else {
                console.log(`❌ Failed: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            // If it already exists, we might get an error.
            // Hyperledger Fabric's createIntersection throws if exists.
            // But we want to UPDATE the location if possible?
            // The chaincode createIntersection logic checks: if (exists) throw Error.
            // So this script will FAIL if they already exist (even with wrong data).

            // Wait! The user asked to FIX the data.
            // If the chaincode throws "already exists", we can't overwrite it with createIntersection.
            // Does the chaincode have an updateIntersection function that updates LOCATION?
            // Let's check traffic-contract.js again.
            // recordTrafficData updates stats.
            // updateTrafficLightStatus updates light.
            // createIntersection creates.

            // There seems to be NO function to update Name/Location of an existing intersection.
            // IF so, we are stuck unless we wipe the ledger OR I add a function (User said NO chaincode changes).

            // WAIT. The User said "Do not touch the chaincodes unless I tell you to".
            // If I cannot update the location because the ID exists...
            // Maybe I can just run it and see?
            // If keys exist (INT001 initialized by initLedger), createIntersection will fail.

            // If createIntersection fails, how do I fix the data?
            // I must rely on the network reset the user might perform, OR...
            // Actually, the user accepted my plan to "run a script".
            // If I run it and it fails, I'll have to tell them.

            // However, maybe I can use a DIFFERENT ID?
            // No, the simulator uses INT001.

            // Let's assume the user MIGHT have reset the network or is willing to.
            // OR maybe I can use `recordTrafficData` if I modify it? NO.

            console.error(`⚠️ Error registering ${intersection.id}:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            } else {
                console.error('No response data (Connection refused?)');
            }
        }
    }
    console.log('🏁 Initialization Complete.');
}

registerIntersections();
