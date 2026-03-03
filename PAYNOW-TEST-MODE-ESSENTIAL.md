# PayNow Test Mode – What's Essential for Our Integration

This document highlights **what actually applies** to the dummy website we built vs. what's optional future enhancements.

---

## ✅ What We Currently Use (Required)

### 1. Integration is in Test Mode by Default
- Your Integration ID `23629` is **currently in test mode**
- No real money is moved
- You can safely test all flows

### 2. Merchant Account Email (`authemail`)
**Critical for our setup:**
When testing, PayNow needs to know which merchant is faking the payment. 

- **Rule:** The `authemail` field must match **your actual merchant login email** (the one you used to create the PayNow account)
- **Why:** Only the merchant account that created the integration can fake payments
- **Location in our code:** Should be included when your backend calls PayNow's API

**Example:**
```javascript
// In paynow-server.js when initiating a transaction:
const paymentData = {
  integrationid: process.env.PAYNOW_INTEGRATION_ID,
  reference: reference,
  amount: amount,
  currency: "ZWL",
  authemail: "your.merchant@email.com",  // ← MUST match your PayNow account email
  // ... other fields
};
```

### 3. Test Mode Payment Completion
**For the "Demo/Test Mode" option on our site:**

When you select **"Demo/Test Mode"** in the payment modal:
1. Your frontend shows a fake success message ✅
2. This simulates a successful payment
3. Payment is recorded in localStorage
4. **Real PayNow API:** Not called (frontend-only simulation)

**For actual PayNow testing** (if calling `/interface/remotetransaction`):
- Log into PayNow Dashboard
- Find your pending transaction
- Click **[TESTING: Faked Success]** and **[Make Payment]**
- PayNow sends a simulated SUCCESS response to your webhook

---

## 🔄 What's Optional (Future Enhancements)

### Express Checkout (Not Currently Implemented)
The test tokens below are **NOT needed yet** unless we implement Express Checkout:

#### Mobile Money Test Numbers
```
0771111111  → SUCCESS (5 seconds)
0772222222  → DELAYED SUCCESS (30 seconds)
0773333333  → USER CANCELLED (30 seconds)
0774444444  → INSUFFICIENT BALANCE (immediate error)
```

#### Visa/MasterCard Test Tokens
```
{11111111-1111-1111-1111-111111111111}  → SUCCESS (5 seconds)
{22222222-2222-2222-2222-222222222222}  → PENDING (30 seconds)
{33333333-3333-3333-3333-333333333333}  → CANCELLED (30 seconds)
{44444444-4444-4444-4444-444444444444}  → INSUFFICIENT BALANCE (error)
```

#### Zimswitch Test Tokens
```
11111111111111111111111111111111  → SUCCESS (5 seconds)
22222222222222222222222222222222  → PENDING (30 seconds)
33333333333333333333333333333333  → CANCELLED (30 seconds)
44444444444444444444444444444444  → INSUFFICIENT BALANCE (error)
```

> 💡 **Keep these tokens saved.** When we add Express Checkout, we'll use them to test card/mobile payment simulations.

---

## 📋 What Our Integration Currently Does

### Payment Methods Offered
1. **PayNow Link** – Redirects to PayNow's hosted checkout (real API integration)
2. **USSD** – Shows manual dial instructions (no API call)
3. **Demo/Test Mode** – Local simulation, no API call

### Test Mode Workflow (Current)
```
1. Customer selects payment method
2. Enters customer details (name, email, phone)
3. Reference generated (PN[timestamp][random])

   IF "PayNow Link":
   → Calls backend /api/process-payment
   → Includes authemail (merchant email)
   → Redirects to PayNow checkout
   → You manually fake success in PayNow Dashboard
   
   IF "USSD":
   → Shows dial instructions
   → No API call
   → Manual offline payment simulation
   
   IF "Demo/Test Mode":
   → Shows success immediately (frontend only)
   → No API call
   → Simulates successful purchase
```

---

## 🔑 Critical Configuration for Testing

### Must Have
```env
PAYNOW_INTEGRATION_ID=23629
PAYNOW_INTEGRATION_KEY=0ac007f7-e809-424d-9d25-433d27335488
```
✅ Already in `.env`

### Should Add (for real testing)
When you deploy or test with real PayNow calls, ensure your backend includes:
```javascript
authemail: "YOUR.MERCHANT@EMAIL.COM"  // Replace with your actual merchant email
```

---

## 🚀 Moving from Test Mode to Live (When Ready)

### Step 1: Complete Test Transaction ✅
1. Add item to cart
2. Proceed to checkout
3. Select "PayNow Link"
4. Go through payment modal
5. Copy reference number
6. Log into PayNow Dashboard
7. Find the transaction by reference
8. Click **[TESTING: Faked Success]** → **[Make Payment]**
9. Confirm success response received

### Step 2: Request Live Status
Once you've completed one successful test:
1. Log into PayNow Dashboard
2. Go to **Integration Keys** section
3. Click **[Request to be Set Live]**
4. PayNow support reviews your test transaction
5. Integration is upgraded to **Live Mode**
6. Real payments begin flowing

> ⚠️ Until you request "Set Live", you remain in test mode and no real money will be processed.

---

## 🧪 Testing Checklist for Our Integration

- [ ] **Merchant email confirmed** – Know your PayNow login email
- [ ] **Test Mode active** – Verify integration ID shows "test mode" in PayNow Dashboard
- [ ] **Demo/Test Mode works** – Select it, complete checkout, see success
- [ ] **PayNow Link works** – Select it, fill form, get redirected
- [ ] **USSD works** – Select it, see dial instructions
- [ ] **Reference copies** – Click copy button, paste in text editor
- [ ] **Data persists** – Refresh page, cart still there
- [ ] **Responsive** – Test on mobile (375px), tablet (768px), desktop
- [ ] **One fake success** – Use PayNow Dashboard to fake a payment completion
- [ ] **Ready for live** – Request "Set Live" in PayNow Dashboard

---

## 📚 Quick Reference

| Aspect | Status | Notes |
|--------|--------|-------|
| **Test Mode** | ✅ Active | No real money moves |
| **Merchant Email** | ⚠️ Needed | Must match PayNow account |
| **Demo/Test Option** | ✅ Built | Frontend-only simulation |
| **PayNow Link** | ✅ Built | Real API integration |
| **USSD** | ✅ Built | Manual offline simulation |
| **Express Checkout** | ❌ Not Yet | Tokens saved for future |
| **Mobile Money Tokens** | 🔒 Saved | Use when implementing Express Checkout |
| **Card Tokens** | 🔒 Saved | Use when implementing VMC payments |
| **Zimswitch Tokens** | 🔒 Saved | Use when implementing Zimswitch |

---

## 🎯 Next Steps

### For Testing Now
1. Get your merchant PayNow account email
2. Test "Demo/Test Mode" in the checkout
3. Test "PayNow Link" with a real redirect
4. Fake one success in PayNow Dashboard

### For Going Live
1. Confirm test transaction successful
2. Request "Set Live" in PayNow Dashboard
3. Wait for PayNow support approval
4. Update integration to use real email/keys
5. Begin accepting real payments

### For Future Enhancements
1. **Express Checkout** – Use the mobile/card/zimswitch tokens provided
2. **Enhanced Testing** – Use test tokens to simulate different payment outcomes
3. **Real Payment Methods** – Ecocash, OneMoney, Visa, Zimswitch support
