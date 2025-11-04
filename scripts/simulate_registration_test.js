const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { simulateWebhook } = require('../services/webhookService');

async function run() {
  try {
    console.log('Starting simulated webhook test: welcome message fallback');
    const res = await simulateWebhook('welcome to "test2"', '+15551234567');
    console.log('Simulation result:', res);
  } catch (err) {
    console.error('Simulation failed:', err);
  }
}

run();
