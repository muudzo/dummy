# PayNow Payment Testing Guide

## Overview
This guide explains how to test the PayNow Zimbabwe payment integration in the dummy website.

> ⚠️ **Test Mode Reminder:**  
> When you first create an integration it is in **test mode**. No real money is moved – it's all simulated. You can create, cancel, and pay transactions to exercise various scenarios. Only the merchant account used to create the integration can log in and fake a payment; other emails will see a message saying the merchant is in testing.
>
> - Use your **merchant account email** as the `authemail` field when initiating test transactions. Mismatched emails will prevent you from completing the fake payment.
> - After you complete one successful test transaction, visit the PayNow dashboard and click **Request to be Set Live** to upgrade your integration for real payments.


---

## 🧪 PayNow Test Mode Reference

### Express Checkout (mobile money and cards)
In test mode you can simulate a variety of outcomes by using the following pre‑configured numbers/tokens when calling `/interface/remotetransaction` (include `token=` along with other required fields).

#### Mobile Money (ecocash / onemoney)
- **Success:** 0771111111 → sends SUCCESS after 5 s
- **Delayed Success:** 0772222222 → sends SUCCESS after 30 s (simulates slow authorisation)  
- **User Cancelled:** 0773333333 → sends FAILED after 30 s  
- **Insufficient Balance:** 0774444444 → immediate “Insufficient balance” error

> Make sure the `authemail` field matches your merchant login email during these tests.

#### Visa / MasterCard (vmc)
Use one of these tokens with `method=vmc`:
- `{11111111-1111-1111-1111-111111111111}` → SUCCESS (5 s)
- `{22222222-2222-2222-2222-222222222222}` → PENDING then SUCCESS (30 s)
- `{33333333-3333-3333-3333-333333333333}` → CANCELLED (30 s)
- `{44444444-4444-4444-4444-444444444444}` → Insufficient balance error

#### Zimswitch (zimswitch)
Tokens for `method=zimswitch`:
- `11111111111111111111111111111111` → SUCCESS (5 s)
- `22222222222222222222222222222222` → PENDING then SUCCESS (30 s)
- `33333333333333333333333333333333` → CANCELLED (30 s)
- `44444444444444444444444444444444` → Insufficient balance error


## 🧪 Test Scenarios

### Scenario 1: Single Item Purchase (Completed Payment)

**Setup:**
- Click "Add to Cart" for "Premium Web Template" (USD 5,000)

**Test Steps:**
1. Click "Proceed to Checkout"
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +263 77 123 4567
3. A PayNow reference generates (e.g., `PN123456ABC`)
4. Select "Payment Completed"
5. Click "Complete Purchase"
6. Verify success message shows

**Expected Result:**
- ✅ Order confirmation page displays
- ✅ Reference number shown
- ✅ Cart clears automatically
- ✅ Payment recorded in localStorage

---

### Scenario 2: Multiple Items Purchase (Pending Payment)

**Setup:**
- Add multiple items to cart:
  - Premium Web Template (USD 5,000)
  - Mobile App Course (USD 8,500)
  - UI/UX Design Kit (USD 3,200)
  
**Total:** USD 16,700 + Tax (USD 1,670) = **USD 18,370**

**Test Steps:**
1. Go to Cart section
2. Verify quantities and total
3. Click "Proceed to Checkout"
4. Fill customer details
5. Select "Payment Pending (I will pay via USSD)"
6. Click "Complete Purchase"
7. Review USSD instructions displayed

**Expected Result:**
- ✅ Shows instructions to dial *120# (Econet) or *151# (Vodafone)
- ✅ Reference number clearly displayed
- ✅ Instructions for completing payment
- ✅ Payment marked as pending
- ✅ Cart clears

---

### Scenario 3: Cart Persistence Test

**Setup:**
- Add 3 items to cart

**Test Steps:**
1. Note items and total
2. Refresh the page (Ctrl+R or Cmd+R)
3. Scroll to cart section

**Expected Result:**
- ✅ All items still in cart
- ✅ Quantities unchanged
- ✅ Total still calculated correctly

---

### Scenario 4: Quantity Adjustment

**Setup:**
- Add "Premium Web Template" to cart

**Test Steps:**
1. Go to Cart
2. Click "+" button to increase quantity to 3
3. Verify total updates
4. Click "-" button to decrease to 1
5. Change quantity in input to 5
6. Press Enter

**Expected Result:**
- ✅ Total updates after each change
- ✅ Manual input works
- ✅ +/- buttons work
- ✅ No negative quantities allowed

