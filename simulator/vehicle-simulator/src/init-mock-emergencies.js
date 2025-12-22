const axios = require('axios');

const API_URL = 'http://127.0.0.1:3000/api/emergency/create';

const mockEmergencies = [
    {
        emergencyId: 'EMG-TANGIER-001',
        type: 'ACCIDENT',
        severity: 'HIGH',
        latitude: 35.7767,
        longitude: -5.8039,
        address: 'Place des Nations',
        description: 'Multi-vehicle collision at main intersection'
    },
    {
        emergencyId: 'EMG-TANGIER-002',
        type: 'MEDICAL',
        severity: 'CRITICAL',
        latitude: 35.7801,
        longitude: -5.8124,
        address: 'Boulevard Pasteur',
        description: 'Cardiac arrest reported'
    },
    {
        emergencyId: 'EMG-TANGIER-003',
        type: 'FIRE',
        severity: 'MEDIUM',
        latitude: 35.7725,
        longitude: -5.7950,
        address: 'Corniche Malabata',
        description: 'Small brush fire near roadway'
    }
];

async function seedEmergencies() {
    console.log('🚨 Seeding Mock Emergencies in Tangier...');

    for (const emg of mockEmergencies) {
        try {
            console.log(`Creating ${emg.emergencyId}...`);
            const response = await axios.post(API_URL, emg);

            if (response.data.success) {
                console.log(`✅ Created: ${emg.emergencyId}`);
            } else {
                console.error(`❌ Failed: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes('already exists')) {
                console.log(`ℹ️  ${emg.emergencyId} already exists. Skipping.`);
            } else {
                console.error(`⚠️ Error creating ${emg.emergencyId}:`, error.message);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                }
            }
        }
    }
    console.log('🏁 Emergency Seeding Complete.');
}

seedEmergencies();
