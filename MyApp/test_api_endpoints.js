// Test script to verify all API endpoints are working
const API_BASE = 'http://10.123.4.245:8000';

async function testEndpoint(path, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${path}`, options);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${method} ${path} - Status: ${response.status}`);
      return data;
    } else {
      console.log(`❌ ${method} ${path} - Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${method} ${path} - Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('Testing Backend API Endpoints...\n');
  
  // Test basic endpoints
  await testEndpoint('/');
  await testEndpoint('/crop-cycle/health');
  
  // Test GET endpoints
  await testEndpoint('/crop-cycle/loan-schemes');
  await testEndpoint('/crop-cycle/insurance-plans');
  await testEndpoint('/crop-cycle/solar-schemes');
  await testEndpoint('/crop-cycle/soil-testing-labs');
  await testEndpoint('/crop-cycle/certifications');
  await testEndpoint('/crop-cycle/mandi-info');
  await testEndpoint('/crop-cycle/government-schemes');
  await testEndpoint('/crop-cycle/corporate-buyers/Rice');
  
  // Test POST endpoints
  const testCropData = {
    crop: 'Rice',
    land_size: 5.0,
    irrigation_method: 'drip',
    available_tools: ['tractor', 'sprayer'],
    location: 'India'
  };
  
  await testEndpoint('/crop-cycle/analyze-crop', 'POST', testCropData);
  await testEndpoint('/crop-cycle/generate-insights', 'POST', testCropData);
  
  console.log('\nAPI endpoint testing completed!');
}

// Only run if this script is executed directly
if (typeof window === 'undefined') {
  runTests();
}

module.exports = { testEndpoint, runTests };
