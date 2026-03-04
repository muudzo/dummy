// Shopping Cart Management
let cart = [];
let cartTotal = 0;

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Add item to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification(`${name} added to cart!`);
}

// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
}

// Update item quantity
function updateQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Calculate totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;

    return {
        subtotal: subtotal,
        tax: tax,
        total: total
    };
}

// Update cart display
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;

    // Update cart items display
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>USD ${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div style="text-align: right; min-width: 100px;">
                        <p><strong>USD ${(item.price * item.quantity).toLocaleString()}</strong></p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    // Update summary
    const totals = calculateTotals();
    document.getElementById('subtotal').textContent = `USD ${totals.subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `USD ${Math.round(totals.tax).toLocaleString()}`;
    document.getElementById('total').textContent = `USD ${Math.round(totals.total).toLocaleString()}`;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const totals = calculateTotals();
    openPaymentModal(totals.total);
}

// PayNow Payment Integration
function openPaymentModal(total) {
    const modal = document.getElementById('payment-modal');
    const paymentAmount = document.getElementById('payment-amount');

    paymentAmount.textContent = `USD ${Math.round(total).toLocaleString()}`;

    // Generate unique reference
    const reference = generatePayNowReference();
    document.getElementById('paynow-reference').value = reference;
    document.getElementById('ref-display').textContent = reference;

    modal.classList.add('show');

    // Show reference box when form is focused
    document.getElementById('paynow-form').addEventListener('click', function () {
        document.getElementById('generated-reference').style.display = 'block';
    });

    // Update PayNow link when fields change
    const updatePayNowLink = function () {
        const email = document.getElementById('customer-email').value;
        const name = document.getElementById('customer-name').value;

        if (email && reference) {
            const paymentLink = generatePayNowLink({
                amount: Math.round(total),
                reference: reference,
                customerEmail: email,
                customerName: name || 'Customer'
            });

            document.getElementById('paynow-link').href = paymentLink;
        }
    };

    // Update link on input change
    document.getElementById('customer-email').addEventListener('change', updatePayNowLink);
    document.getElementById('customer-name').addEventListener('change', updatePayNowLink);
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('show');
    document.getElementById('paynow-form').reset();
}

// Generate PayNow Payment Link
function generatePayNowLink(paymentData) {
    const { amount, reference, customerEmail, customerName } = paymentData;

    // PayNow payment link format
    // This creates a link to the PayNow payment page
    const baseUrl = 'https://www.paynow.co.zw/Payment/Link/';

    // Build query parameters
    const params = {
        search: customerEmail,
        amount: amount.toFixed(2),
        reference: reference,
        l: 0
    };

    // URL encode the parameters
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    // Return the full PayNow link
    return `${baseUrl}?q=${btoa(queryString)}`;
}

// Copy reference to clipboard
function copyReference() {
    const reference = document.getElementById('ref-display').textContent;
    navigator.clipboard.writeText(reference).then(() => {
        showNotification('Reference copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Reference: ' + reference);
    });
}

// Status Polling for Express Checkout
function startStatusPolling(pollUrl, reference) {
    showNotification('Waiting for you to enter PIN on your phone...', 'success');

    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/check-payment-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollUrl: pollUrl })
            });

            const data = await response.json();

            if (data.success && data.status === 'Paid') {
                clearInterval(pollInterval);
                showNotification('Payment Successful! Thank you.', 'success');

                // Finalize order
                setTimeout(() => {
                    alert(`Check Out Successful! \nReference: ${reference}`);
                    closePaymentModal();
                    cart = [];
                    updateCartDisplay();
                }, 2000);
            } else if (data.success && (data.status === 'Cancelled' || data.status === 'Refused')) {
                clearInterval(pollInterval);
                showNotification(`Payment ${data.status}. Please try again.`, 'error');
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 5000); // Poll every 5 seconds
}

// Generate unique PayNow reference number
function generatePayNowReference() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PN${timestamp.slice(-6)}${random}`;
}