---

### Scenario 5: Item Removal

**Setup:**
- Add 2 different items

**Test Steps:**
1. Go to Cart
2. Click "Remove" on one item
3. Verify it disappears
4. Verify total updates

**Expected Result:**
- ✅ Item removed from cart
- ✅ Cart count decreases
- ✅ Total recalculated

---

### Scenario 6: Reference Copy Function

**Setup:**
- Proceed to payment modal

**Test Steps:**
1. Reference generates automatically
2. Click "Copy Reference" button
3. Paste in a text editor (Ctrl+V)
4. Verify it matches the reference shown

**Expected Result:**
- ✅ Reference copied to clipboard
- ✅ Can be pasted elsewhere
- ✅ No errors in console

---

## 🔍 Data Validation Tests

### Test Form Validation

**Empty Form Test:**
1. Open payment modal
2. Don't fill any fields
3. Click "Complete Purchase"

**Expected Result:**
- ✅ Error message or field validation
- ✅ Cannot proceed without data

**Invalid Email Test:**
1. Enter name and phone
2. Enter invalid email (e.g., "not-an-email")
3. Try to submit

**Expected Result:**
- ✅ Browser validates email format
- ✅ Cannot submit with invalid email

**Invalid Phone Test:**
1. Enter name and email
2. Leave phone empty or invalid
3. Try to submit

**Expected Result:**
- ✅ Field is required
- ✅ Cannot proceed

---

## 📊 Price Calculation Tests

### Test Tax Calculation
- Item: USD 1,000
- Tax (10%): USD 100
- Total: USD 1,100

**Verify:**
1. Add item costing USD 1,000
2. Check tax shows USD 100
3. Check total shows USD 1,100

### Test Multiple Items
1. Add Premium Web Template: USD 5,000
2. Add API Integration Guide: USD 2,500
3. Subtotal should be: USD 7,500
4. Tax should be: USD 750
5. Total should be: USD 8,250

---

## 🔐 Security & Data Tests

### Test Browser Storage

**View Payment History:**
1. Complete a payment
2. Open DevTools (F12)
3. Go to Console
4. Type: `displayPaymentHistory()`
5. View payment records

**Export Payment Data:**
1. Go to Console
2. Type: `exportCheckoutData()`
3. A JSON file downloads
4. Verify it contains your payment data

**Clear Storage:**
1. Go to Console
2. Type: `localStorage.clear()`
3. Type: `location.reload()`
4. Verify cart and history are empty

---

## 📱 Responsive Design Tests

### Mobile View (375px width)
1. Open DevTools
2. Click Device Toolbar (Ctrl+Shift+M)
3. Set to iPhone SE (375px)
4. Test:
   - Navigation menu
   - Product grid (should be 1 column)
   - Cart display
   - Payment modal

**Expected Result:**
- ✅ All content readable
- ✅ No horizontal scroll
- ✅ Buttons clickable
- ✅ Forms usable

### Tablet View (768px width)
1. Set device to iPad (768px)
2. Test layout and usability

**Expected Result:**
- ✅ 2-column product grid
- ✅ Navigation adjusted
- ✅ Touch-friendly buttons

### Desktop View (1200px+)
1. Full browser window
2. Test at 1200px, 1400px, 1600px+

**Expected Result:**
- ✅ 3-column product grid
- ✅ Full navigation visible
- ✅ All content visible

---

## 🎨 Visual & UX Tests

### Payment Modal
- ✅ Modal appears centered
- ✅ Backdrop darkens
- ✅ Can close with X button
- ✅ Can click outside to close
- ✅ All form fields visible

### Notifications
- ✅ Toast appears in top-right
- ✅ Auto-dismisses after 3 seconds
- ✅ Different colors for success/error
- ✅ No overlapping notifications

### Buttons
- ✅ Hover effects work
- ✅ Active states show
- ✅ Disabled state works (if implemented)
- ✅ Text visible in all states

### Colors & Typography
- ✅ Text readable with good contrast
- ✅ Links distinguished from text
- ✅ Headings appropriately sized
- ✅ Font consistent throughout

---

## 🌐 Browser Compatibility Tests

Test in these browsers:

### Chrome/Chromium
- ✅ Latest version
- ✅ All features work

### Firefox
- ✅ Latest version
- ✅ localStorage works
- ✅ Modals display correctly

### Safari
- ✅ Latest version
- ✅ CSS animations smooth
- ✅ Touch interactions work

