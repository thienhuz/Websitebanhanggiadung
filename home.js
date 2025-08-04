document.addEventListener("DOMContentLoaded", function() {
    // --- STATE MANAGEMENT ---
    let cart = JSON.parse(localStorage.getItem('betashopCart')) || [];
    let currentPriceFilter = { min: null, max: null };

    // --- SELECTORS ---
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const cartModal = document.getElementById("cart-modal");
    const closeModalButton = document.querySelector(".close-button");
    const continueShoppingLink = document.querySelector(".continue-shopping");
    const cartCountElement = document.getElementById("cart-count");
    const cartItemsContainer = document.getElementById("cart-items");
    const modalProductName = document.getElementById("modal-product-name");
    const cartSummary = document.getElementById("cart-summary");
    const totalPriceElement = document.getElementById("total-price");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const productCards = document.querySelectorAll(".product-card");
    const searchResultsMessage = document.getElementById("search-results-message");
    const priceFilterMessage = document.getElementById("price-filter-message");
    
    // Cart dropdown elements
    const cartDropdown = document.getElementById("cart-dropdown");
    const cartDropdownItems = document.getElementById("cart-dropdown-items");
    const cartItemCount = document.getElementById("cart-item-count");
    const dropdownTotalPrice = document.getElementById("dropdown-total-price");
    const viewCartBtn = document.getElementById("view-cart-btn");

    // Cart link for navigation to cart page
    const cartLink = document.getElementById("cart-link");

    // Price filter elements
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const applyPriceFilterBtn = document.getElementById("apply-price-filter");
    const clearPriceFilterBtn = document.getElementById("clear-price-filter");

    // Checkout button in modal
    const checkoutButton = document.querySelector(".checkout-button");

    // --- FUNCTIONS ---
    function saveCart() {
        localStorage.setItem('betashopCart', JSON.stringify(cart));
    }

    function formatCurrency(number) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    }

    function updateCartDropdown() {
        if (!cartDropdownItems || !cartItemCount || !dropdownTotalPrice) return;

        cartDropdownItems.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartDropdownItems.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Giỏ hàng trống</div>';
            cartItemCount.textContent = '(0) sản phẩm';
            dropdownTotalPrice.textContent = '0đ';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalItems += item.quantity;

            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'cart-dropdown-item';
            dropdownItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-btn quantity-decrease" data-name="${item.name}">-</div>
                    <div class="quantity-display">${item.quantity}</div>
                    <div class="quantity-btn quantity-increase" data-name="${item.name}">+</div>
                </div>
            `;
            cartDropdownItems.appendChild(dropdownItem);
        });

        cartItemCount.textContent = `(${totalItems}) sản phẩm`;
        dropdownTotalPrice.textContent = formatCurrency(total);
    }

    function updateCartUI() {
        let total = 0;
        let totalItems = 0;

        // Calculate totals
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });

        // Update cart count badge
        if (totalItems > 0) {
            if (cartCountElement) {
                cartCountElement.textContent = `(${totalItems})`;
                cartCountElement.style.display = 'inline';
            }
        } else {
            if (cartCountElement) {
                cartCountElement.style.display = 'none';
            }
        }

        // Update modal if it exists (only on home page)
        if (cartItemsContainer && cartSummary && totalPriceElement) {
            cartItemsContainer.innerHTML = '';

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;

                const cartRow = document.createElement('tr');
                cartRow.innerHTML = `
                    <td>
                        <div class="cart-item-info">
                            <img src="${item.image}" alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>
                        <div class="quantity-control">
                            <button class="quantity-decrease" data-name="${item.name}">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button class="quantity-increase" data-name="${item.name}">+</button>
                        </div>
                    </td>
                    <td>${formatCurrency(itemTotal)}</td>
                `;
                cartItemsContainer.appendChild(cartRow);
            });

            totalPriceElement.textContent = formatCurrency(total);
            cartSummary.textContent = `Giỏ hàng của bạn hiện có ${totalItems} sản phẩm`;
        }
    }

    function handleAddToCart(event) {
        const button = event.target;
        const productCard = button.closest('.product-card');
        
        const productName = productCard.querySelector('h4').textContent;
        const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace(/[^0-9]/g, ''));
        const productImage = productCard.querySelector('img').src;

        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1,
            });
        }
        
        if (modalProductName) {
            modalProductName.textContent = `✓ Bạn đã thêm (${productName}) vào giỏ hàng`;
        }
        saveCart();
        updateCartUI();
        updateCartDropdown();
        
        if (cartModal) {
            cartModal.style.display = 'block';
        }
    }
    
    function handleQuantityChange(event) {
        if (!event.target.matches('.quantity-decrease, .quantity-increase')) return;

        const productName = event.target.dataset.name;
        const itemInCart = cart.find(item => item.name === productName);

        if (event.target.matches('.quantity-increase')) {
            itemInCart.quantity++;
        } else if (event.target.matches('.quantity-decrease')) {
            itemInCart.quantity--;
            if (itemInCart.quantity === 0) {
                cart = cart.filter(item => item.name !== productName);
            }
        }
        
        saveCart();
        updateCartUI();
        updateCartDropdown();
        if (cart.length === 0 && cartModal) {
            cartModal.style.display = 'none';
        }
    }

    function handleDropdownQuantityChange(event) {
        if (!event.target.matches('.quantity-decrease, .quantity-increase')) return;

        const productName = event.target.dataset.name;
        const itemInCart = cart.find(item => item.name === productName);

        if (event.target.matches('.quantity-increase')) {
            itemInCart.quantity++;
        } else if (event.target.matches('.quantity-decrease')) {
            itemInCart.quantity--;
            if (itemInCart.quantity === 0) {
                cart = cart.filter(item => item.name !== productName);
            }
        }
        
        saveCart();
        updateCartDropdown();
        updateCartUI();
    }

    function handleCheckout() {
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        window.location.href = 'checkout.html';
    }

    function applyPriceFilter() {
        const minPrice = parseInt(minPriceInput.value) || 0;
        const maxPrice = parseInt(maxPriceInput.value) || Infinity;
        
        if (minPrice > maxPrice && maxPrice !== Infinity) {
            alert('Giá tối thiểu không thể lớn hơn giá tối đa!');
            return;
        }
        
        currentPriceFilter = { min: minPrice || null, max: maxPrice === Infinity ? null : maxPrice };
        
        // Update URL with price filter
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter') || 'all';
        const searchTerm = urlParams.get('search') || '';
        
        if (currentPriceFilter.min !== null) urlParams.set('minPrice', currentPriceFilter.min);
        else urlParams.delete('minPrice');
        
        if (currentPriceFilter.max !== null) urlParams.set('maxPrice', currentPriceFilter.max);
        else urlParams.delete('maxPrice');
        
        history.pushState({}, '', '?' + urlParams.toString());
        
        filterProducts(filter, searchTerm);
        showPriceFilterMessage();
    }

    function clearPriceFilter() {
        currentPriceFilter = { min: null, max: null };
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Update URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('minPrice');
        urlParams.delete('maxPrice');
        history.pushState({}, '', '?' + urlParams.toString());
        
        const filter = urlParams.get('filter') || 'all';
        const searchTerm = urlParams.get('search') || '';
        filterProducts(filter, searchTerm);
        hidePriceFilterMessage();
    }

    function showPriceFilterMessage() {
        if (!priceFilterMessage) return;
        
        let message = 'Đang lọc sản phẩm theo giá: ';
        if (currentPriceFilter.min !== null && currentPriceFilter.max !== null) {
            message += `${formatCurrency(currentPriceFilter.min)} - ${formatCurrency(currentPriceFilter.max)}`;
        } else if (currentPriceFilter.min !== null) {
            message += `Từ ${formatCurrency(currentPriceFilter.min)}`;
        } else if (currentPriceFilter.max !== null) {
            message += `Đến ${formatCurrency(currentPriceFilter.max)}`;
        }
        
        priceFilterMessage.textContent = message;
        priceFilterMessage.style.display = 'block';
    }

    function hidePriceFilterMessage() {
        if (priceFilterMessage) {
            priceFilterMessage.style.display = 'none';
        }
    }

    function filterProducts(filter, searchTerm = '') {
        const sidebarFilterLinks = document.querySelectorAll(".category-menu a[data-filter]");
        sidebarFilterLinks.forEach(l => l.classList.remove('active-filter'));
        const activeLink = document.querySelector(`.category-menu a[data-filter="${filter}"]`);
        if (activeLink) activeLink.classList.add('active-filter');

        let visibleCount = 0;
        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            const productPrice = parseInt(card.dataset.price);
            
            const matchesFilter = filter === "all" || card.classList.contains(filter);
            const matchesSearch = searchTerm === '' || productName.includes(searchTerm.toLowerCase());
            
            // Check price filter
            const matchesPrice = 
                (currentPriceFilter.min === null || productPrice >= currentPriceFilter.min) &&
                (currentPriceFilter.max === null || productPrice <= currentPriceFilter.max);

            if (matchesFilter && matchesSearch && matchesPrice) {
                card.style.display = "flex";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (searchResultsMessage) {
            if (searchTerm && visibleCount === 0) {
                searchResultsMessage.textContent = `Không tìm thấy sản phẩm phù hợp với "${searchTerm}"`;
                searchResultsMessage.style.display = 'block';
            } else if (searchTerm) {
                searchResultsMessage.textContent = `Tìm thấy ${visibleCount} sản phẩm cho "${searchTerm}"`;
                searchResultsMessage.style.display = 'block';
            } else {
                searchResultsMessage.style.display = 'none';
            }
        }
    }

    // --- EVENT LISTENERS ---
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener("click", handleAddToCart);
        });
    }

    // Cart link navigation to cart.html
    if (cartLink) {
        cartLink.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = 'cart.html';
        });
    }

    // Checkout button event listener
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    if (cartModal) {
        if (closeModalButton) {
            closeModalButton.addEventListener("click", () => cartModal.style.display = "none");
        }
        if (continueShoppingLink) {
            continueShoppingLink.addEventListener("click", (e) => {
                e.preventDefault();
                cartModal.style.display = "none";
            });
        }
        window.addEventListener("click", (event) => {
            if (event.target == cartModal) {
                cartModal.style.display = "none";
            }
        });
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', handleQuantityChange);
        }
    }

    // Cart dropdown event listeners
    if (cartDropdownItems) {
        cartDropdownItems.addEventListener('click', handleDropdownQuantityChange);
    }

    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // Price filter event listeners
    if (applyPriceFilterBtn) {
        applyPriceFilterBtn.addEventListener('click', applyPriceFilter);
    }

    if (clearPriceFilterBtn) {
        clearPriceFilterBtn.addEventListener('click', clearPriceFilter);
    }

    // Allow Enter key to apply price filter
    if (minPriceInput && maxPriceInput) {
        [minPriceInput, maxPriceInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyPriceFilter();
                }
            });
        });
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const searchTerm = searchInput.value.trim();
            // If on a page other than home.html, redirect to home.html with search term
            if (window.location.pathname.includes('gioithieu.html')) {
                window.location.href = `home.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const filter = urlParams.get('filter') || 'all';
                filterProducts(filter, searchTerm);
                // Update URL without reloading
                const newUrl = searchTerm ? `?filter=${filter}&search=${encodeURIComponent(searchTerm)}` : `?filter=${filter}`;
                history.pushState({}, '', newUrl);
            }
        });
    }

    const sidebar = document.querySelector(".sidebar");
    if (sidebar && productCards.length > 0) {
        const collapsibles = sidebar.querySelectorAll(".collapsible");
        collapsibles.forEach(function(coll) {
            coll.addEventListener("click", function(event) {
                event.preventDefault();
                this.classList.toggle("active");
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });

        const sidebarFilterLinks = document.querySelectorAll(".category-menu a[data-filter]");
        sidebarFilterLinks.forEach(function(link) {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                const filter = this.getAttribute("data-filter");
                // Clear search input and filter with empty search term
                if (searchInput) searchInput.value = '';
                filterProducts(filter, '');
                // Update URL without search term
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('filter', filter);
                urlParams.delete('search');
                history.pushState({}, '', '?' + urlParams.toString());
            });
        });

        // Initialize from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlFilter = urlParams.get('filter') || 'all';
        const urlSearch = urlParams.get('search') || '';
        const urlMinPrice = urlParams.get('minPrice');
        const urlMaxPrice = urlParams.get('maxPrice');
        
        // Set price filter from URL
        if (urlMinPrice || urlMaxPrice) {
            if (urlMinPrice) {
                minPriceInput.value = urlMinPrice;
                currentPriceFilter.min = parseInt(urlMinPrice);
            }
            if (urlMaxPrice) {
                maxPriceInput.value = urlMaxPrice;
                currentPriceFilter.max = parseInt(urlMaxPrice);
            }
            showPriceFilterMessage();
        }
        
        if (searchInput) searchInput.value = urlSearch;
        filterProducts(urlFilter, urlSearch);
    }

    // --- SORTING LOGIC ---
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", function() {
            const value = this.value;
            const productGrid = document.querySelector(".product-grid");
            const cards = Array.from(productCards);

            if (value === "price-asc") {
                cards.sort((a, b) => {
                    const priceA = parseInt(a.dataset.price);
                    const priceB = parseInt(b.dataset.price);
                    return priceA - priceB;
                });
            } else if (value === "price-desc") {
                cards.sort((a, b) => {
                    const priceA = parseInt(a.dataset.price);
                    const priceB = parseInt(b.dataset.price);
                    return priceB - priceA;
                });
            } else {
                cards.sort((a, b) => {
                    const indexA = Array.from(productGrid.children).indexOf(a);
                    const indexB = Array.from(productGrid.children).indexOf(b);
                    return indexA - indexB;
                });
            }

            if (productGrid) {
                productGrid.innerHTML = '';
                cards.forEach(card => productGrid.appendChild(card));
                filterProducts(new URLSearchParams(window.location.search).get('filter') || 'all', searchInput ? searchInput.value.trim() : '');
            }
        });
    }

    // Handle main navigation "Trang chủ" link to reset to all products
    const homeLink = document.querySelector('.main-nav a[href="home.html"]');
    if (homeLink) {
        homeLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (searchInput) searchInput.value = ''; // Clear search input
            clearPriceFilter(); // Clear price filter
            if (window.location.pathname.includes('home.html')) {
                filterProducts('all', ''); // Show all products
                history.pushState({}, '', '?filter=all'); // Update URL
            } else {
                window.location.href = 'home.html?filter=all'; // Redirect to home with filter=all
            }
        });
    }

    // --- INITIAL UI UPDATE ---
    updateCartUI();
    updateCartDropdown();
});