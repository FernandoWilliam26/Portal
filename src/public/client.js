const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');


const logoutBtn = document.getElementById('logoutBtn');
const chatLink = document.getElementById('chatLink');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const adminPanel = document.getElementById('adminPanel');


console.log('Sesion -> token?', !!token, 'user?', user);

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/index.html';
  });
}

if (token && user) {
  if (chatLink) chatLink.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (loginLink) loginLink.classList.add('hidden');
  if (registerLink) registerLink.classList.add('hidden');
  if (user.role === 'admin' && adminPanel) adminPanel.classList.remove('hidden');
} else {
  console.log('No estás logueado o el token es inválido');
}


const productsContainer = document.getElementById('products');
async function loadProducts() {
  if (!productsContainer) return;
  productsContainer.innerHTML = '<p>Cargando productos…</p>';
  try {
    const res = await fetch('/api/products');
    const items = await res.json();
    if (!Array.isArray(items)) throw new Error('Respuesta inesperada');

    productsContainer.innerHTML = '';
    if (items.length === 0) {
      productsContainer.innerHTML = '<p>No hay productos todavía.</p>';
      return;
    }

    items.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'product';
      const price = typeof p.price === 'number' ? p.price.toFixed(2) : '0.00';
      const img = p.imageUrl || `https://picsum.photos/seed/${p._id}/400/300`;
      const desc = p.description || '';
      card.innerHTML = `
        <img src="${img}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <div class="price">${price} €</div>
        <p>${desc}</p>
        <div class="actions ${user?.role === 'admin' ? '' : 'hidden'}">
          <button data-id="${p._id}" class="edit">Editar</button>
          <button data-id="${p._id}" class="delete">Eliminar</button>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    productsContainer.innerHTML = `<p style="color:#f87171">${err.message || 'Error cargando productos'}</p>`;
  }
}

if (productsContainer) loadProducts();


const createForm = document.getElementById('createForm');
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) { alert('Debes iniciar sesión.'); return; }

    const data = Object.fromEntries(new FormData(createForm));
    data.price = parseFloat(data.price);

    if (!data.name || Number.isNaN(data.price)) {
      alert('Nombre y precio válidos son obligatorios');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || 'Error al crear');
      createForm.reset();
      await loadProducts();
      alert('Producto creado');
    } catch (err) {
      alert(err.message || 'Error al crear');
    }
  });
}


if (productsContainer) {
  productsContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');

    if (btn.classList.contains('delete')) {
      if (!token) { alert('Debes iniciar sesión.'); return; }
      if (!confirm('¿Eliminar producto?')) return;
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) return alert(json.message || 'Error eliminando');
        await loadProducts();
      } catch (err) {
        alert(err.message || 'Error eliminando');
      }
    }

    if (btn.classList.contains('edit')) {
      if (!token) { alert('Debes iniciar sesión.'); return; }
      const name = prompt('Nuevo nombre:');
      if (!name) return;
      const priceStr = prompt('Nuevo precio (ej: 9.99):');
      const price = parseFloat(priceStr);
      if (Number.isNaN(price)) { alert('Precio inválido'); return; }
      const description = prompt('Nueva descripción:') || '';

      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name, price, description })
        });
        const json = await res.json();
        if (!res.ok) return alert(json.message || 'Error editando');
        await loadProducts();
      } catch (err) {
        alert(err.message || 'Error editando');
      }
    }
  });
}