// Handle PayNow payment submission
async function handlePayNowPayment(event) {
    event.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentReference = document.getElementById('paynow-reference').value;
    const paymentStatus = document.getElementById('payment-status').value;

    // Validate form
    if (!customerName || !customerEmail || !customerPhone || !paymentStatus) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Handle Express Checkout (EcoCash / OneMoney)
    if (['ecocash', 'onemoney'].includes(paymentStatus)) {
        const phone = document.getElementById('mobile-phone').value;
        if (!phone) {
            showNotification('Please enter your mobile money number', 'error');
            return;
        }

        const totals = calculateTotals();
        showNotification(`Sending ${paymentStatus.toUpperCase()} push prompt...`, 'success');

        try {
            const response = await fetch('http://localhost:3000/api/process-mobile-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalAmount: totals.total,
                    reference: paymentReference,
                    customerEmail: customerEmail,
                    phone: phone,
                    method: paymentStatus
                })
            });

            const data = await response.json();

            if (data.success) {
                showNotification(data.instructions, 'success');
                // Start polling for status
                startStatusPolling(data.pollUrl, paymentReference);
            } else {
                showNotification('Mobile payment failed: ' + (data.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Mobile Payment API Error:', error);
            showNotification('Error connecting to payment server.', 'error');
        }
        return;
    }

    // Handle PayNow Direct Link
    if (paymentStatus === 'paynow-direct') {
        const totals = calculateTotals();

        showNotification('Initiating connection to PayNow...', 'success');

        try {
            // Call backend API instead of generating link locally
            const response = await fetch('http://localhost:3000/api/process-payment', {
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
                    items: cart,
                    description: `Order ${paymentReference}`
                })
            });

            const data = await response.json();

            if (data.success) {
                // Create payment object
                const payment = {
                    timestamp: new Date().toISOString(),
                    reference: paymentReference,
                    paynowReference: data.paynowReference,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone,
                    paymentStatus: 'pending',
                    paymentMethod: 'paynow-direct',
                    items: cart,
                    totals: calculateTotals(),
                    gateway: 'PayNow Zimbabwe',
                    paymentLink: data.paymentLink,
                    pollUrl: data.poll ? data.poll.url : null
                };

                // Save payment record
                savePaymentRecord(payment);

                // Redirect to PayNow
                setTimeout(() => {
                    window.location.href = data.redirectUrl || data.paymentLink;
                }, 1000);

                showNotification('Redirecting to PayNow secure payment page...', 'success');
            } else {
                showNotification('Payment failed: ' + (data.message || 'Unknown error'), 'error');
                console.error('Payment Error Data:', data);
            }
        } catch (error) {
            console.error('Payment API Error:', error);
            showNotification('Error connecting to payment server. Please try again.', 'error');
        }
        return;
    }

    // Handle USSD Method
    if (paymentStatus === 'paynow-ussd') {
        const payment = {
            timestamp: new Date().toISOString(),
            reference: paymentReference,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            paymentStatus: 'pending',
            paymentMethod: 'paynow-ussd',
            items: cart,
            totals: calculateTotals(),
            gateway: 'PayNow Zimbabwe'
        };

        savePaymentRecord(payment);
        processPendingPayment(payment);
        return;
    }

    // Handle Demo Mode
    if (paymentStatus === 'demo') {
        const payment = {
            timestamp: new Date().toISOString(),
            reference: paymentReference,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            paymentStatus: 'completed',
            paymentMethod: 'demo',
            items: cart,
            totals: calculateTotals(),
            gateway: 'PayNow Zimbabwe (Demo)'
        };

        savePaymentRecord(payment);
        processPayment(payment);
        return;
    }
}

