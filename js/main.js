let cart = JSON.parse(localStorage.getItem('cart')) || [];

function normalizePrice(priceStr) {
    let cleanPrice = priceStr.replace(/[$\s]/g, '');
    
    cleanPrice = cleanPrice.replace(/\./g, '');
    
    if (cleanPrice.includes(',')) {
        cleanPrice = cleanPrice.replace(',', '.');
    }
    
    const result = parseFloat(cleanPrice);
    return isNaN(result) ? 0 : result; 
}

function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    let total = 0;
    
    cartItemsElement.innerHTML = '';
    
    if (!Array.isArray(cart) || cart.length === 0) {
        cartItemsElement.innerHTML = '<p>No hay productos en el carrito</p>';
        cartTotalElement.textContent = 'Total: $0,00';
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        
        return;
    }
    
    cart.forEach((item, index) => {
        const priceValue = normalizePrice(item.price);
        
        total += priceValue * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
                <button class="remove-btn" data-index="${index}">Eliminar</button>
            </div>
        `;
        cartItemsElement.appendChild(cartItem);
    });
    
    const totalFormatted = total.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    cartTotalElement.textContent = `Total: $${totalFormatted}`;
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

function validateProductData(name, price, image) {
    let errors = [];
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push('El nombre del producto es inválido');
    }
    
    if (!price || typeof price !== 'string' || price.trim() === '') {
        errors.push('El precio del producto es inválido');
    } else {
        const normalizedPrice = normalizePrice(price);
        if (isNaN(normalizedPrice) || normalizedPrice <= 0) {
            errors.push('El precio del producto debe ser un número válido');
        }
    }
    
    if (!image || typeof image !== 'string') {
        errors.push('La imagen del producto es inválida');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function addToCart(name, price, image) {
    const validation = validateProductData(name, price, image);
    
    if (!validation.isValid) {
        showNotification(`Error: ${validation.errors.join(', ')}`, 'error');
        return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += 1;
        showNotification(`Se aumentó la cantidad de ${name} en el carrito`);
    } else {
        cart.push({ 
            name, 
            price, 
            image, 
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        showNotification(`${name} agregado al carrito`);
    }
    
    updateCartDisplay();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }, 10);
}

function showCheckoutForm() {
    const overlay = document.createElement('div');
    overlay.className = 'checkout-overlay';
    
    let total = 0;
    cart.forEach(item => {
        const priceValue = normalizePrice(item.price);
        total += priceValue * item.quantity;
    });
    
    const totalFormatted = total.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    overlay.innerHTML = `
        <div class="checkout-form">
            <h2>Finalizar Compra</h2>
            <p class="checkout-total">Total a pagar: $${totalFormatted}</p>
            
            <form id="payment-form">
                <div class="form-group">
                    <label for="name">Nombre completo</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="card-number">Número de tarjeta</label>
                    <input type="text" id="card-number" name="card-number" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label for="expiry">Fecha de vencimiento (MM/AAAA)</label>
                        <input type="text" id="expiry" name="expiry" placeholder="MM/AAAA" maxlength="7" required>
                    </div>
                    
                    <div class="form-group half">
                        <label for="cvv">Código de seguridad</label>
                        <input type="text" id="cvv" name="cvv" placeholder="CVV" maxlength="4" required>
                    </div>
                </div>
                
                <div class="form-buttons">
                    <button type="button" id="cancel-checkout" class="cancel-btn">Cancelar</button>
                    <button type="submit" class="submit-btn">Pagar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    });
    
    const expiryInput = document.getElementById('expiry');
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            e.target.value = value.substring(0, 2) + '/' + value.substring(2);
        } else {
            e.target.value = value;
        }
    });
    
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    document.getElementById('cancel-checkout').addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            cardNumber: document.getElementById('card-number').value,
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            showOrderConfirmation();
            
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }, 1500);
    });
}

