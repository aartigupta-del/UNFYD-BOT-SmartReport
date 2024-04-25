const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'UNFYD-BOT-Smartreport', // Replace with your desired service name
  description: 'Your Node.js API Windows Service', // Replace with your service description
  script: 'C:\\Node_API\\Development\\UNFYD-BOT-SmartReport\\index.js'//D:\Prashant Tiwari\Development\UNFYD-BOT-SmartReport\index.js// Replace with the actual path to your Node.js API script
});

// Listen for the "install" event
svc.on('install', () => {
  console.log('Service installed.');
  
  // Start the service after successful installation
  svc.start();
});

// Listen for the "start" event
svc.on('start', () => {
  console.log('Service started.');
});

// Install the service
svc.install();
