let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cart-items');
    
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>No hay productos en el carrito</p>';
        return;
    }
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
                <button class="remove-btn" data-index="${index}">Eliminar</button>
            </div>
        `;
        cartItemsElement.appendChild(cartItem);
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(name, price, image) {
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex >= 0) {
        return;
    }
    
    cart.push({ name, price, image });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

document.addEventListener('DOMContentLoaded', function() {
    const productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        producto.addEventListener('click', function() {
            const name = this.querySelector('h3').textContent;
            const price = this.querySelector('p').textContent;
            const image = this.querySelector('img').src;
            addToCart(name, price, image);
        });
    });
    
    document.getElementById('cart-items').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            updateCartDisplay();
        }
    });
    
    updateCartDisplay();
});

