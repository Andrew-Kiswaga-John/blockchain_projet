const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://127.0.0.1:3000/api';

async function simulateLyingSensor() {
    console.log(chalk.red.bold('\n🚀 STARTING ATTACK: The Lying Sensor (Data Falsification)'));
    console.log(chalk.gray('---------------------------------------------------------'));

    const maliciousData = [
        {
            name: "Impossible Negative Count",
            data: { intersectionId: "intersection-1", vehicleCount: -10, averageSpeed: 20, congestionLevel: "LOW" }
        },
        {
            name: "Impossible High Speed",
            data: { intersectionId: "intersection-1", vehicleCount: 5, averageSpeed: 500, congestionLevel: "LOW" }
        },
        {
            name: "Massive Overload",
            data: { intersectionId: "intersection-2", vehicleCount: 2000, averageSpeed: 5, congestionLevel: "CRITICAL" }
        }
    ];

    for (const test of maliciousData) {
        try {
            console.log(chalk.yellow(`\n[ATTACK] Sending ${test.name}...`));
            console.log(chalk.gray(`Payload: ${JSON.stringify(test.data)}`));

            const response = await axios.post(`${API_URL}/traffic/data`, test.data);

            console.log(chalk.green('❌ ATTACK FAILED: The blockchain accepted the bad data! (Security logic missing)'));
            console.log(chalk.green(`Response: ${JSON.stringify(response.data)}`));
        } catch (error) {
            console.log(chalk.green.bold('✅ ATTACK BLOCKED: The blockchain rejected the malicious data!'));
            console.log(chalk.cyan(`Reason: ${error.response?.data?.error || error.message}`));
        }
    }

    console.log(chalk.gray('\n---------------------------------------------------------'));
    console.log(chalk.blue('Attack Simulation Complete. Check the Mini-SOC for AI analysis.'));
}

simulateLyingSensor();
