# Quick Start Guide - TechHub Zimbabwe

## 🚀 Get Started in 2 Minutes

### Step 1: Start the Server
Run one of these commands from the project directory:

**Option A: Using Python 3 (Recommended)**
```bash
python3 -m http.server 8000
```

**Option B: Using Node.js**
```bash
npx http-server -p 8000
```

**Option C: Using the provided script**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Step 2: Open in Browser
Visit: **http://localhost:8000**

You should see the TechHub Zimbabwe homepage with products!

---

## 📝 Testing Checklist

### ✅ Shopping Features
- [ ] Browse products on the page
- [ ] Click "Add to Cart" for several items
- [ ] View cart count increase in header
- [ ] Go to Cart section
- [ ] Adjust quantities with +/- buttons
- [ ] Click Remove to delete items
- [ ] Verify totals update correctly
- [ ] Refresh page - cart persists!

### ✅ Payment Flow (Completed Payment)
1. Click "Proceed to Checkout"
2. Fill in your details:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +263 77 123 4567
3. PayNow reference generates automatically
4. Copy the reference number (click "Copy Reference")
5. Select "Payment Completed"
6. Click "Complete Purchase"
7. See success confirmation with order details

### ✅ Payment Flow (Pending Payment)
1. Click "Proceed to Checkout"
2. Fill in your details
3. Select "Payment Pending (I will pay via USSD)"
4. Click "Complete Purchase"
5. See instructions for USSD payment
6. Note the reference number for actual payment

### ✅ User Experience
- [ ] Notifications appear when items added to cart
- [ ] Modal payment interface is clean and clear
- [ ] Mobile layout is responsive
- [ ] Smooth scrolling between sections
- [ ] Payment reference copies to clipboard

---

## 🔍 Debugging & Testing

### View Payment History
Open browser **Developer Tools** (F12) → **Console** and run:
```javascript
displayPaymentHistory()
```

### Export Payment Data
Download all cart and payment data:
```javascript
exportCheckoutData()
```

### Clear All Data
Start fresh:
```javascript
localStorage.clear()
location.reload()
```

### Check Console
Open DevTools Console to see:
- Payment records being saved
- Logging of transactions
- Error messages (if any)

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `index.html` | Website structure & content |
| `style.css` | Styling & responsive design |
| `script.js` | Shopping cart & payment logic |
| `README.md` | Full documentation |
| `paynow-integration-example.js` | Real API integration example |
| `start-server.sh` | Quick server startup script |

---

## 🎯 Key Features to Try

### 1. Product Browsing
- 6 different products with icons
- Click "Add to Cart" to purchase
- Prices in USD (United States Dollar)

### 2. Shopping Cart
- Add/remove items
- Update quantities
- Automatic tax calculation (10%)
- Total price display
- Data persists on page refresh

### 3. PayNow Payment
- Unique reference generation
- USSD instructions (Econet *120# / Vodafone *151#)
- Two payment modes:
  - **Completed**: Simulates immediate payment
  - **Pending**: USSD payment instructions
- Order confirmation
- Payment history tracking

### 4. Responsive Design
- Desktop view (1200px+)
- Tablet view (768px - 1199px)
- Mobile view (below 768px)
- Works on all devices!

---

## 💡 Tips & Tricks

### Copy Payment Reference
When paying via USSD, click the "Copy Reference" button to copy to clipboard for quick entry on your phone.

### Cart Persistence
Your cart is saved automatically and survives:
- Page refresh
- Browser close
- Even after you close the tab!

### Multiple Test Runs
You can test multiple payments:
1. Add items to cart
2. Go through payment
3. Complete order
4. Your cart clears automatically
5. Start over with new items

### View All Transactions
Every payment is recorded in localStorage:
```javascript
displayPaymentHistory()
```

---

## 🔗 Production Integration

This is a **demo website**. To use with real PayNow:

1. **Register with PayNow** - Get credentials
2. **Deploy backend** - Use `paynow-integration-example.js` as reference
3. **Update payment flow** - Connect to real API
4. **Add database** - Store payment records
5. **Enable SSL/TLS** - Secure all transactions

See `paynow-integration-example.js` for implementation details.

---

## 🐛 Troubleshooting

### Page Won't Load
- Make sure you're using a local server (not file://)
- Try different port: `python3 -m http.server 9000`
- Check firewall settings

### Cart Not Saving
- Clear browser cache: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- Check localStorage is enabled in browser
- Try private/incognito mode

### Payment Not Working
- Fill in ALL fields in the form
- Check browser console (F12) for errors
- Clear localStorage: `localStorage.clear()`

### Mobile Layout Issues
- Open DevTools
- Toggle device toolbar (Ctrl+Shift+M)
- Test on actual phone/tablet

---

## 📞 Support

For real PayNow integration support:
- **Website:** https://www.paynow.co.zw/
- **Support:** Contact PayNow directly for API credentials

For this demo:
- Check the `README.md` file
- Review comments in `script.js`
- Check `paynow-integration-example.js` for backend setup

---

## ✨ What's Next?

After testing the demo, consider:

1. **Backend Integration**
   - Set up Node.js/Express server
   - Use `paynow-integration-example.js` as guide
   - Implement webhook handlers

2. **Database**
   - Store orders in MongoDB/PostgreSQL
   - Track payment status
   - Generate invoices

3. **Email Integration**
   - Send order confirmations
   - Payment receipts
   - Shipping notifications

4. **Security**
   - Validate all inputs
   - Use HTTPS/SSL
   - Hash sensitive data
   - Implement authentication

5. **Enhancement**
   - Add product images
   - Inventory management
   - User accounts & login
   - Order history
   - Shipping tracking

---

**Enjoy testing TechHub Zimbabwe!** 🎉

Remember: This is a demo for learning PayNow integration concepts. Real transactions require proper setup with PayNow's actual API.
