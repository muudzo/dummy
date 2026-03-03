/**
 * Example PayNow Payment Integration
 * This file shows how to integrate with the actual PayNow Zimbabwe API
 * 
 * NOTE: This is a reference implementation. For production use:
 * 1. Register with PayNow and get your merchant credentials
 * 2. Use this on your backend server (Node.js/Express, Python/Flask, etc.)
 * 3. Never expose your API credentials in frontend code
 */

// ============================================
// Example: Node.js/Express Backend Integration
// ============================================

/*
// Install dependencies:
// npm install axios dotenv

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// PayNow Configuration
const PAYNOW_CONFIG = {
    merchantId: process.env.PAYNOW_MERCHANT_ID,
    apiKey: process.env.PAYNOW_API_KEY,
    baseUrl: 'https://www.paynow.co.zw/api/initiate-transaction',
    resultUrl: 'https://yourdomain.com/payment-result',
    returnUrl: 'https://yourdomain.com/payment-return'
};

// Process Payment
app.post('/api/process-payment', async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            totalAmount,
            reference,
            items
        } = req.body;

        // Validate request
        if (!totalAmount || !reference || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Prepare PayNow request
        const paymentRequest = {
            merchantId: PAYNOW_CONFIG.merchantId,
            reference: reference,
            amount: Math.round(totalAmount),
            currency: 'ZWL',
            returnUrl: PAYNOW_CONFIG.returnUrl,
            resultUrl: PAYNOW_CONFIG.resultUrl,
            auditNumber: `ORDER-${Date.now()}`,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            description: `Order ${reference}`
        };

        // Sign request (PayNow requires HMAC signature)
        const signature = generatePayNowSignature(paymentRequest, PAYNOW_CONFIG.apiKey);
        paymentRequest.signature = signature;

        // Send to PayNow API
        const response = await axios.post(
            PAYNOW_CONFIG.baseUrl,
            paymentRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PAYNOW_CONFIG.apiKey}`
                }
            }
        );

        // Handle PayNow response
        if (response.data.success) {
            // Save payment record to database
            await savePaymentToDB({
                reference: reference,
                status: 'pending',
                amount: totalAmount,
                customer: customerName,
                email: customerEmail,
                paynowResponse: response.data,
                createdAt: new Date()
            });

            // Return payment link to frontend
            return res.json({
                success: true,
                reference: reference,
                redirectUrl: response.data.redirectUrl,
                paymentLink: response.data.link
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment initiation failed',
                error: response.data.error
            });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing payment'
        });
    }
});

// Payment Result Webhook (PayNow will POST here)
app.post('/api/payment-result', async (req, res) => {
    try {
        const {
            reference,
            paynowreference,
            pollurl,
            status
        } = req.body;

        // Verify signature from PayNow
        if (!verifyPayNowSignature(req.body, PAYNOW_CONFIG.apiKey)) {
            return res.status(401).json({ success: false });
        }

        // Update payment status in database
        const updatedPayment = await updatePaymentStatus({
            reference: reference,
            status: status,
            paynowReference: paynowreference,
            pollUrl: pollurl,
            updatedAt: new Date()
        });

        // If payment successful, trigger order fulfillment
        if (status === 'completed') {
            await fulfillOrder(reference);
            await sendConfirmationEmail(updatedPayment.email, updatedPayment);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false });
    }
});

// Poll payment status
app.post('/api/check-payment-status', async (req, res) => {
    try {
        const { reference } = req.body;

        const payment = await getPaymentFromDB(reference);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Poll PayNow API for status
        const statusResponse = await axios.get(
            \`\${PAYNOW_CONFIG.baseUrl}/status/\${payment.pollUrl}\`,
            {
                headers: {
                    'Authorization': \`Bearer \${PAYNOW_CONFIG.apiKey}\`
                }
            }
        );

        return res.json({
            success: true,
            status: statusResponse.data.status,
            reference: reference
        });
    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({ success: false });
    }
});

// Helper function: Generate HMAC signature for PayNow
function generatePayNowSignature(data, apiKey) {
    const crypto = require('crypto');
    const message = JSON.stringify(data);
    return crypto
        .createHmac('sha256', apiKey)
        .update(message)
        .digest('hex');
}

// Helper function: Verify PayNow signature
function verifyPayNowSignature(data, apiKey) {
    const signature = data.signature;
    const dataToSign = { ...data };
    delete dataToSign.signature;
    
    const expectedSignature = generatePayNowSignature(dataToSign, apiKey);
    return signature === expectedSignature;
}

// Database functions (example with MongoDB)
async function savePaymentToDB(paymentData) {
    // Implementation depends on your database
    // Example: db.collection('payments').insertOne(paymentData)
}

async function updatePaymentStatus(paymentData) {
    // Update payment status in database
    // Example: db.collection('payments').updateOne({reference: paymentData.reference}, {$set: paymentData})
}

async function getPaymentFromDB(reference) {
    // Retrieve payment from database
    // Example: db.collection('payments').findOne({reference: reference})
}

async function fulfillOrder(reference) {
    // Process order fulfillment
    // - Generate invoice
    // - Send delivery email
    // - Update inventory
}

async function sendConfirmationEmail(email, paymentData) {
    // Send confirmation email to customer
    // Use nodemailer or SendGrid
}

app.listen(3000, () => {
    console.log('Payment server running on port 3000');
});
*/

