const STORAGE_KEY = 'shop-cart';

const cart = loadCart();

const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const clearCartButton = document.getElementById('clear-cart');
const cartPanel = document.getElementById('cart-panel');
const cartToggleButton = document.getElementById('cart-toggle');
const closeCartButton = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const showOrderFormButton = document.getElementById('show-order-form');
const orderForm = document.getElementById('order-form');
const orderSubmitButton = document.querySelector('#order-form button[type="submit"]');

function openCart() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('visible');
}

function closeCart() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('visible');
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem(STORAGE_KEY);

    if (!savedCart) {
        return [];
    }

    try {
        return JSON.parse(savedCart);
    } catch (error) {
        return [];
    }
}

function renderCart() {
    cartList.innerHTML = '';

    let total = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        const itemText = document.createElement('span');
        const itemTotal = item.price * item.count;

        itemText.textContent = `${item.name} — ${itemTotal} рублей`;

        const controls = document.createElement('div');
        controls.className = 'quantity-controls';

        const minusButton = document.createElement('button');
        minusButton.type = 'button';
        minusButton.textContent = '-';

        minusButton.addEventListener('click', () => {
            if (item.count > 1) {
                item.count -= 1;
                saveCart();
                renderCart();
                return;
            }

            const index = cart.findIndex(product => product.name === item.name);

            if (index !== -1) {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            }
        });

        const countText = document.createElement('span');
        countText.textContent = item.count;

        const plusButton = document.createElement('button');
        plusButton.type = 'button';
        plusButton.textContent = '+';

        plusButton.addEventListener('click', () => {
            item.count += 1;
            saveCart();
            renderCart();
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Удалить';

        deleteButton.addEventListener('click', () => {
            const index = cart.findIndex(product => product.name === item.name);

            if (index !== -1) {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            }
        });

        controls.appendChild(minusButton);
        controls.appendChild(countText);
        controls.appendChild(plusButton);

        li.appendChild(itemText);
        li.appendChild(controls);
        li.appendChild(deleteButton);
        cartList.appendChild(li);

        total += itemTotal;
    });

    cartTotal.textContent = `Итого: ${total} рублей`;
    clearCartButton.disabled = cart.length === 0;
    showOrderFormButton.disabled = cart.length === 0;
    showOrderFormButton.hidden = cart.length === 0;
    orderSubmitButton.disabled = cart.length === 0;

    if (cart.length === 0) {
        orderForm.classList.remove('visible');
    }
}

document.querySelectorAll('.product button').forEach(button => {
    button.addEventListener('click', () => {
        const product = button.closest('.product');

        const name = product.querySelector('h3').textContent;
        const priceText = product.querySelector('.price').textContent;
        const price = Number(priceText.replace(/\D/g, ''));

        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.count += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                count: 1
            });
        }

        saveCart();
        renderCart();
        openCart();
    });
});

clearCartButton.addEventListener('click', () => {
    cart.length = 0;
    saveCart();
    renderCart();
});

cartToggleButton.addEventListener('click', openCart);
closeCartButton.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

showOrderFormButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Ошибка: нельзя оформить заказ, когда корзина пустая. Добавьте хотя бы один товар.');
        return;
    }

    orderForm.classList.add('visible');
});

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (cart.length === 0) {
        alert('Ошибка: нельзя оформить заказ, когда корзина пустая. Добавьте хотя бы один товар.');
        return;
    }

    const formData = new FormData(orderForm);

    const firstName = formData.get('firstName').trim();
    const lastName = formData.get('lastName').trim();
    const address = formData.get('address').trim();
    const phone = formData.get('phone').trim();

    if (!firstName || !lastName || !address || !phone) {
        alert('Заполните все поля');
        return;
    }

    alert('Заказ создан!');

    cart.length = 0;
    saveCart();
    renderCart();
    orderForm.reset();
    orderForm.classList.remove('visible');
});

renderCart();