### Edge
- ✅ Latest version
- ✅ All features compatible

---

## ⚡ Performance Tests

### Page Load Time
1. Clear cache (Ctrl+Shift+Delete)
2. Open DevTools → Network
3. Reload page
4. Check load time

**Expected Result:**
- ✅ Loads in < 2 seconds
- ✅ No unresolved resources
- ✅ All files load

### Memory Usage
1. Open DevTools → Performance
2. Click record
3. Add items to cart
4. Remove items
5. Stop recording

**Expected Result:**
- ✅ No memory leaks
- ✅ Smooth performance

### Smooth Animations
- ✅ No jank on modal open
- ✅ Smooth scrolling
- ✅ Transition effects smooth
- ✅ No dropped frames

---

## 🔗 API Response Tests

### Successful Payment Response
```json
{
  "success": true,
  "reference": "PN123456ABC",
  "amount": 18370,
  "status": "pending"
}
```

### Failed Payment Response
```json
{
  "success": false,
  "message": "Invalid payment details",
  "error": "email_required"
}
```

---

## 🧮 Tax Calculation Test Cases

| Subtotal | Tax (10%) | Total |
|----------|-----------|-------|
| USD 1,000 | USD 100 | USD 1,100 |
| USD 5,000 | USD 500 | USD 5,500 |
| USD 10,000 | USD 1,000 | USD 11,000 |
| USD 16,700 | USD 1,670 | USD 18,370 |
| USD 50,000 | USD 5,000 | USD 55,000 |

**Test:** Verify each case calculates correctly

---

## 📝 Payment Reference Format Test

**Generated Reference Examples:**
- `PN123456ABC` - Correct format
- `PN789012XYZ` - Correct format
- `PN000000ABC` - Correct format

**Verify:**
- ✅ Always starts with "PN"
- ✅ Followed by 6 digits (timestamp)
- ✅ Followed by 3 letters (random)
- ✅ Unique for each transaction

---

## ✅ Complete Testing Checklist

- [ ] Single item purchase (completed)
- [ ] Single item purchase (pending)
- [ ] Multiple items purchase
- [ ] Cart persistence across refresh
- [ ] Quantity adjustment with +/- buttons
- [ ] Quantity adjustment with input field
- [ ] Item removal
- [ ] Reference copy function
- [ ] Form validation (empty fields)
- [ ] Form validation (invalid email)
- [ ] Form validation (invalid phone)
- [ ] Tax calculation (single item)
- [ ] Tax calculation (multiple items)
- [ ] Payment history view
- [ ] Data export functionality
- [ ] Data clear functionality
- [ ] Mobile responsive (375px)
- [ ] Tablet responsive (768px)
- [ ] Desktop responsive (1200px+)
- [ ] Modal display and close
- [ ] Toast notifications
- [ ] Button hover effects
- [ ] Text visibility and contrast
- [ ] Chrome browser
- [ ] Firefox browser
- [ ] Safari browser
- [ ] Edge browser
- [ ] Page load performance
- [ ] Animation smoothness
- [ ] Console errors (should be none)

---

## 🚀 Test Automation Script

Save this as a test script to run all manual tests:

```javascript
// Open browser console and paste this
function runAllTests() {
    console.log('=== Starting Test Suite ===');
    
    // Test 1: Cart functions
    console.log('Test 1: Adding items...');
    addToCart(1, 'Test Item 1', 5000);
    addToCart(2, 'Test Item 2', 3000);
    console.log('✅ Items added');
    
    // Test 2: Totals
    console.log('Test 2: Checking totals...');
    const totals = calculateTotals();
    console.log('Subtotal:', totals.subtotal);
    console.log('Tax:', totals.tax);
    console.log('Total:', totals.total);
    console.log('✅ Totals calculated');
    
    // Test 3: Reference generation
    console.log('Test 3: Generating reference...');
    const ref = generatePayNowReference();
    console.log('Generated Reference:', ref);
    console.log('✅ Reference generated');
    
    // Test 4: Payment history
    console.log('Test 4: Checking payment history...');
    const history = getPaymentHistory();
    console.log('Payments on file:', history.length);
    console.log('✅ History retrieved');
    
    console.log('=== All Tests Completed ===');
}

runAllTests();
```

---

## 📞 Reporting Issues

If you find bugs:
1. Note the exact steps to reproduce
2. Screenshot or video if helpful
3. Check browser console for errors
4. Share error messages
5. Provide device/browser info

---

**Happy Testing!** 🎉