function showOrderConfirmation() {
    const overlay = document.createElement('div');
    overlay.className = 'checkout-overlay';
    
    overlay.innerHTML = `
        <div class="confirmation-message">
            <div class="success-icon">✓</div>
            <h2>¡Compra realizada con éxito!</h2>
            <p>Gracias por tu compra. Recibirás un email con los detalles de tu pedido.</p>
            <button id="close-confirmation" class="submit-btn">Continuar</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('close-confirmation').addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('cart-total')) {
        const cartContainer = document.getElementById('cart-items').parentElement;
        const totalElement = document.createElement('div');
        totalElement.id = 'cart-total';
        totalElement.className = 'cart-total';
        cartContainer.appendChild(totalElement);
    }
    
    const cartSection = document.querySelector('.cart-section');
    if (cartSection && !document.getElementById('checkout-btn')) {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.id = 'checkout-btn';
        checkoutBtn.className = 'checkout-btn';
        checkoutBtn.textContent = 'Finalizar Compra';
        checkoutBtn.addEventListener('click', showCheckoutForm);
        cartSection.appendChild(checkoutBtn);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            transition: bottom 0.5s;
            color: white;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #f44336;
        }
        .notification.show {
            bottom: 20px;
        }
        .quantity-controls {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .quantity-btn {
            width: 25px;
            height: 25px;
            background: #f0f0f0;
            border: 1px solid #ddd;
            cursor: pointer;
        }
        .quantity {
            margin: 0 10px;
        }
        .cart-total {
            font-weight: bold;
            margin-top: 15px;
            text-align: right;
            font-size: 1.1em;
        }
        .checkout-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
            transition: background-color 0.3s;
        }
        .checkout-btn:hover {
            background-color: #45a049;
        }
        .checkout-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .checkout-form {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .checkout-form h2 {
            margin-top: 0;
            color: #333;
            margin-bottom: 20px;
        }
        .checkout-total {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-row {
            display: flex;
            gap: 15px;
        }
        .form-group.half {
            flex: 1;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
            text-align: left;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .form-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
        }
        .cancel-btn {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .cancel-btn:hover {
            background-color: #d32f2f;
        }
        .submit-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .submit-btn:hover {
            background-color: #45a049;
        }
        .submit-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .confirmation-message {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .success-icon {
            width: 70px;
            height: 70px;
            background-color: #4CAF50;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 40px;
            margin: 0 auto 20px;
        }
        .confirmation-message h2 {
            color: #333;
            margin-bottom: 15px;
        }
        .confirmation-message p {
            color: #666;
            margin-bottom: 25px;
        }
    `;
    document.head.appendChild(style);
    
    const productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        producto.addEventListener('click', function() {
            const name = this.querySelector('h3')?.textContent;
            const price = this.querySelector('p')?.textContent;
            const image = this.querySelector('img')?.src;
            
            if (!name || !price || !image) {
                showNotification('Error: Producto con datos incompletos', 'error');
                return;
            }
            
            addToCart(name, price, image);
        });
    });
    
    document.getElementById('cart-items').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            if (index >= 0 && index < cart.length) {
                const removedItem = cart[index];
                cart.splice(index, 1);
                updateCartDisplay();
                showNotification(`${removedItem.name} eliminado del carrito`);
            }
        } else if (e.target.classList.contains('plus')) {
            const index = parseInt(e.target.dataset.index);
            if (index >= 0 && index < cart.length) {
                cart[index].quantity += 1;
                updateCartDisplay();
            }
        } else if (e.target.classList.contains('minus')) {
            const index = parseInt(e.target.dataset.index);
            if (index >= 0 && index < cart.length) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    const removedItem = cart[index];
                    cart.splice(index, 1);
                    showNotification(`${removedItem.name} eliminado del carrito`);
                }
                updateCartDisplay();
            }
        }
    });
    
    if (!Array.isArray(cart)) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    updateCartDisplay();
});

