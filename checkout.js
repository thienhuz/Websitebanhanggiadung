document.addEventListener("DOMContentLoaded", function() {
    // --- STATE MANAGEMENT ---
    let cart = JSON.parse(localStorage.getItem('betashopCart')) || [];
    let shippingFee = 0;
    let discount = 0;

    // --- SELECTORS ---
    const orderItemsContainer = document.getElementById("order-items");
    const itemCountElement = document.getElementById("item-count");
    const subtotalElement = document.getElementById("subtotal");
    const shippingFeeElement = document.getElementById("shipping-fee");
    const totalAmountElement = document.getElementById("total-amount");
    const placeOrderBtn = document.getElementById("place-order");
    const checkoutForm = document.getElementById("checkout-form");
    const applyPromoBtn = document.getElementById("apply-promo");
    const promoCodeInput = document.getElementById("promo-code");
    const successModal = document.getElementById("success-modal");

    // --- FUNCTIONS ---
    function formatCurrency(number) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    }

    function generateOrderId() {
        return 'BS' + Date.now().toString().slice(-8);
    }

    function updateOrderSummary() {
        if (!orderItemsContainer) return;

        // Clear current items
        orderItemsContainer.innerHTML = '';
        
        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Giỏ hàng trống</div>';
            if (itemCountElement) itemCountElement.textContent = '0';
            if (subtotalElement) subtotalElement.textContent = '0đ';
            if (totalAmountElement) totalAmountElement.textContent = '0đ';
            return;
        }

        // Add each cart item to order summary
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="item-quantity-price">
                    <div class="item-quantity">Số lượng: ${item.quantity}</div>
                    <div class="item-total">${formatCurrency(itemTotal)}</div>
                </div>
            `;
            orderItemsContainer.appendChild(orderItem);
        });

        // Calculate shipping fee (free shipping for orders over 3,000,000 VND)
        shippingFee = subtotal >= 3000000 ? 0 : 30000;
        
        // Calculate total
        const total = subtotal + shippingFee - discount;

        // Update UI elements
        if (itemCountElement) itemCountElement.textContent = totalItems;
        if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
        if (shippingFeeElement) {
            shippingFeeElement.textContent = shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee);
        }
        if (totalAmountElement) totalAmountElement.textContent = formatCurrency(total);
    }

    function validateForm() {
        const email = document.getElementById('email').value.trim();
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const province = document.getElementById('province').value;

        if (!email) {
            alert('Vui lòng nhập email');
            return false;
        }

        if (!isValidEmail(email)) {
            alert('Email không hợp lệ');
            return false;
        }

        if (!fullName) {
            alert('Vui lòng nhập họ và tên');
            return false;
        }

        if (!phone) {
            alert('Vui lòng nhập số điện thoại');
            return false;
        }

        if (!isValidPhone(phone)) {
            alert('Số điện thoại không hợp lệ');
            return false;
        }

        if (!province) {
            alert('Vui lòng chọn tỉnh thành');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{9,11}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function applyPromoCode() {
        const promoCode = promoCodeInput.value.trim().toUpperCase();
        
        // Sample promo codes
        const promoCodes = {
            'GIAM10': { type: 'percent', value: 10, description: 'Giảm 10%' },
            'GIAM50K': { type: 'fixed', value: 50000, description: 'Giảm 50,000đ' },
            'FREESHIP': { type: 'shipping', value: 0, description: 'Miễn phí vận chuyển' },
            'NEWCUSTOMER': { type: 'percent', value: 15, description: 'Giảm 15% cho khách hàng mới' }
        };

        if (!promoCode) {
            alert('Vui lòng nhập mã giảm giá');
            return;
        }

        if (promoCodes[promoCode]) {
            const promo = promoCodes[promoCode];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            switch (promo.type) {
                case 'percent':
                    discount = Math.floor(subtotal * promo.value / 100);
                    break;
                case 'fixed':
                    discount = promo.value;
                    break;
                case 'shipping':
                    shippingFee = 0;
                    discount = 0;
                    break;
            }
            
            alert(`Áp dụng mã giảm giá thành công: ${promo.description}`);
            updateOrderSummary();
            applyPromoBtn.textContent = 'Đã áp dụng';
            applyPromoBtn.disabled = true;
            promoCodeInput.disabled = true;
        } else {
            alert('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        }
    }

    function placeOrder() {
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }

        if (!validateForm()) {
            return;
        }

        // Disable button to prevent double submission
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Đang xử lý...';

        // Simulate order processing
        setTimeout(() => {
            const orderId = generateOrderId();
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingFee - discount;
            
            // Show success modal
            document.getElementById('order-id').textContent = orderId;
            document.getElementById('final-total').textContent = formatCurrency(total);
            successModal.style.display = 'block';
            
            // Clear cart after successful order
            cart = [];
            localStorage.removeItem('betashopCart');
            
            // Reset form
            checkoutForm.reset();
        }, 2000);
    }

    function updateDistrictOptions() {
        const provinceSelect = document.getElementById('province');
        const districtSelect = document.getElementById('district');
        
        if (!provinceSelect || !districtSelect) return;

        const districts = {
            'hanoi': ['Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ', 'Cầu Giấy', 'Thanh Xuân'],
            'hcm': ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Phú Nhuận'],
            'hue': ['Thành phố Huế', 'Hương Thủy', 'Hương Trà', 'Phong Điền', 'Quảng Điền'],
            'danang': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu']
        };

        provinceSelect.addEventListener('change', function() {
            const selectedProvince = this.value;
            districtSelect.innerHTML = '<option value="">Quận huyện (tùy chọn)</option>';
            
            if (selectedProvince && districts[selectedProvince]) {
                districts[selectedProvince].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            }
        });
    }

    // --- EVENT LISTENERS ---
    
    if (applyPromoBtn && promoCodeInput) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
        
        promoCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Close success modal when clicking outside
    if (successModal) {
        window.addEventListener('click', function(event) {
            if (event.target === successModal) {
                successModal.style.display = 'none';
                window.location.href = 'home.html';
            }
        });
    }

    // Form validation on input
    const requiredFields = ['email', 'fullName', 'phone'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.borderColor = '#e74c3c';
                } else {
                    this.style.borderColor = '#ddd';
                }
            });

            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '#27ae60';
                }
            });
        }
    });

    // Email validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value.trim() && !isValidEmail(this.value.trim())) {
                this.style.borderColor = '#e74c3c';
            }
        });
    }

    // Phone validation
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        phoneField.addEventListener('blur', function() {
            if (this.value.trim() && !isValidPhone(this.value.trim())) {
                this.style.borderColor = '#e74c3c';
            }
        });
    }

    // --- INITIALIZATION ---
    
    // Check if cart is empty and redirect if necessary
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
        window.location.href = 'home.html';
        return;
    }

    // Update order summary
    updateOrderSummary();
    
    // Setup district dropdown
    updateDistrictOptions();

    // Listen for storage changes (if cart is updated from another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'betashopCart') {
            cart = JSON.parse(e.newValue) || [];
            updateOrderSummary();
            
            if (cart.length === 0) {
                alert('Giỏ hàng đã được cập nhật. Chuyển về trang chủ.');
                window.location.href = 'home.html';
            }
        }
    });
});