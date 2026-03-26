let token = null;
let isLogin = true;

// Toggle login/signup
function toggleAuth(){
  isLogin = !isLogin;

  document.getElementById("authTitle").innerText = isLogin ? "Login" : "Signup";
  document.getElementById("authBtn").innerText = isLogin ? "Login" : "Signup";
  document.getElementById("username").style.display = isLogin ? "none" : "block";

  document.getElementById("toggleText").innerHTML = isLogin 
    ? `Don't have an account? <span onclick="toggleAuth()">Create one</span>`
    : `Already have an account? <span onclick="toggleAuth()">Login</span>`;
}

// Handle Login / Signup
async function handleAuth(){
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if(isLogin){
    // LOGIN
    const res = await fetch('http://localhost:5000/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email,password})
    });

    const data = await res.json();

    if(data.token){
      token = data.token;
      document.getElementById('auth').style.display='none';
      document.getElementById('todo-app').style.display='block';
      loadTasks();
    } else {
      alert(data.error);
    }

  } else {
    // SIGNUP
    const username = document.getElementById('username').value;

    const res = await fetch('http://localhost:5000/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username,email,password})
    });

    const data = await res.json();
    alert(data.message);
    toggleAuth();
  }
}

// Add Task
async function addTask(){
  const input = document.getElementById('taskInput');
  const text = input.value;
  const schedule = document.getElementById('taskSchedule').value;

  if(!text || !token) return;

  const res = await fetch('http://localhost:5000/tasks',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':token},
    body: JSON.stringify({text,schedule})
  });

  const task = await res.json();
  renderTask(task);
  input.value='';
}

// Render Task
function renderTask(task){
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = `${task.text} [${task.schedule}]`;

  if(task.completed){
    span.classList.add('completed');
    li.style.background = '#d4edda';
  }

  const completeBtn = document.createElement('button');
  completeBtn.textContent = '✔️';
  completeBtn.onclick = async () => {
    const res = await fetch(`http://localhost:5000/tasks/${task._id}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':token},
      body: JSON.stringify({completed:!task.completed})
    });

    const updated = await res.json();
    task.completed = updated.completed;
    span.classList.toggle('completed');
    li.style.background = updated.completed ? '#d4edda' : '#f9f9f9';
  };

  const delBtn = document.createElement('button');
  delBtn.textContent = '❌';
  delBtn.onclick = async () => {
    await fetch(`http://localhost:5000/tasks/${task._id}`,{
      method:'DELETE',
      headers:{'Authorization':token}
    });
    li.remove();
  };

  li.appendChild(span);
  li.appendChild(completeBtn);
  li.appendChild(delBtn);

  document.getElementById('taskList').appendChild(li);
}

// Load Tasks
async function loadTasks(){
  const res = await fetch('http://localhost:5000/tasks',{
    headers:{'Authorization':token}
  });

  const tasks = await res.json();
  document.getElementById('taskList').innerHTML = '';

  tasks.forEach(task => renderTask(task));
}

// Enter key support
document.getElementById("taskInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});