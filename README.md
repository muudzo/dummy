# TechHub Zimbabwe - Dummy Website with PayNow Integration

A fully functional e-commerce dummy website with PayNow Zimbabwe payment gateway  integration.

## Overview

This is a modern, responsive website built with:
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with animations
- **Vanilla JavaScript** - No dependencies, lightweight
- **PayNow Zimbabwe Integration** - Complete payment flow simulation

## Features

### 🛍️ E-Commerce Features
- Product catalog with multiple items
- Shopping cart with add/remove/update quantity functionality
- Real-time cart calculations
- Tax calculation (10%)
- Persistent cart storage using localStorage
- Responsive design for mobile and desktop

### 💳 PayNow Payment Integration
- Unique payment reference generation
- Customer information collection
- PayNow USSD instructions (supports Econet *120# and Vodafone *151#)
- Payment status tracking (completed/pending)
- Order confirmation and receipt
- Payment history tracking
- Email confirmation simulation

### 📱 User Experience
- Smooth scrolling navigation
- Modal payment interface
- Toast notifications
- Mobile-responsive layout
- Visual feedback for user actions
- Loading states and error handling

## Files Structure

```
/dummy
├── index.html      # Main HTML file with page structure
├── style.css       # Complete styling and responsive design
├── script.js       # JavaScript for cart and payment functionality
└── README.md       # This file
```

## How to Use

### 1. Open the Website
Simply open `index.html` in a web browser:
```bash
# Using Python (3.x)
python3 -m http.server 8000

# Using Python (2.x)
python -m SimpleHTTPServer 8000

# Using Node.js (with http-server)
npx http-server

# Or just open index.html directly in your browser
open index.html
```

Visit `http://localhost:8000` in your browser.

### 2. Shopping Experience
1. Browse products in the "Products" section
2. Click "Add to Cart" to add items
3. View your cart by clicking the cart icon or navigating to "Cart" section
4. Adjust quantities using +/- buttons
5. Click "Proceed to Checkout" to continue

### 3. Payment Process

#### Option 1: Simulate Completed Payment
1. Fill in customer details (name, email, phone)
2. A unique PayNow reference will be generated
3. Select "Payment Completed" from dropdown
4. Click "Complete Purchase"
5. See order confirmation

#### Option 2: Simulate Pending Payment
1. Fill in customer details
2. Select "Payment Pending" from dropdown
3. You'll receive USSD instructions to complete payment
4. System tracks the pending order
5. Payment history is saved

### 4. Payment Reference
The system generates unique PayNow references in the format: `PN[timestamp][random]`
Example: `PN12345ABC`

## PayNow Zimbabwe Details

### USSD Codes
- **Econet:** Dial `*120#`
- **Vodafone:** Dial `*151#`

### Payment Flow
1. User generates unique reference in checkout
2. User dials USSD code
3. User selects "PayNow by ZimSwitch"
4. User enters the reference number
5. Payment is processed
6. Order confirmation is sent

## Features in Detail

### Shopping Cart
- Add/remove items
- Update quantities
- Tax calculation
- Persistent storage (survives page refresh)
- Real-time total calculation

### Payment Modal
- Customer information form
- PayNow reference generation
- Clear payment instructions
- Reference copy-to-clipboard functionality
- Payment status selection
- Order summary

### Data Storage
All data is stored in browser's localStorage:
- `cart` - Current shopping cart
- `payments` - Payment history for tracking

## JavaScript Functions

### Cart Management
- `addToCart(id, name, price)` - Add item to cart
- `removeFromCart(id)` - Remove item from cart
- `updateQuantity(id, quantity)` - Update item quantity
- `calculateTotals()` - Calculate subtotal, tax, total
- `updateCartDisplay()` - Refresh cart UI

### Payment Functions
- `openPaymentModal(total)` - Open checkout modal
- `closePaymentModal()` - Close checkout modal
- `generatePayNowReference()` - Generate unique reference
- `handlePayNowPayment(event)` - Process payment submission
- `processPayment(payment)` - Handle completed payment
- `processPendingPayment(payment)` - Handle pending payment
- `savePaymentRecord(payment)` - Store payment data

### Utility Functions
- `showNotification(message, type)` - Show toast notification
- `copyReference()` - Copy reference to clipboard
- `getPaymentHistory()` - Retrieve payment history
- `displayPaymentHistory()` - Log payments to console
- `exportCheckoutData()` - Export data as JSON

## Testing & Debugging

### View Payment History
Open browser console and run:
```javascript
displayPaymentHistory()
```

### Export Data
Download payment and cart data as JSON:
```javascript
exportCheckoutData()
```

### Clear Data
Reset cart and payments:
```javascript
localStorage.clear()
location.reload()
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints
- **Desktop:** 1200px and up
- **Tablet:** 768px to 1199px
- **Mobile:** Below 768px

## Currency
All prices are in **USD (United States Dollar)**

## Notes

- This is a **dummy/demo website** for testing and learning purposes
- No real payments are processed
- All payment records are stored locally in the browser
- Payment references are randomly generated for demo purposes
- In production, you would integrate with actual PayNow API

## Integration with Real PayNow API

To integrate with the actual PayNow Zimbabwe gateway, you would:

1. **Register with PayNow** - Get merchant credentials
2. **Update payment function** - Replace simulation with API calls
3. **Add backend server** - Handle secure API communication
4. **Implement webhooks** - Receive payment confirmation from PayNow
5. **Add database** - Store actual payment records
6. **Enable SSL/TLS** - Secure all transactions

### Example API Integration Point
```javascript
// Replace handlePayNowPayment with actual API call
async function handlePayNowPayment(event) {
    event.preventDefault();
    
    const paymentData = {
        // Form data
    };
    
    // Call your backend
    const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    
    // Handle response
}
```

## Support & Documentation

- **PayNow Zimbabwe Official:** https://www.paynow.co.zw/
- **API Documentation:** Contact PayNow support
- **Test Account:** Available from PayNow

## License

This dummy website is created for educational and testing purposes.

---

**Created:** March 2026
**Version:** 1.0
**Status:** Demo/Testing
