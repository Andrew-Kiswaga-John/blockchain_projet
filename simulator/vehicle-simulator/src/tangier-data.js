/**
 * Tangier, Morocco - Traffic Simulation Data
 */

module.exports = {
    // City Center: Place des Nations
    center: {
        latitude: 35.7767,
        longitude: -5.8039
    },

    // Key Intersections in Tangier
    intersections: [
        {
            id: 'INT101',
            name: 'Place des Nations',
            location: { latitude: 35.7767, longitude: -5.8039 }
        },
        {
            id: 'INT102',
            name: 'Boulevard Pasteur & Rue Moussa Ben Noussair',
            location: { latitude: 35.7801, longitude: -5.8124 }
        },
        {
            id: 'INT103',
            name: 'Place du 9 Avril 1947 (Grand Socco)',
            location: { latitude: 35.7833, longitude: -5.8117 }
        },
        {
            id: 'INT104',
            name: 'Avenue Mohamed VI (Corniche) & Route de Malabata',
            location: { latitude: 35.7725, longitude: -5.7950 }
        },
        {
            id: 'INT105',
            name: 'Iberia Circle (Place Koweit)',
            location: { latitude: 35.7785, longitude: -5.8180 }
        }
    ],

    // Simulation Bounds
    bounds: {
        minLat: 35.7600,
        maxLat: 35.8000,
        minLon: -5.8400,
        maxLon: -5.7800
    }
};
