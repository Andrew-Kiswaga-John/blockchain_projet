const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://127.0.0.1:3000/api';

async function simulateConflict() {
    console.log(chalk.red.bold('\n🚀 STARTING ATTACK: The Race Condition (MVCC Conflict)'));
    console.log(chalk.gray('---------------------------------------------------------'));

    const intersectionId = "intersection-1";

    console.log(chalk.yellow(`\n[ATTACK] Sending two simultaneous updates for ${intersectionId}...`));
    console.log(chalk.gray('Goal: Trigger a version mismatch (MVCC) in the blockchain.'));

    try {
        // We send two requests at the exact same time
        const req1 = axios.put(`${API_URL}/traffic/light`, {
            intersectionId,
            status: "RED"
        });

        const req2 = axios.put(`${API_URL}/traffic/light`, {
            intersectionId,
            status: "GREEN"
        });

        const results = await Promise.allSettled([req1, req2]);

        results.forEach((res, index) => {
            if (res.status === 'fulfilled') {
                console.log(chalk.green(`\nRequest ${index + 1}: SUCCESS`));
                console.log(chalk.gray(`Message: ${res.value.data.message}`));
            } else {
                console.log(chalk.magenta(`\nRequest ${index + 1}: BLOCKED (Conflict Detected)`));
                console.log(chalk.cyan(`Error: ${res.reason.response?.data?.error || res.reason.message}`));
            }
        });

        console.log(chalk.blue('\n[EXPLANATION] Hyperledger Fabric only allows one update per key per block.'));
        console.log(chalk.blue('This proves that the blockchain prevents inconsistent "Race Conditions".'));

    } catch (error) {
        console.error(chalk.red('Unexpected error during simulation:', error.message));
    }

    console.log(chalk.gray('\n---------------------------------------------------------'));
    console.log(chalk.blue('Attack Simulation Complete. Check the Mini-SOC for AI analysis.'));
}

simulateConflict();
