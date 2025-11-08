(function () {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  
  if (!token || !user) {
    alert('Debes iniciar sesión para acceder al chat');
    location.href = '/login.html'; 
    return;
  }

  function validarHex(c) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c); 
  }

  
  let chosenColor = localStorage.getItem('chatColor') || '';


  if (!chosenColor || !validarHex(chosenColor)) {
    const input = prompt("Por favor, ingresa tu color en formato HEX (p. ej. #FF6347):");

  
    chosenColor = validarHex(input || '') ? input : '#1E90FF'; 
    localStorage.setItem('chatColor', chosenColor); 
  }

 
  localStorage.setItem('chatColor', chosenColor);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = '/login.html'; 
    });
  }

  
  const socket = io('/', { auth: { token, color: chosenColor } });

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

  
  function appendMessage({ user, text, ts, color }) {
    const row = document.createElement('div');
    const time = new Date(ts).toLocaleTimeString();
    const nameColor = color || '#fff';
    row.innerHTML = `<strong style="color:${nameColor}">${user}</strong> <small>${time}</small><br>${text}`;
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  
  socket.on('connect_error', (err) => {
    appendSystem('Error de conexión: ' + (err?.message || 'desconocido'));
  });

  
  socket.on('chat:system', appendSystem);

  
  socket.on('chat:message', (msg) => {
   
    appendMessage(msg);
  });

  
  const joinChatBtn = document.getElementById('joinChat');
  const colorPickerContainer = document.getElementById('colorPickerContainer');
  const chatContainer = document.getElementById('chatContainer');

  joinChatBtn.addEventListener('click', () => {
  
    colorPickerContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    
    socket.emit('chat:join', { username: user.username, color: chosenColor });
  });

  
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return; 
    socket.emit('chat:message', text); 
    chatInput.value = ''; 
  });
})();




