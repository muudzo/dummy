const axios = require('axios');

async function testBillPay() {
    console.log('--- Testing BillPay API Endpoints ---');
    
    try {
        // 1. Test Health
        console.log('\n1. Checking Health...');
        const health = await axios.get('http://localhost:3000/health');
        console.log('Response:', health.data);

        // 2. Test Categories
        console.log('\n2. Fetching Categories...');
        const categories = await axios.get('http://localhost:3000/api/billpay/categories');
        console.log('Success:', categories.data.success);
        if (categories.data.categories) {
            console.log(`Found ${categories.data.categories.length} categories.`);
        }

        // 3. Test Billers
        console.log('\n3. Fetching Billers...');
        const billers = await axios.get('http://localhost:3000/api/billpay/billers');
        console.log('Success:', billers.data.success);
        if (billers.data.billers) {
            console.log(`Found ${billers.data.billers.length} billers.`);
        }

        // Note: Validation and Payment require active PayNow permissions and valid test credentials.
        // If these fail with "Integration not found" or similar, it's likely a credential issue.
        
    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testBillPay();
