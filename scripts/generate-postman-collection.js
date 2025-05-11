/**
 * Script to generate a Postman collection from Swagger documentation
 * 
 * Usage:
 * 1. Run this script: node scripts/generate-postman-collection.js
 * 2. Import the generated 'postman-collection.json' file into Postman
 */

const fs = require('fs');
const path = require('path');

// Path to the output file
const OUTPUT_FILE = path.join(__dirname, '..', 'postman-collection.json');

console.log('Generating Postman collection from Swagger documentation...');

try {
  // Import the Swagger configuration to get the specs directly
  const swaggerConfig = require('../api/config/swagger');
  const swaggerSpec = swaggerConfig.specs;
  
  if (!swaggerSpec) {
    console.error('❌ Could not find Swagger specs in the configuration');
    process.exit(1);
  }
  
  // Save the Swagger spec to a file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swaggerSpec, null, 2), 'utf8');
  console.log(`✅ Swagger documentation saved to: ${OUTPUT_FILE}`);
  console.log('Now you can import this file into Postman:');
  console.log('1. Open Postman');
  console.log('2. Click "Import" in the top left');
  console.log('3. Select "File" tab and choose the generated JSON file');
  console.log('4. Click "Import" to create your collection');
} catch (error) {
  console.error('❌ Error generating Postman collection:', error.message);
  
  // More detailed error message for common issues
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\nMake sure you run this script from the root of your project');
    console.error('The Swagger configuration could not be found at: ../api/config/swagger');
  } else {
    console.error('\nStack trace:', error.stack);
  }
}