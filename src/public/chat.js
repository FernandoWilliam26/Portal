(function () {
  // Primero, verificamos si el token y el usuario están en localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Si no hay token o no hay usuario, redirigir a login
  if (!token || !user) {
    alert('Debes iniciar sesión para acceder al chat');
    location.href = '/login.html'; // Redirige a la página de login
    return; // Sale de la función autoejecutable si no hay token
  }

  // --- Selección de color por el usuario ---
  // Función para validar que el color esté en formato HEX
  function validarHex(c) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c); // Validación de color HEX
  }

  // Intentar obtener el color desde localStorage
  let chosenColor = localStorage.getItem('chatColor') || '';

  // Si no hay color guardado, pedir al usuario que ingrese un color
  if (!chosenColor || !validarHex(chosenColor)) {
    const input = prompt("Por favor, ingresa tu color en formato HEX (p. ej. #FF6347):");

    // Validar que el color ingresado sea correcto, sino usar un color predeterminado
    chosenColor = validarHex(input || '') ? input : '#1E90FF'; // Si no es válido, asigna un color predeterminado
    localStorage.setItem('chatColor', chosenColor); // Guardamos el color en localStorage
  }

  // Guardar el color en localStorage
  localStorage.setItem('chatColor', chosenColor);

  // Función de logout (cerrar sesión)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = '/login.html'; // Redirige a la página de login
    });
  }

  // Conectar pasando token + color elegido a Socket.IO
  const socket = io('/', { auth: { token, color: chosenColor } });

  const chatBox = document.getElementById('chatBox');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  // Función para mostrar mensajes de sistema (conexión/desconexión)
  function appendSystem(text) {
    const el = document.createElement('div');
    el.style.opacity = 0.75;
    el.textContent = `• ${text}`;
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Función para mostrar un mensaje
  function appendMessage({ user, text, ts, color }) {
    const row = document.createElement('div');
    const time = new Date(ts).toLocaleTimeString();
    const nameColor = color || '#fff';
    row.innerHTML = `<strong style="color:${nameColor}">${user}</strong> <small>${time}</small><br>${text}`;
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Manejo de errores de conexión
  socket.on('connect_error', (err) => {
    appendSystem('Error de conexión: ' + (err?.message || 'desconocido'));
  });

  // Recibir mensaje del sistema
  socket.on('chat:system', appendSystem);

  // Recibir mensaje de chat
  socket.on('chat:message', (msg) => {
    // msg: { user, text, ts, color }
    appendMessage(msg);
  });

  // *** El evento de click para "Entrar al chat" ***
  const joinChatBtn = document.getElementById('joinChat');
  const colorPickerContainer = document.getElementById('colorPickerContainer');
  const chatContainer = document.getElementById('chatContainer');

  joinChatBtn.addEventListener('click', () => {
    // Al hacer clic en el botón, ocultamos el selector de color y mostramos el chat
    colorPickerContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    // Conectar al chat con el token y el color seleccionado
    socket.emit('chat:join', { username: user.username, color: chosenColor });
  });

  // Enviar mensaje en el chat
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return; // Si el texto está vacío, no enviar
    socket.emit('chat:message', text); // Enviar mensaje
    chatInput.value = ''; // Limpiar el campo de texto
  });
})();




