/**
 * PayNow Zimbabwe Payment Integration Server
 * Refactored to use official PayNow Node.js SDK
 * Added BillPay support for utility payments
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Paynow } = require('paynow');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// Configuration from .env
const INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID;
const INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY;
const RESULT_URL = process.env.RESULT_URL || 'http://localhost:3000/payment-result';
const RETURN_URL = process.env.RETURN_URL || 'http://localhost:3000/payment-return';

// Note: BillPay endpoints might be under /interface/ or /api/
// Based on SDK patterns, we'll try /interface/ first if /api/ failed
const BILLPAY_BASE_URL = 'https://www.paynow.co.zw/interface/billpay';

// Validation: Ensure required keys exist
if (!INTEGRATION_ID || !INTEGRATION_KEY) {
    console.error('\n❌ CRITICAL ERROR: PAYNOW_INTEGRATION_ID or PAYNOW_INTEGRATION_KEY is missing in .env');
    process.exit(1);
}

// Initialize Paynow object
const paynow = new Paynow(INTEGRATION_ID, INTEGRATION_KEY);
paynow.resultUrl = RESULT_URL;
paynow.returnUrl = RETURN_URL;

console.log(`🚀 PayNow Integration Server (SDK + BillPay)`);

// ============================================
// BillPay Helper Functions
// ============================================

function generateBillPayHash(values, integrationKey) {
    let string = "";
    // PayNow standard: iterate in object order, urlEncode each value
    Object.keys(values).forEach(key => {
        if (key !== 'hash') {
            string += encodeURIComponent(values[key]);
        }
    });
    string += integrationKey.toLowerCase();
    return crypto.createHash('sha512').update(string).digest('hex').toUpperCase();
}

/**
 * Helper to send POST requests as application/x-www-form-urlencoded
 */
async function postPayNow(url, data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => params.append(key, data[key]));
    
    return await axios.post(url, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

// ============================================
// Process Payment Endpoint
// ============================================
app.post('/api/process-payment', async (req, res) => {
    try {
        const { customerName, customerEmail, totalAmount, reference, items } = req.body;
        console.log(`\n💳 Creating payment for: ${reference}`);

        let payment = paynow.createPayment(reference, customerEmail);
        if (items && Array.isArray(items) && items.length > 0) {
            items.forEach(item => payment.add(item.name, item.price * item.quantity));
        } else {
            payment.add(`Order ${reference}`, totalAmount);
        }

        const response = await paynow.send(payment);

        if (response.success) {
            return res.json({
                success: true,
                redirectUrl: response.redirectUrl,
                paymentLink: response.redirectUrl,
                pollUrl: response.pollUrl,
                paynowReference: response.paynowReference || ''
            });
        } else {
            return res.status(400).json({ success: false, error: response.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Process Mobile Payment Endpoint
// ============================================
app.post('/api/process-mobile-payment', async (req, res) => {
    try {
        const { totalAmount, reference, customerEmail, phone, method } = req.body;
        console.log(`\n📱 Creating mobile payment: ${reference}`);

        let payment = paynow.createPayment(reference, customerEmail);
        payment.add(`Order ${reference}`, totalAmount);

        const response = await paynow.sendMobile(payment, phone, method);

        if (response.success) {
            return res.json({
                success: true,
                pollUrl: response.pollUrl,
                instructions: response.instructions || 'Check your phone for PIN prompt.'
            });
        } else {
            return res.status(400).json({ success: false, error: response.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BillPay: Categories Endpoint
// ============================================
app.get('/api/billpay/categories', async (req, res) => {
    try {
        console.log(`\n📂 Fetching BillPay categories...`);
        const data = { id: INTEGRATION_ID };
        data.hash = generateBillPayHash(data, INTEGRATION_KEY);

        const response = await postPayNow(`${BILLPAY_BASE_URL}/categories`, data);
        const result = typeof response.data === 'string' ? paynow.parseQuery(response.data) : response.data;

        if (result.status === 'ok') {
            return res.json({ success: true, categories: result.categories || [] });
        } else {
            return res.status(400).json({ success: false, error: result.error || 'Failed to fetch categories' });
        }
    } catch (error) {
        console.error(`   ❌ Categories error:`, error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BillPay: Billers Endpoint
// ============================================
app.get('/api/billpay/billers', async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        console.log(`\n🏦 Fetching billers for category: ${categoryId || 'all'}...`);
        
        const data = { id: INTEGRATION_ID };
        if (categoryId) data.categoryid = categoryId;
        data.hash = generateBillPayHash(data, INTEGRATION_KEY);

        const response = await postPayNow(`${BILLPAY_BASE_URL}/billers`, data);
        const result = typeof response.data === 'string' ? paynow.parseQuery(response.data) : response.data;

        if (result.status === 'ok') {
            return res.json({ success: true, billers: result.billers || [] });
        } else {
            return res.status(400).json({ success: false, error: result.error || 'Failed to fetch billers' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BillPay: Validate Account Endpoint
// ============================================
app.post('/api/billpay/validate', async (req, res) => {
    try {
        const { billerId, accountReference } = req.body;
        console.log(`\n🔍 Validating account: ${accountReference}`);

        const data = {
            id: INTEGRATION_ID,
            billerid: billerId,
            accountreference: accountReference
        };
        data.hash = generateBillPayHash(data, INTEGRATION_KEY);

        const response = await postPayNow(`${BILLPAY_BASE_URL}/validate`, data);
        const result = typeof response.data === 'string' ? paynow.parseQuery(response.data) : response.data;

        if (result.status === 'ok') {
            return res.json({ success: true, customerName: result.customername, valid: true });
        } else {
            return res.json({ success: false, valid: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BillPay: Process Payment
// ============================================
app.post('/api/billpay/pay', async (req, res) => {
    try {
        const { billerId, accountReference, amount, phone, method, customerEmail } = req.body;
        console.log(`\n💸 Processing bill payment to ${billerId}`);

        const data = {
            id: INTEGRATION_ID,
            billerid: billerId,
            accountreference: accountReference,
            amount: amount,
            phone: phone,
            method: method,
            authemail: customerEmail,
            status: 'Message'
        };
        data.hash = generateBillPayHash(data, INTEGRATION_KEY);

        const response = await postPayNow(`${BILLPAY_BASE_URL}/pay`, data);
        const result = typeof response.data === 'string' ? paynow.parseQuery(response.data) : response.data;

        if (result.status === 'ok') {
            return res.json({ 
                success: true, 
                pollUrl: result.pollurl,
                instructions: result.instructions || 'Check your phone for PIN prompt.'
            });
        } else {
            return res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Status, Webhook, Health (simplified)
// ============================================
app.post('/api/check-payment-status', async (req, res) => {
    try {
        const { pollUrl } = req.body;
        const status = await paynow.pollTransaction(pollUrl);
        return res.json({ success: status.success, status: status.status, data: status });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/payment-result', async (req, res) => {
    const response = paynow.parseHttpResponse(req.body);
    res.json({ success: !!response.status });
});

app.get('/health', (req, res) => res.json({ status: 'ok', mode: 'SDK + BillPay' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
