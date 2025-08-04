document.addEventListener("DOMContentLoaded", function() {
    // --- STATE MANAGEMENT ---
    let cart = JSON.parse(localStorage.getItem('betashopCart')) || [];

    // --- SELECTORS ---
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmountElement = document.getElementById("total-amount");
    const cartCountElement = document.getElementById("cart-count");
    const emptyCartMessage = document.getElementById("empty-cart-message");
    const cartTableContainer = document.querySelector(".cart-table-container");
    const checkoutBtn = document.getElementById("checkout-btn");

    // --- FUNCTIONS ---
    function formatCurrency(number) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    }

    function saveCart() {
        localStorage.setItem('betashopCart', JSON.stringify(cart));
    }

    function updateCartDisplay() {
        // Clear current display
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            // Show empty cart message
            emptyCartMessage.style.display = 'block';
            cartTableContainer.style.display = 'none';
            totalAmountElement.textContent = '0đ';
            cartCountElement.textContent = '(0) sản phẩm';
            return;
        }

        // Hide empty cart message and show table
        emptyCartMessage.style.display = 'none';
        cartTableContainer.style.display = 'block';

        // Add each cart item to the table
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalItems += item.quantity;

            const cartRow = document.createElement('tr');
            cartRow.innerHTML = `
                <td>
                    <img src="${item.image}" alt="${item.name}" class="product-image">
                </td>
                <td class="product-name">${item.name}</td>
                <td class="product-price">${formatCurrency(item.price)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-decrease" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-index="${index}">
                        <button class="quantity-increase" data-index="${index}">+</button>
                    </div>
                </td>
                <td class="total-price">${formatCurrency(itemTotal)}</td>
                <td>
                    <button class="delete-btn" data-index="${index}">🗑️</button>
                </td>
            `;
            cartItemsContainer.appendChild(cartRow);
        });

        // Update totals
        totalAmountElement.textContent = formatCurrency(total);
        cartCountElement.textContent = `(${totalItems}) sản phẩm`;
    }

    function updateQuantity(index, newQuantity) {
        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        cart[index].quantity = newQuantity;
        saveCart();
        updateCartDisplay();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
    }

    function handleQuantityChange(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (event.target.classList.contains('quantity-increase')) {
            updateQuantity(index, cart[index].quantity + 1);
        } else if (event.target.classList.contains('quantity-decrease')) {
            updateQuantity(index, cart[index].quantity - 1);
        } else if (event.target.classList.contains('quantity-input')) {
            const newQuantity = parseInt(event.target.value) || 1;
            updateQuantity(index, newQuantity);
        } else if (event.target.classList.contains('delete-btn')) {
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                removeItem(index);
            }
        }
    }

    function handleCheckout() {
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }

        // Redirect to checkout page instead of showing confirmation
        window.location.href = 'checkout.html';
    }

    // --- EVENT LISTENERS ---
    
    // Handle quantity changes and deletions
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', handleQuantityChange);
        cartItemsContainer.addEventListener('change', handleQuantityChange);
    }

    // Handle checkout - Updated to redirect to checkout page
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Handle search form (redirect to home with search)
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `home.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                window.location.href = 'home.html';
            }
        });
    }

    // --- INITIALIZATION ---
    updateCartDisplay();

    // Update cart count in header from other pages
    window.addEventListener('storage', function(e) {
        if (e.key === 'betashopCart') {
            cart = JSON.parse(e.newValue) || [];
            updateCartDisplay();
        }
    });
});