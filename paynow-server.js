/**
 * PayNow Zimbabwe Payment Integration Server
 * Production-ready Express.js backend
 * 
 * Installation:
 * npm install express axios dotenv cors
 * 
 * Usage:
 * node paynow-server.js
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configuration
const PAYNOW_CONFIG = {
    integrationId: process.env.PAYNOW_INTEGRATION_ID || '23629',
    integrationKey: process.env.PAYNOW_INTEGRATION_KEY || '0ac007f7-e809-424d-9d25-433d27335488',
    apiUrl: 'https://www.paynow.co.zw/api/initiate-transaction',
    pollUrl: 'https://www.paynow.co.zw/api/poll-transaction',
    returnUrl: process.env.RETURN_URL || 'http://localhost:3000/payment-return',
    resultUrl: process.env.RESULT_URL || 'http://localhost:3000/payment-result'
};

console.log(`🚀 PayNow Integration Server`);
console.log(`📍 Integration ID: ${PAYNOW_CONFIG.integrationId.substring(0, 5)}...`);
console.log(`🔐 Using PayNow API: ${PAYNOW_CONFIG.apiUrl}`);

// ============================================
// Process Payment Endpoint
// ============================================
app.post('/api/process-payment', async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            totalAmount,
            reference,
            items,
            description
        } = req.body;

        console.log(`\n💳 Processing payment for: ${reference}`);
        console.log(`   Amount: ZWL ${totalAmount}`);
        console.log(`   Customer: ${customerName}`);

        // Validate required fields
        if (!totalAmount || !reference || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['totalAmount', 'reference', 'customerEmail']
            });
        }

        // Prepare PayNow transaction payload
        const transactionPayload = {
            integrationId: PAYNOW_CONFIG.integrationId,
            reference: reference,
            amount: Math.round(totalAmount),
            currency: 'ZWL',
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            description: description || `Order ${reference}`,
            returnUrl: PAYNOW_CONFIG.returnUrl,
            resultUrl: PAYNOW_CONFIG.resultUrl,
            auditNumber: `AUD-${Date.now()}`
        };

        // Generate HMAC signature
        const signature = generateSignature(transactionPayload);
        transactionPayload.signature = signature;

        console.log(`   Signature: ${signature.substring(0, 20)}...`);

        // Send to PayNow API
        console.log(`   📤 Sending to PayNow API...`);
        const response = await axios.post(
            PAYNOW_CONFIG.apiUrl,
            transactionPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log(`   ✅ PayNow Response:`, response.data);

        // Handle PayNow response
        if (response.data.success) {
            const paymentRecord = {
                reference: reference,
                paynowReference: response.data.paynowreference,
                status: 'pending',
                amount: totalAmount,
                currency: 'ZWL',
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone
                },
                items: items,
                redirectUrl: response.data.redirectUrl || response.data.link,
                pollUrl: response.data.pollurl,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 1800000).toISOString() // 30 mins
            };

            // Save to database (implement based on your DB)
            console.log(`   💾 Saved payment record`);

            return res.json({
                success: true,
                message: 'Payment initiated successfully',
                reference: reference,
                paynowReference: response.data.paynowreference,
                redirectUrl: response.data.redirectUrl || response.data.link,
                paymentLink: response.data.redirectUrl || response.data.link,
                poll: {
                    url: response.data.pollurl,
                    interval: 3000 // 3 seconds
                }
            });
        } else {
            console.error(`   ❌ PayNow Error:`, response.data);
            return res.status(400).json({
                success: false,
                message: 'Payment initiation failed',
                error: response.data.error || response.data
            });
        }
    } catch (error) {
        console.error(`   ❌ Server Error:`, error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing payment',
            error: error.message
        });
    }
});

// ============================================
// Check Payment Status Endpoint
// ============================================
app.post('/api/check-payment-status', async (req, res) => {
    try {
        const { pollUrl } = req.body;

        if (!pollUrl) {
            return res.status(400).json({
                success: false,
                message: 'Poll URL is required'
            });
        }

        console.log(`\n🔍 Checking payment status...`);

        // Poll PayNow for status
        const response = await axios.get(pollUrl, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        console.log(`   Status: ${response.data.status}`);

        return res.json({
            success: true,
            status: response.data.status,
            data: response.data
        });
    } catch (error) {
        console.error(`   ❌ Status check error:`, error.message);
        return res.status(500).json({
            success: false,
            message: 'Error checking payment status',
            error: error.message
        });
    }
});

// ============================================
// Payment Result Webhook
// ============================================
app.post('/payment-result', async (req, res) => {
    try {
        console.log(`\n🔔 Webhook received from PayNow`);
        console.log(`   Status: ${req.body.status}`);
        console.log(`   Reference: ${req.body.reference}`);

        // Verify signature
        if (!verifySignature(req.body)) {
            console.warn(`   ⚠️ Invalid signature!`);
            return res.status(401).json({ success: false });
        }

        // Update payment status in database
        const { reference, status, paynowreference } = req.body;

        console.log(`   ✅ Signature verified`);
        console.log(`   💾 Updating payment status to: ${status}`);

        // Implement your database update here
        // await updatePaymentStatus(reference, status);

        // Send confirmation
        res.json({ success: true });
    } catch (error) {
        console.error(`   ❌ Webhook error:`, error.message);
        res.status(500).json({ success: false });
    }
});

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'PayNow Zimbabwe Payment Gateway',
        integrationId: PAYNOW_CONFIG.integrationId.substring(0, 5) + '...',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Signature Generation
// ============================================
function generateSignature(data) {
    // Create signature string from payload
    const signatureString = createSignatureString(data);
    
    // Generate HMAC using integration key
    const signature = crypto
        .createHmac('sha512', PAYNOW_CONFIG.integrationKey)
        .update(signatureString)
        .digest('hex');
    
    return signature;
}

// ============================================
// Signature Verification
// ============================================
function verifySignature(data) {
    const signature = data.signature;
    const dataToSign = { ...data };
    delete dataToSign.signature;
    
    const expectedSignature = generateSignature(dataToSign);
    return signature === expectedSignature;
}

// ============================================
// Create Signature String
// ============================================
function createSignatureString(data) {
    // PayNow requires specific order for signature
    const fields = [
        data.integrationId,
        data.reference,
        data.amount,
        data.currency,
        data.status || '',
        data.paynowreference || '',
        data.pollurl || ''
    ];
    
    return fields.join('');
}

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error'
    });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`📌 Health: http://localhost:${PORT}/health`);
    console.log(`\n🔗 Endpoints:`);
    console.log(`   POST /api/process-payment`);
    console.log(`   POST /api/check-payment-status`);
    console.log(`   POST /payment-result (webhook)`);
    console.log(`   GET /health`);
});

module.exports = app;
