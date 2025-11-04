(function () {
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !user) {
alert('Debes iniciar sesión para acceder al chat');
location.href = '/login.html';
return;
}


const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
logoutBtn.addEventListener('click', () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
location.href = '/login.html';
});
}


const socket = io('/', { auth: { token } });


const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');


function appendSystem(text) {
const el = document.createElement('div');
el.style.opacity = 0.75;
el.textContent = `• ${text}`;
chatBox.appendChild(el);
chatBox.scrollTop = chatBox.scrollHeight;
}


function appendMessage({ user, text, ts }) {
const row = document.createElement('div');
const time = new Date(ts).toLocaleTimeString();
row.innerHTML = `<strong>${user}</strong> <small>${time}</small><br>${text}`;
chatBox.appendChild(row);
chatBox.scrollTop = chatBox.scrollHeight;
}


socket.on('connect_error', (err) => {
appendSystem('Error de conexión: ' + (err?.message || 'desconocido'));
});


socket.on('chat:system', appendSystem);
socket.on('chat:message', appendMessage);


chatForm.addEventListener('submit', (e) => {
e.preventDefault();
const text = chatInput.value.trim();
if (!text) return;
socket.emit('chat:message', text);
chatInput.value = '';
});
})();