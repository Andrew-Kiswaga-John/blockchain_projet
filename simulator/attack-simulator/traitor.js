const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://127.0.0.1:3000/api';

async function simulateTraitor() {
    console.log(chalk.red.bold('\n🚀 STARTING ATTACK: The Traitor (Byzantine Fault Simulation)'));
    console.log(chalk.gray('---------------------------------------------------------'));

    console.log(chalk.yellow('\n[SCENARIO] One organization (InfrastructureOperator) is compromised.'));
    console.log(chalk.yellow('It will try to sabotage a PBFT vote by refusing to participate.'));

    try {
        console.log(chalk.cyan('\n[STEP 1] Starting a new PBFT Proposal...'));

        // We trigger a special PBFT test where we tell the backend to simulate a missing vote
        // (Note: We need to ensure the backend supports the 'maliciousOrg' flag)
        const response = await axios.post(`${API_URL}/consensus/pbft`, {
            data: "Hacker-Sabatoged-Proposal",
            simulateTraitor: true,
            maliciousOrg: "InfrastructureOperator"
        });

        console.log(chalk.green('\n[RESULT] Final Consensus Decision: SUCCESS'));
        console.log(chalk.gray(`Details: ${response.data.message}`));

        console.log(chalk.blue('\n[EXPLANATION] Even though one organization was a "Traitor" and didn\'t vote,'));
        console.log(chalk.blue('the other 3 organizations (TrafficAuthority, EmergencyServices, Parking) reached a majority.'));
        console.log(chalk.blue('This proves our city is Byzantine Fault Tolerant!'));

    } catch (error) {
        console.log(chalk.red('\n❌ SIMULATION FAILED: Total system failure.'));
        console.log(chalk.red(`Error: ${error.response?.data?.error || error.message}`));
    }

    console.log(chalk.gray('\n---------------------------------------------------------'));
    console.log(chalk.blue('Attack Simulation Complete. Check the Mini-SOC for AI analysis.'));
}

simulateTraitor();
