/**
 * PayNow Zimbabwe Payment Integration Server
 * Refactored to use official PayNow Node.js SDK
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Paynow } = require('paynow');

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

// Validation: Ensure required keys exist
if (!INTEGRATION_ID || !INTEGRATION_KEY) {
    console.error('\n❌ CRITICAL ERROR: PAYNOW_INTEGRATION_ID or PAYNOW_INTEGRATION_KEY is missing in .env');
    console.error('Please check your .env file and restart the server.\n');
    process.exit(1);
}

// Initialize Paynow object
const paynow = new Paynow(INTEGRATION_ID, INTEGRATION_KEY);
paynow.resultUrl = RESULT_URL;
paynow.returnUrl = RETURN_URL;

console.log(`🚀 PayNow Integration Server (SDK Mode)`);
console.log(`📍 Integration ID: ${INTEGRATION_ID.substring(0, 5)}... (Validated)`);

// ============================================
// Process Payment Endpoint
// ============================================
app.post('/api/process-payment', async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            totalAmount,
            reference,
            items
        } = req.body;

        console.log(`\n💳 Creating payment for: ${reference} (Amt: ${totalAmount})`);

        // 1. Create a new payment
        let payment = paynow.createPayment(reference, customerEmail);

        // 2. Add items to the payment list
        // If items are provided as an array, add them; otherwise add a generic item
        if (items && Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                payment.add(item.name, item.price * item.quantity);
            });
        } else {
            payment.add(`Order ${reference}`, totalAmount);
        }

        // 3. Send the payment to PayNow
        const response = await paynow.send(payment);

        // 4. Handle response
        if (response.success) {
            console.log(`   ✅ PayNow Success! Redirecting user to secure link.`);

            return res.json({
                success: true,
                message: 'Payment initiated successfully',
                redirectUrl: response.redirectUrl,
                paymentLink: response.redirectUrl, // for compatibility with script.js
                pollUrl: response.pollUrl,
                paynowReference: response.paynowReference || ''
            });
        } else {
            console.error(`   ❌ PayNow Error:`, response.error);
            return res.status(400).json({
                success: false,
                message: 'Payment initiation failed',
                error: response.error
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
// Process Mobile Payment Endpoint (Express Checkout)
// ============================================
app.post('/api/process-mobile-payment', async (req, res) => {
    try {
        const { totalAmount, reference, customerEmail, phone, method } = req.body;

        console.log(`\n📱 Creating mobile payment for: ${reference} (${method})`);

        // 1. Create a new payment
        let payment = paynow.createPayment(reference, customerEmail);
        payment.add(`Order ${reference}`, totalAmount);

        // 2. Send the mobile payment request (EcoCash/OneMoney)
        const response = await paynow.sendMobile(payment, phone, method);

        if (response.success) {
            console.log(`   ✅ Mobile Push Sent! Instructions: ${response.instructions}`);
            return res.json({
                success: true,
                pollUrl: response.pollUrl,
                instructions: response.instructions || 'Check your phone for the PIN prompt.'
            });
        } else {
            console.error(`   ❌ Mobile Payment Error:`, response.error);
            return res.status(400).json({
                success: false,
                message: 'Mobile payment initiation failed',
                error: response.error
            });
        }
    } catch (error) {
        console.error(`   ❌ Mobile Server Error:`, error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing mobile payment',
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
        if (!pollUrl) return res.status(400).json({ success: false, message: 'Poll URL required' });

        console.log(`🔍 Checking status via SDK poll...`);

        const status = await paynow.pollTransaction(pollUrl);

        console.log(`   Status: ${status.status}`);

        return res.json({
            success: status.success,
            status: status.status,
            data: status
        });
    } catch (error) {
        console.error(`   ❌ Status check error:`, error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Payment Results / Return Redirect
// ============================================

// 1. Webhook (Backend to Backend)
app.post('/payment-result', async (req, res) => {
    try {
        console.log(`\n🔔 Webhook received`);
        // The SDK helps parse and verify the result
        const response = paynow.parseHttpResponse(req.body);
        if (response.status) {
            console.log(`   ✅ Webhook Verified. Status: ${response.status}`);
            return res.json({ success: true });
        } else {
            console.warn(`   ⚠️ Webhook Verification Failed`);
            return res.status(401).json({ success: false });
        }
    } catch (error) {
        console.error(`   ❌ Webhook error:`, error.message);
        res.status(500).json({ success: false });
    }
});

// 2. Return Page (User Browser Redirect)
app.get('/payment-return', (req, res) => {
    console.log(`\n🏠 Customer returned from PayNow (Redirect)`);
    console.log(`   Reference: ${req.query.reference || 'None'}`);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Complete | TechHub ZW</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 100px 20px; color: #333; }
                .card { max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #007bff; }
                h1 { color: #28a745; }
                .btn { display: inline-block; padding: 12px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Thank You!</h1>
                <p>Your transaction has been processed by PayNow.</p>
                <p><strong>Merchant Reference:</strong> ${req.query.reference || 'Contact Support'}</p>
                <p>We have sent a confirmation email to your inbox.</p>
                <a href="http://localhost:8000" class="btn">Return to Store</a>
            </div>
        </body>
        </html>
    `);
});

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'SDK' });
});

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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT} (using SDK)`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`📌 Health: http://localhost:${PORT}/health`);
    console.log(`\n🔗 Endpoints:`);
    console.log(`   POST /api/process-payment`);
    console.log(`   POST /api/check-payment-status`);
    console.log(`   POST /payment-result (webhook)`);
    console.log(`   GET /health`);
});

module.exports = app;
