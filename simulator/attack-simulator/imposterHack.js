const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://127.0.0.1:3000/api';

async function simulateImposterHack() {
    console.log(chalk.red.bold('\n🚀 STARTING ATTACK: The Imposter (Unauthorized Access)'));
    console.log(chalk.gray('---------------------------------------------------------'));

    console.log(chalk.yellow('\n[ATTACK] Attempting to create an EMERGENCY as a regular "Vehicle Operator"...'));

    // Attempting to use the emergency-ops channel with a non-emergency MSP
    try {
        const response = await axios.post(`${API_URL}/emergency`, {
            emergencyId: "hack-emergency-001",
            type: "ACCIDENT",
            severity: "HIGH",
            latitude: 35.7595,
            longitude: -5.8340,
            address: "Hacker St",
            description: "Fake emergency created by unauthorized user"
        }, {
            headers: { 'x-org-name': 'VehicleOperator' }
        });

        console.log(chalk.red('❌ ATTACK SUCCESSFUL: The regular vehicle created an emergency! (Security logic missing)'));
        console.log(chalk.red(`Response: ${JSON.stringify(response.data)}`));
    } catch (error) {
        console.log(chalk.green.bold('✅ ATTACK BLOCKED: The blockchain blocked the unauthorized request!'));
        console.log(chalk.cyan(`Reason: ${error.response?.data?.error || error.message}`));
    }

    console.log(chalk.yellow('\n[ATTACK] Attempting to change a Traffic Light to GREEN as a "Vehicle Operator"...'));

    try {
        const response = await axios.put(`${API_URL}/traffic/light`, {
            intersectionId: "intersection-1",
            status: "GREEN"
        }, {
            headers: { 'x-org-name': 'VehicleOperator' }
        });

        console.log(chalk.red('❌ ATTACK SUCCESSFUL: The regular vehicle changed the traffic light! (Security logic missing)'));
    } catch (error) {
        console.log(chalk.green.bold('✅ ATTACK BLOCKED: The blockchain blocked the unauthorized light change!'));
        console.log(chalk.cyan(`Reason: ${error.response?.data?.error || error.message}`));
    }

    console.log(chalk.gray('\n---------------------------------------------------------'));
    console.log(chalk.blue('Attack Simulation Complete. Check the Mini-SOC for AI analysis.'));
}

simulateImposterHack();