// Process completed payment
function processPayment(payment) {
    // Show success message
    const modal = document.getElementById('payment-modal');
    const modalContent = document.querySelector('.modal-content');
    const formHTML = modalContent.innerHTML;

    modalContent.innerHTML = `
        <div class="success-message">
            <h3>✓ Payment Completed Successfully!</h3>
            <p><strong>Reference Number:</strong> ${payment.reference}</p>
            <p><strong>Amount:</strong> USD ${Math.round(payment.totals.total).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${payment.customerName}</p>
            <p><strong>Email:</strong> ${payment.customerEmail}</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                A confirmation email has been sent to ${payment.customerEmail}
            </p>
        </div>
        <button class="btn btn-primary" onclick="completeOrder()">Return to Store</button>
    `;
}

// Process pending payment
function processPendingPayment(payment) {
    const modal = document.getElementById('payment-modal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
        <div class="success-message">
            <h3>✓ Order Submitted for Processing</h3>
            <p><strong>Reference Number:</strong> ${payment.reference}</p>
            <p><strong>Amount:</strong> USD ${Math.round(payment.totals.total).toLocaleString()}</p>
            <p><strong>Payment Status:</strong> Pending</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                Your payment is pending. Please complete the payment using the reference number above via PayNow USSD and we will process your order immediately.
            </p>
            <p style="margin-top: 1rem; background-color: #fff3cd; padding: 1rem; border-radius: 4px;">
                <strong>Next Steps:</strong><br>
                1. Dial *120# (Econet) or *151# (Vodafone)<br>
                2. Select PayNow by ZimSwitch<br>
                3. Enter reference: <strong>${payment.reference}</strong><br>
                4. We'll confirm receipt within 30 minutes
            </p>
        </div>
        <button class="btn btn-primary" onclick="completeOrder()">Return to Store</button>
    `;
}

// Complete order and clear cart
function completeOrder() {
    closePaymentModal();
    cart = [];
    saveCart();
    updateCartDisplay();

    // Reset form
    document.getElementById('paynow-form').reset();
    document.getElementById('generated-reference').style.display = 'none';

    // Restore modal content
    location.reload();
}

// Save payment record (simulates backend storage)
function savePaymentRecord(payment) {
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));

    // Log to console (in real app, this would be sent to backend)
    console.log('Payment Record Saved:', payment);
}

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `${type}-message`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 2000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    if (type === 'success') {
        notification.style.backgroundColor = '#d4edda';
        notification.style.color = '#155724';
        notification.style.border = '1px solid #c3e6cb';
    } else {
        notification.style.backgroundColor = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '1px solid #f5c6cb';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('payment-modal');
    if (event.target == modal) {
        closePaymentModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initCart();

    // Toggle PayNow button container based on payment method
    const paymentStatusEl = document.getElementById('payment-status');
    if (paymentStatusEl) {
        paymentStatusEl.addEventListener('change', function (e) {
            const paynowContainer = document.getElementById('paynow-button-container');
            const mobilePhoneGroup = document.getElementById('mobile-phone-group');

            // Show/hide based on selection
            paynowContainer.style.display = (e.target.value === 'paynow-direct') ? 'block' : 'none';
            mobilePhoneGroup.style.display = (['ecocash', 'onemoney'].includes(e.target.value)) ? 'block' : 'none';
        });
    }

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure the href actually starts with # and isn't just a full URL that contains a hash
            if (href && href.startsWith('#') && href !== '#') {
                try {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    // Ignore DOMException for invalid selectors
                    console.debug('Invalid selector for smooth scrolling:', href);
                }
            }
        });
    });
});

// Payment History (debugging/admin view)
function getPaymentHistory() {
    return JSON.parse(localStorage.getItem('payments')) || [];
}

function displayPaymentHistory() {
    const history = getPaymentHistory();
    console.table(history);
}

// Export data (for testing)
function exportCheckoutData() {
    const data = {
        cart: cart,
        payments: getPaymentHistory(),
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checkout_data_${Date.now()}.json`;
    link.click();
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
