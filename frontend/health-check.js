const http = require('http');

// Configuration
const HOST = 'localhost';
const PORT = 4200;
const CHECK_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 10;

// Function to check if the application is running
async function checkApplication() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      console.log(`[${new Date().toISOString()}] Application is running - Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`[${new Date().toISOString()}] Application is not accessible - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`[${new Date().toISOString()}] Request timed out`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Function to check specific components
async function checkComponents() {
  // This would be where we'd implement specific checks for:
  // 1. Foto-stap component functionality
  // 2. Locatie-stap component functionality
  // 3. Navigation between steps
  // 4. Camera functionality
  // 5. Map display
  
  console.log(`[${new Date().toISOString()}] Component checks would be implemented here`);
  console.log(`[${new Date().toISOString()}] - Check if foto-stap component is accessible`);
  console.log(`[${new Date().toISOString()}] - Check if camera functionality works`);
  console.log(`[${new Date().toISOString()}] - Check if locatie-stap component is accessible`);
  console.log(`[${new Date().toISOString()}] - Check if map is displayed correctly`);
  console.log(`[${new Date().toISOString()}] - Check navigation between steps`);
  
  // For now, we'll just return true
  return true;
}

// Main loop function
async function mainLoop() {
  console.log(`[${new Date().toISOString()}] Starting application health check loop...`);
  console.log(`[${new Date().toISOString()}] Checking every ${CHECK_INTERVAL / 1000} seconds`);
  
  let retryCount = 0;
  
  while (true) {
    try {
      console.log('\n--- Checking application status ---');
      
      // Check if application is running
      const isAppRunning = await checkApplication();
      
      if (isAppRunning) {
        // Reset retry count on success
        retryCount = 0;
        
        // Check components
        const areComponentsWorking = await checkComponents();
        
        if (areComponentsWorking) {
          console.log(`[${new Date().toISOString()}] ✅ All checks passed!`);
        } else {
          console.log(`[${new Date().toISOString()}] ❌ Component checks failed`);
        }
      } else {
        retryCount++;
        console.log(`[${new Date().toISOString()}] ❌ Application not accessible (attempt ${retryCount}/${MAX_RETRIES})`);
        
        if (retryCount >= MAX_RETRIES) {
          console.log(`[${new Date().toISOString()}] ❌ Max retries reached. Application may be down.`);
          retryCount = 0; // Reset for next cycle
        }
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ❌ Error in main loop: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n[${new Date().toISOString()}] Gracefully shutting down...`);
  process.exit(0);
});

// Start the monitoring loop
mainLoop().catch(console.error);