// ============================================
// Example: Environment Variables (.env file)
// ============================================
/*
PAYNOW_MERCHANT_ID=your_merchant_id_here
PAYNOW_API_KEY=your_api_key_here
DATABASE_URL=your_database_connection_string
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_email_api_key
*/

// ============================================
// PayNow API Constants
// ============================================
const PAYNOW_ENDPOINTS = {
    sandbox: {
        initiate: 'https://demo.paynow.co.zw/api/initiate-transaction',
        poll: 'https://demo.paynow.co.zw/api/poll-transaction'
    },
    production: {
        initiate: 'https://www.paynow.co.zw/api/initiate-transaction',
        poll: 'https://www.paynow.co.zw/api/poll-transaction'
    }
};

// ============================================
// PayNow Transaction Status Codes
// ============================================
const PAYNOW_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// ============================================
// Frontend Integration (Updated script.js)
// ============================================
/*
// Modify handlePayNowPayment to call backend
async function handlePayNowPayment(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentReference = document.getElementById('paynow-reference').value;
    
    const totals = calculateTotals();
    
    try {
        // Call backend API
        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                totalAmount: totals.total,
                reference: paymentReference,
                items: cart
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to PayNow payment page
            window.location.href = data.paymentLink;
        } else {
            showNotification('Payment failed: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Error processing payment', 'error');
    }
}

// Poll for payment status
async function pollPaymentStatus(reference) {
    try {
        const response = await fetch('/api/check-payment-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reference: reference })
        });
        
        const data = await response.json();
        
        if (data.status === 'paid') {
            showNotification('Payment confirmed!', 'success');
            completeOrder();
        } else if (data.status === 'failed') {
            showNotification('Payment failed. Please try again.', 'error');
        }
        // Continue polling if pending
    } catch (error) {
        console.error('Status check error:', error);
    }
}
*/

// ============================================
// Payment Request Example
// ============================================
const EXAMPLE_PAYMENT_REQUEST = {
    merchantId: "MERCHANT_ID",
    reference: "PN123456ABC",
    amount: 5000,
    currency: "ZWL",
    returnUrl: "https://yourdomain.com/success",
    resultUrl: "https://yourdomain.com/webhook",
    auditNumber: "ORDER-1703001234567",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+263771234567",
    description: "Order PN123456ABC",
    signature: "hmac_sha256_signature_here"
};

// ============================================
// PayNow Transaction Response Example
// ============================================
const EXAMPLE_PAYNOW_RESPONSE = {
    success: true,
    redirectUrl: "https://www.paynow.co.zw/payment/ABC123DEF456",
    link: "https://www.paynow.co.zw/payment/ABC123DEF456",
    reference: "PN123456ABC",
    paynowReference: "789456123"
};

// ============================================
// Webhook Response Example
// ============================================
const EXAMPLE_WEBHOOK_DATA = {
    reference: "PN123456ABC",
    paynowreference: "789456123",
    pollurl: "https://api.paynow.co.zw/poll/ABC123",
    status: "paid",
    signature: "webhook_signature_hash"
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PAYNOW_ENDPOINTS,
        PAYNOW_STATUS,
        EXAMPLE_PAYMENT_REQUEST,
        EXAMPLE_PAYNOW_RESPONSE,
        EXAMPLE_WEBHOOK_DATA
    };
}
