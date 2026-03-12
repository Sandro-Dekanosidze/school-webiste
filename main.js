

const API_URL = 'http://localhost:3005';

const state = {
    isAuthenticated: false,
    currentUser: null,
    currentView: 'dashboard',
    teachers: [],
    students: [],
    news: [],
    timetable: [],
    exams: [],
    events: [],
    materials: [],
    attendance: [],
    notifications: [],
    homework: []
};

const teacherRoles = [
    'დირექტორი', 'სასწავლო ნაწილი', 'მათემატიკა', 'ფიზიკა', 'ქიმია', 
    'ბიოლოგია', 'გეოგრაფია', 'ქართული', 'ინგლისური', 'რუსული', 
    'გერმანული', 'მუსიკა', 'ხელოვნება', 'სპორტი', 'ისტორია', 'საქართველოს ისტორია'
];

async function pushNotification(text) {
    try {
        await fetch(`${API_URL}/api/notifications`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, date: new Date().toLocaleTimeString(), read: false })
        });
    } catch(e){}
}

// --- Auth ---
const loginForm = document.getElementById('login-form');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            state.isAuthenticated = true;
            state.currentUser = data.user;
            initDashboard();
        } else { alert('არასწორი მონაცემები'); }
    } catch (err) { alert('Backend-თან კავშირი ვერ დამყარდა'); }
});

function initDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    document.body.classList.remove('login-layout');
    renderSidebar();
    renderAIBot();
    showView('dashboard');
}

async function showView(view) {
    state.currentView = view;
    updateActiveNavLink();
    await renderMainContent();
}

function updateActiveNavLink() {
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.view === state.currentView);
    });
}

// --- Sidebar ---
function renderSidebar() {
    const isAdmin = state.currentUser && state.currentUser.email === 'sdekanosidze1010@gmail.com';
    dashboardSection.innerHTML = `
        <div class="sidebar glass">
            <div class="brand" style="margin-bottom: 30px; display:flex; align-items:center; gap:10px;">
                <i class="fas fa-school logo-icon"></i><h1 class="school-name">SchoolOS</h1>
            </div>
            <nav style="flex-grow:1; overflow-y:auto;">
                <div class="nav-link" data-view="dashboard" onclick="showView('dashboard')"><i class="fas fa-th-large"></i> პანელი</div>
                <div class="nav-link" data-view="teachers" onclick="showView('teachers')"><i class="fas fa-chalkboard-teacher"></i> მასწავლებლები</div>
                <div class="nav-link" data-view="students" onclick="showView('students')"><i class="fas fa-user-graduate"></i> მოსწავლეები</div>
                <div class="nav-link" data-view="exams" onclick="showView('exams')"><i class="fas fa-file-invoice"></i> გამოცდები</div>
                <div class="nav-link" data-view="attendance" onclick="showView('attendance')"><i class="fas fa-clipboard-check"></i> დასწრება</div>
                <div class="nav-link" data-view="timetable" onclick="showView('timetable')"><i class="fas fa-calendar-alt"></i> ცხრილი</div>
                <div class="nav-link" data-view="materials" onclick="showView('materials')"><i class="fas fa-book"></i> მასალები</div>
                <div class="nav-link" data-view="events" onclick="showView('events')"><i class="fas fa-star"></i> კალენდარი</div>
                ${isAdmin ? `<div class="nav-link" data-view="users" onclick="showView('users')"><i class="fas fa-users-cog"></i> მომხმარებლები</div>` : ''}
            </nav>
            <div class="nav-link" onclick="location.reload()" style="margin-top:auto;"><i class="fas fa-sign-out-alt"></i> გამოსვლა</div>
        </div>
        <div id="main-content" class="main-content"></div>
    `;
}

// --- AI BOT ---
function renderAIBot() {
    const boat = document.createElement('div');
    boat.innerHTML = `
        <div class="ai-bot-trigger" onclick="toggleAIChat()"><i class="fas fa-robot"></i></div>
        <div class="ai-chat-window" id="ai-chat">
            <div class="chat-header"><span>School AI</span> <i class="fas fa-times" onclick="toggleAIChat()" style="cursor:pointer"></i></div>
            <div class="chat-messages" id="chat-msgs"><div class="msg bot">გამარჯობა! მე სკოლის AI ვარ.</div></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="ჰკითხეთ AI-ს..." style="flex:1; background:transparent; border:none; color:white; outline:none;">
                <button onclick="sendChatMessage()" style="background:none; border:none; color:var(--primary); cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>`;
    document.body.appendChild(boat);
    document.getElementById('chat-input').onkeypress = (e) => { if(e.key==='Enter') sendChatMessage(); };
}

function toggleAIChat() { const w = document.getElementById('ai-chat'); w.style.display = w.style.display==='flex'?'none':'flex'; }
async function sendChatMessage() {
    const inp = document.getElementById('chat-input');
    const msgs = document.getElementById('chat-msgs');
    if(!inp.value.trim()) return;
    const txt = inp.value;
    msgs.innerHTML += `<div class="msg user">${txt}</div>`;
    inp.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    
    let r = "ვერ გიპასუხეთ, სცადეთ სიტყვები: მოსწავლე, მასწავლებელი, ცხრილი.";
    if(txt.includes('მოსწავლე')) r = `სულ რეგისტრირებულია ${ (await fetch(`${API_URL}/api/students`).then(r=>r.json())).length } მოსწავლე.`;
    else if(txt.includes('მასწავლებელი')) r = `სულ გვყავს ${ (await fetch(`${API_URL}/api/teachers`).then(r=>r.json())).length } მასწავლებელი.`;
    
    setTimeout(() => { msgs.innerHTML += `<div class="msg bot">${r}</div>`; msgs.scrollTop = msgs.scrollHeight; }, 500);
}

// --- Dynamic Header ---
async function renderHeader(title) {
    let unread = 0;
    try {
        const notifs = await fetch(`${API_URL}/api/notifications`).then(r=>r.json());
        unread = notifs.filter(n=>!n.read).length;
    } catch(e) {}
    
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    return `
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; width: 100%;">
            <div>
                <h1 style="font-size: 1.8rem; font-weight: 700;">${title}</h1>
                ${!isAdmin ? '<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;"><i class="fas fa-eye"></i> მხოლოდ ნახვის რეჟიმი</p>' : ''}
            </div>
            <div style="display:flex; align-items:center; gap:20px;">
                <div class="notif-bell" onclick="showNotifs()">
                    <i class="fas fa-bell"></i>
                    ${unread ? `<span class="notif-badge">${unread}</span>` : ''}
                </div>
                <div style="background:rgba(23,201,100,0.1); color:#17c964; padding:5px 12px; border-radius:20px; font-size:0.8rem; font-weight: 600;">სერვერი ჩართულია</div>
            </div>
        </header>`;
}

// --- Switch Views ---
async function renderMainContent() {
    const container = document.getElementById('main-content');
    if (!container) return;
    container.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%;"><div class="loader">იტვირთება...</div></div>';
    
    const titles = {
        'dashboard': 'მთავარი პანელი',
        'teachers': 'მასწავლებლების მართვა',
        'students': 'მოსწავლეების მართვა',
        'exams': 'გამოცდების შედეგები',
        'attendance': 'დასწრების აღრიცხვა',
        'timetable': 'სასწავლო ცხრილი',
        'materials': 'სასწავლო მასალები',
        'events': 'კალენდარი',
        'users': 'მომხმარებლების მართვა'
    };
    
    const headerHtml = await renderHeader(titles[state.currentView] || state.currentView);
    
    try {
        switch(state.currentView){
            case 'dashboard': await renderDashboard(container, headerHtml); break;
            case 'teachers': await renderManagement(container, 'teachers', headerHtml); break;
            case 'students': await renderManagement(container, 'students', headerHtml); break;
            case 'exams': await renderExams(container, headerHtml); break;
            case 'attendance': await renderAttendance(container, headerHtml); break;
            case 'timetable': await renderTimetable(container, headerHtml); break;
            case 'materials': await renderMaterials(container, headerHtml); break;
            case 'events': await renderEvents(container, headerHtml); break;
            case 'users': await renderUsers(container, headerHtml); break;
        }
    } catch (err) {
        container.innerHTML = `${headerHtml} <div class="error-card">მონაცემების ჩატვირთვა ვერ მოხერხდა.</div>`;
    }
}

// --- DASHBOARD (Role-Based) ---
async function renderDashboard(container, headerHtml) {
    const email = state.currentUser ? state.currentUser.email : '';
    const isTeacherEmail = email.endsWith('@teachers.gov.ge');
    const isStudentEmail = email.endsWith('@students.gov.ge');
    const isAdmin = email === 'sdekanosidze1010@gmail.com' || state.currentUser.role === 'admin';
    
    const [news, students, teachers, exams, events, timetable, homework] = await Promise.all([
        fetch(`${API_URL}/api/news`).then(r=>r.json()),
        fetch(`${API_URL}/api/students`).then(r=>r.json()),
        fetch(`${API_URL}/api/teachers`).then(r=>r.json()),
        fetch(`${API_URL}/api/exams`).then(r=>r.json()),
        fetch(`${API_URL}/api/events`).then(r=>r.json()),
        fetch(`${API_URL}/api/timetable`).then(r=>r.json()),
        fetch(`${API_URL}/api/homework`).then(r=>r.json())
    ]);

    const daysGeo = { 0: 'კვირა', 1: 'ორშაბათი', 2: 'სამშაბათი', 3: 'ოთხშაბათი', 4: 'ხუთშაბათი', 5: 'პარასკევი', 6: 'შაბათი' };
    const todayGeo = daysGeo[new Date().getDay()];

    if (isAdmin) {
        // ADMIN DASHBOARD
        const pass = exams.length ? Math.round((exams.filter(e=>e.status==='ჩააბარა').length/exams.length)*100) : 0;
        container.innerHTML = `
            ${headerHtml}
            <div class="analytics-grid">
                <div class="stat-card glass"><h3 class="stat-value">${students.length}</h3><p class="stat-label">მოსწავლე</p></div>
                <div class="stat-card glass"><h3 class="stat-value">${teachers.length}</h3><p class="stat-label">მასწავლებელი</p></div>
                <div class="stat-card glass" style="border-bottom:3px solid var(--primary);"><h3 class="stat-value">${pass}%</h3><p class="stat-label">აკადემიური მოსწრება</p></div>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">
                <div class="glass" style="padding:20px; border-radius:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h2><i class="fas fa-newspaper"></i> ბოლო სიახლეები</h2>
                        <button class="button-primary" onclick="showAddNewsModal()">+</button>
                    </div>
                    ${news.reverse().slice(0,3).map(n=>`
                        <div class="event-row">
                            <div><small style="color:var(--primary)">${n.date}</small><p style="margin:5px 0;">${n.text}</p></div>
                            <button class="btn-icon delete" onclick="deleteBackendItem('news',${n.id})">×</button>
                        </div>`).join('')}
                </div>
                <div class="glass" style="padding:20px; border-radius:12px;">
                    <h2><i class="fas fa-calendar-star"></i> მოვლენები</h2>
                    ${events.slice(0,5).map(e=>`<div class="event-row"><div class="event-dot"></div><span>${e.date} - ${e.title}</span></div>`).join('')}
                </div>
            </div>`;
    } else if (isTeacherEmail) {
        // TEACHER DASHBOARD
        const teacherProfile = teachers.find(t => t.email === email);
        const myClassesToday = teacherProfile ? timetable.filter(tt => tt.teacherId == teacherProfile.id && tt.day === todayGeo) : [];
        
        container.innerHTML = `
            ${headerHtml}
            <div class="dashboard-role-grid">
                <div class="dashboard-card glass">
                    <h2><i class="fas fa-clock"></i> ჩემი ცხრილი დღეს (${todayGeo})</h2>
                    <div class="today-timetable">
                        ${myClassesToday.length ? myClassesToday.map(c => `
                            <div class="timetable-row-small">
                                <span><i class="fas fa-users"></i> ${c.class} კლასი</span>
                                <button class="button-primary" style="padding:4px 10px; font-size:0.7rem;" onclick="showView('attendance')">დასწრება</button>
                            </div>
                        `).join('') : '<p style="color:var(--text-muted)">დღეს ცხრილში გაკვეთილი არ გაქვთ.</p>'}
                    </div>
                </div>
                <div class="dashboard-card glass">
                    <h2><i class="fas fa-tasks"></i> დავალებები</h2>
                    <button class="button-primary" onclick="showAddHomeworkModal()">ახალი დავალება</button>
                    <div class="homework-list" style="margin-top:15px;">
                        ${teacherProfile ? homework.filter(h => h.teacherId == teacherProfile.id).slice(0,3).map(h => `
                            <div class="homework-item">
                                <div class="homework-info"><h4>${h.title}</h4><p>${h.class} კლასი</p></div>
                                <button class="btn-icon delete" onclick="deleteBackendItem('homework',${h.id})">×</button>
                            </div>
                        `).join('') : '<p style="color:var(--text-muted)">დავალებები არ არის.</p>'}
                    </div>
                </div>
            </div>`;
    } else if (isStudentEmail) {
        // STUDENT DASHBOARD
        const studentProfile = students.find(s => s.email === email);
        const studentClass = studentProfile ? studentProfile.role : '';
        const myGrades = exams.filter(e => e.studentName === state.currentUser.name || e.studentEmail === email);
        
        // Show ALL classes for the student's class
        const myClassScheduleToday = timetable.filter(tt => tt.class === studentClass && tt.day === todayGeo);
        const myHomework = homework.filter(h => h.class === studentClass);

        container.innerHTML = `
            ${headerHtml}
            <div class="dashboard-role-grid">
                <div class="dashboard-card glass">
                    <h2><i class="fas fa-graduation-cap"></i> ჩემი ნიშნები</h2>
                    <div class="homework-list">
                        ${myGrades.length ? myGrades.map(g => `
                            <div class="homework-item">
                                <div class="homework-info"><h4>${g.subject}</h4><p>${g.status}</p></div>
                                <div class="progress-bar-container" style="width:60px;"><div class="progress-bar-fill" style="width:${g.status==='ჩააბარა'?'100%':'30%'}; background:${g.status==='ჩააბარა'?'#17c964':'#f31260'}"></div></div>
                            </div>
                        `).join('') : '<p style="color:var(--text-muted)">ნიშნები ჯერ არ გაქვთ.</p>'}
                    </div>
                </div>
                <div class="dashboard-card glass">
                    <h2><i class="fas fa-calendar-day"></i> ჩემი კლასის ცხრილი (${studentClass})</h2>
                    <div class="today-timetable">
                        ${myClassScheduleToday.length ? myClassScheduleToday.map(c => {
                            const t = teachers.find(tea => tea.id == c.teacherId);
                            return `<div class="timetable-row-small">
                                <span><i class="fas fa-book"></i> ${t ? t.role : 'გაკვეთილი'}</span>
                                <span style="font-weight:600;">${t ? t.name : 'მასწავლებელი'}</span>
                            </div>`;
                        }).join('') : '<p style="color:var(--text-muted)">დღეს გაკვეთილები არ გაქვთ.</p>'}
                    </div>
                </div>
                <div class="dashboard-card glass">
                    <h2><i class="fas fa-book-open"></i> მიმდინარე დავალებები</h2>
                    <div class="homework-list">
                        ${myHomework.length ? myHomework.map(h => `
                            <div class="homework-item">
                                <div class="homework-info"><h4>${h.title}</h4><p>${h.subject} - ბოლო ვადა: ${h.deadline || '---'}</p></div>
                            </div>
                        `).join('') : '<p style="color:var(--text-muted)">დავალებები არ გაქვთ.</p>'}
                    </div>
                </div>
            </div>`;
    }
}

// --- MANAGEMENT ---
async function renderManagement(container, type, headerHtml) {
    const res = await fetch(`${API_URL}/api/${type}`);
    const items = await res.json();
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    container.innerHTML = `
        ${headerHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap: 20px; flex-wrap: wrap;">
            <div class="search-container">
                <i class="fas fa-search"></i>
                <input type="text" id="srch" placeholder="მოძებნეთ სახელით ან როლით..." class="search-input">
            </div>
            ${isAdmin ? `
            <button class="button-primary" onclick="showAddModal('${type}')">
                <i class="fas fa-plus"></i> დამატება
            </button>` : ''}
        </div>
        <div class="glass" style="padding:10px; border-radius:16px; overflow-x: auto;">
            <table class="management-table">
                <thead>
                    <tr>
                        <th>სახელი</th>
                        <th>${type==='teachers'?'საგანი':'კლასი'}</th>
                        <th>ტელეფონი</th>
                        ${isAdmin ? '<th style="text-align:right;">მოქმედება</th>' : ''}
                    </tr>
                </thead>
                <tbody id="mgmt-body"></tbody>
            </table>
        </div>`;

    const tbody = container.querySelector('#mgmt-body');
    const updateTable = (data) => {
        tbody.innerHTML = data.length ? data.map(i=>`
            <tr>
                <td style="font-weight: 500;">${i.name}</td>
                <td><span class="role-badge">${i.role}</span></td>
                <td>
                    ${i.phone ? `
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${i.phone}
                            <a href="https://wa.me/${i.phone.replace(/\s/g,'')}" target="_blank" class="whatsapp-link" title="WhatsApp-ში მიწერა">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    ` : '<span style="color:var(--text-muted)">---</span>'}
                </td>
                ${isAdmin ? `
                <td style="text-align:right;">
                    <button class="btn-icon" onclick="showEditModal('${type}', ${JSON.stringify(i).replace(/"/g, '&quot;')})" title="რედაქტირება" style="margin-right:10px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteBackendItem('${type}',${i.id})" title="წაშლა">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>` : ''}
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-muted);">მონაცემები არ მოიძებნა</td></tr>';
    };

    updateTable(items);
    container.querySelector('#srch').oninput = (e) => {
        const t = e.target.value.toLowerCase();
        updateTable(items.filter(x => 
            (x.name && x.name.toLowerCase().includes(t)) || 
            (x.role && x.role.toLowerCase().includes(t))
        ));
    };
}

// --- ATTENDANCE ---
async function renderAttendance(container, headerHtml) {
    const students = await fetch(`${API_URL}/api/students`).then(r=>r.json());
    const attend = await fetch(`${API_URL}/api/attendance`).then(r=>r.json());
    const today = new Date().toISOString().split('T')[0];
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    container.innerHTML = `
        ${headerHtml}
        <table class="management-table"><thead><tr><th>მოსწავლე</th><th>კლასი</th><th>სტატუსი</th></tr></thead>
        <tbody>${students.map(s=>{
            const st = attend.find(a=>a.studentId==s.id && a.date==today)?.status || '---';
            return `<tr><td>${s.name}</td><td>${s.role}</td><td>
                ${isAdmin ? `
                <button class="button-secondary" style="background:${st==='აქაა'?'#17c964':''}; color:${st==='აქაა'?'#fff':''}" onclick="markAt(${s.id},'აქაა')">აქაა</button>
                <button class="button-secondary" style="background:${st==='არაა'?'#f31260':''}; color:${st==='არაა'?'#fff':''}" onclick="markAt(${s.id},'არაა')">არაა</button>
                ` : `<span class="role-badge" style="background:${st==='აქაა'?'#17c964':'#f31260'}; color:#fff">${st}</span>`}
            </td></tr>`;
        }).join('')}</tbody></table>`;
}
window.markAt = async(sid, st) => {
    await fetch(`${API_URL}/api/attendance`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({studentId:sid, status:st, date:new Date().toISOString().split('T')[0]})});
    renderMainContent();
};

// --- EXAMS + PROGRESS ---
async function renderExams(container, headerHtml) {
    const exams = await fetch(`${API_URL}/api/exams`).then(r=>r.json());
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    container.innerHTML = `
        ${headerHtml}
        ${isAdmin ? '<div style="text-align:right; margin-bottom:15px;"><button class="button-primary" onclick="showAddExamModal()">შედეგის დამატება</button></div>' : ''}
        <table class="management-table">
            <thead><tr><th>მოსწავლე</th><th>საგანი</th><th>შედეგი</th>${isAdmin ? '<th style="text-align:right;">მოქმედება</th>' : ''}</tr></thead>
            <tbody>${exams.map(e => `
                <tr>
                    <td>
                        <div style="margin-bottom:5px;">${e.studentName}</div>
                        <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${e.status==='ჩააბარა'?'100%':'30%'}; background:${e.status==='ჩააბარა'?'#17c964':'#f31260'}"></div></div>
                    </td>
                    <td>${e.subject}</td><td style="color:${e.status==='ჩააბარა'?'#11c964':'#f31260'}">${e.status}</td>
                    ${isAdmin ? `
                    <td style="text-align:right;">
                        <button class="btn-icon" onclick="showEditModal('exams', ${JSON.stringify(e).replace(/"/g, '&quot;')})" title="რედაქტირება" style="margin-right:10px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${e.status==='ჩააბარა'?`<button class="btn-icon" style="color:#d4af37;" onclick="genCert('${e.studentName}','${e.subject}')"><i class="fas fa-medal"></i></button>` : ''}
                        <button class="btn-icon delete" onclick="deleteBackendItem('exams',${e.id})">×</button>
                    </td>` : ''}
                </tr>`).join('')}</tbody></table>`;
}

// --- TIMETABLE (FullCalendar) ---
async function renderTimetable(container, headerHtml) {
    const [tArr, ttArr, sArr] = await Promise.all([
        fetch(`${API_URL}/api/teachers`).then(r=>r.json()), 
        fetch(`${API_URL}/api/timetable`).then(r=>r.json()),
        fetch(`${API_URL}/api/students`).then(r=>r.json())
    ]);
    const email = state.currentUser ? state.currentUser.email : '';
    const isStudentEmail = email.endsWith('@students.gov.ge');
    const isAdmin = email === 'sdekanosidze1010@gmail.com' || state.currentUser.role === 'admin';
    
    let filteredEvents = ttArr;
    if (isStudentEmail) {
        const student = sArr.find(s => s.email === email);
        if (student) {
            filteredEvents = ttArr.filter(item => item.class === student.role);
        }
    }

    container.innerHTML = `
        ${headerHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <p style="color:var(--text-muted)">${isStudentEmail ? 'თქვენი კლასის ცხრილი' : 'სასწავლო ბადე'}</p>
            <div style="display:flex; gap:10px;">
                ${isAdmin ? `
                    <button class="button-primary" style="background:var(--danger)" onclick="clearFullTimetable()">ცხრილის გასუფთავება</button>
                    <button class="button-primary" onclick="showAddTimetableModal()">ცხრილში დამატება</button>
                ` : ''}
            </div>
        </div>
        <div id="calendar-container">
            <div id="calendar"></div>
        </div>`;
    
    // ... rest of the function remains the same ...
    const dayMap = { 'ორშაბათი': 1, 'სამშაბათი': 2, 'ოთხშაბათი': 3, 'ხუთშაბათი': 4, 'პარასკევი': 5, 'შაბათი': 6, 'კვირა': 0 };
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
        locale: 'ka',
        events: filteredEvents.map(item => {
            const teacher = tArr.find(t => t.id == item.teacherId);
            return {
                title: `${item.class} - ${teacher ? (teacher.role + ': ' + teacher.name) : ''}`,
                daysOfWeek: [dayMap[item.day]],
                display: 'block',
                extendedProps: { id: item.id }
            };
        }),
        eventClick: function(info) {
            if (isAdmin && confirm('წავშალოთ ეს ჩანაწერი ცხრილიდან?')) {
                deleteBackendItem('timetable', info.event.extendedProps.id);
            }
        }
    });
    calendar.render();
}

window.clearFullTimetable = async () => {
    if (confirm('დარწმუნებული ხართ, რომ გსურთ მთლიანი ცხრილის წაშლა? ამ მოქმედების გაუქმება შეუძლებელია.')) {
        const tt = await fetch(`${API_URL}/api/timetable`).then(r=>r.json());
        for (let item of tt) {
            await fetch(`${API_URL}/api/timetable/${item.id}`, { method: 'DELETE' });
        }
        renderMainContent();
    }
};

// --- MATERIALS FIXED ---
async function renderMaterials(container, headerHtml) {
    const mats = await fetch(`${API_URL}/api/materials`).then(r=>r.json());
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    container.innerHTML = `
        ${headerHtml}
        ${isAdmin ? '<div style="text-align:right; margin-bottom:15px;"><button class="button-primary" onclick="showAddMaterialModal()">ატვირთვა</button></div>' : ''}
        <div class="analytics-grid">${mats.map(m=>`
            <div class="stat-card glass" style="align-items:flex-start; height:auto;">
                <h3>${m.title}</h3><p style="font-size:0.8rem; margin:10px 0;">${m.teacher}</p>
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <a href="${m.link}" class="button-primary" style="font-size:0.8rem; padding:5px 12px; text-decoration:none">გახსნა</a>
                    ${isAdmin ? `<button class="btn-icon delete" onclick="deleteBackendItem('materials',${m.id})">×</button>` : ''}
                </div>
            </div>`).join('')}</div>`;
}

// --- EVENTS FIXED ---
async function renderEvents(container, headerHtml) {
    const evs = await fetch(`${API_URL}/api/events`).then(r=>r.json());
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    
    container.innerHTML = `
        ${headerHtml}
        ${isAdmin ? '<div style="text-align:right; margin-bottom:15px;"><button class="button-primary" onclick="showAddEventModal()">დამატება</button></div>' : ''}
        <div class="news-container">${evs.map(e=>`<div class="event-row"><b>${e.date}</b><span>${e.title}</span>${isAdmin ? `<button class="btn-icon delete" onclick="deleteBackendItem('events',${e.id})">×</button>` : ''}</div>`).join('')}</div>`;
}

// --- USERS MANAGEMENT ---
async function renderUsers(container, headerHtml) {
    const users = await fetch(`${API_URL}/api/users`).then(r=>r.json());
    container.innerHTML = `
        ${headerHtml}
        <div style="text-align:right; margin-bottom:20px;">
            <button class="button-primary" onclick="showRegisterModal()">ახალი მომხმარებლის რეგისტრაცია</button>
        </div>
        <div class="glass" style="padding:20px; border-radius:12px;">
            <table class="management-table">
                <thead><tr><th>სახელი</th><th>Email</th><th>როლი</th><th style="text-align:right;">მოქმედება</th></tr></thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td><span class="role-badge">${u.role}</span></td>
                            <td style="text-align:right;">
                                ${u.email !== 'sdekanosidze1010@gmail.com' ? `
                                    <button class="btn-icon delete" onclick="deleteBackendItem('users','${u.email}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
}

window.showRegisterModal = () => {
    let h = `
        <div class="input-group"><label>სახელი</label><input type="text" id="r-name" class="input-field" placeholder="მაგ: ნინო ბაქრაძე"></div>
        <div class="input-group"><label>Email</label><input type="email" id="r-email" class="input-field" placeholder="example@mail.com"></div>
        <div class="input-group"><label>პაროლი</label><input type="password" id="r-pass" class="input-field"></div>
    `;
    openModal('მომხმარებლის რეგისტრაცია', h, async () => {
        const name = document.getElementById('r-name').value;
        const email = document.getElementById('r-email').value;
        const password = document.getElementById('r-pass').value;
        
        if(!email || !password) return alert('გთხოვთ შეავსოთ ყველა ველი');

        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                adminEmail: state.currentUser.email 
            })
        });
        const data = await res.json();
        if(data.success) {
            alert(data.message);
            renderMainContent();
        } else {
            alert(data.message);
        }
    });
};

// --- MODAL UTILITIES ---
const modal = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalSubmitBtn = document.getElementById('modal-submit-btn');

function openModal(title, html, onConfirm) {
    modalTitle.textContent = title; modalBody.innerHTML = html; modal.style.display = 'flex'; modalSubmitBtn.style.display='block';
    modalSubmitBtn.onclick = async () => { await onConfirm(); closeModal(); };
}
function closeModal() { modal.style.display = 'none'; }
window.closeModal = closeModal;

window.showNotifs = async() => {
    const n = await fetch(`${API_URL}/api/notifications`).then(r=>r.json());
    const unread = n.filter(x => !x.read);
    const content = unread.length ? unread.reverse().map(x=>`<div class="event-row"><small>${x.date}</small><p>${x.text}</p></div>`).join('') : '<div style="text-align:center; padding:20px; color:var(--text-muted)">შეტყობინებები არ არის</div>';
    
    openModal('შეტყობინებები', content, async()=>{
        // Delete or Mark as Read - User wants them to disappear/clear
        for(let x of unread) {
            await fetch(`${API_URL}/api/notifications/${x.id}`, { method: 'DELETE' });
        }
        renderMainContent();
    });
    modalSubmitBtn.textContent = unread.length ? 'წაშლა / წაკითხულად მონიშვნა' : 'დახურვა';
};

window.deleteBackendItem = async(t,id) => { 
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';
    if (!isAdmin) return alert('თქვენ არ გაქვთ წაშლის უფლება');
    if(confirm('წაშლა?')){ await fetch(`${API_URL}/api/${t}/${id}`,{method:'DELETE'}); renderMainContent(); } 
};

window.showEditModal = (type, item) => {
    let h = '';
    const fields = Object.keys(item).filter(f => f !== 'id' && f !== 'date');
    
    fields.forEach(f => {
        let label = f === 'name' ? 'სახელი' : (f === 'role' ? (type === 'teachers' ? 'საგანი' : 'კლასი') : f);
        if (f === 'phone') label = 'ტელეფონი';
        if (f === 'email') label = 'Email';
        if (f === 'status') {
            h += `<div class="input-group"><label>${label}</label><select id="edit-${f}" class="input-field">
                    <option value="ჩააბარა" ${item[f] === 'ჩააბარა' ? 'selected' : ''}>ჩააბარა</option>
                    <option value="ჩაიჭრა" ${item[f] === 'ჩაიჭრა' ? 'selected' : ''}>ჩაიჭრა</option>
                  </select></div>`;
        } else if (f === 'role' && type === 'teachers') {
            h += `<div class="input-group"><label>${label}</label><select id="edit-${f}" class="input-field">
                    ${teacherRoles.map(r => `<option value="${r}" ${item[f] === r ? 'selected' : ''}>${r}</option>`).join('')}
                  </select></div>`;
        } else {
            h += `<div class="input-group"><label>${label}</label><input type="text" id="edit-${f}" class="input-field" value="${item[f] || ''}"></div>`;
        }
    });

    openModal('რედაქტირება', h, async () => {
        const updatedData = {};
        fields.forEach(f => {
            updatedData[f] = document.getElementById(`edit-${f}`).value;
        });
        
        await fetch(`${API_URL}/api/${type}/${type === 'users' ? item.email : item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        renderMainContent();
    });
};

// --- FORM MODALS ---
window.showAddModal = (type) => {
    let h = `<div class="input-group"><label>სახელი</label><input type="text" id="f-name" class="input-field"></div>`;
    if(type==='teachers') h+=`<div class="input-group"><label>როლი (საგანი)</label><select id="f-role" class="input-field">${teacherRoles.map(r=>`<option value="${r}">${r}</option>`).join('')}</select></div>`;
    else h+=`<div class="input-group"><label>კლასი</label><input type="text" id="f-role" class="input-field"></div>`;
    h+=`<div class="input-group"><label>ტელეფონი</label><input type="text" id="f-phone" class="input-field"></div>`;
    openModal('დამატება', h, async () => {
        const n = document.getElementById('f-name').value;
        await fetch(`${API_URL}/api/${type}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:n, role:document.getElementById('f-role').value, phone:document.getElementById('f-phone').value})});
        await pushNotification(`დაემატა ${type==='teachers'?'მასწავლებელი':'მოსწავლე'}: ${n}`);
        renderMainContent();
    });
};
window.showAddNewsModal = () => {
    openModal('სიახლის დამატება', `<textarea id="n-txt" class="input-field"></textarea>`, async()=>{
        await fetch(`${API_URL}/api/news`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:document.getElementById('n-txt').value, date:new Date().toLocaleDateString()})});
        renderMainContent();
    });
};
window.showAddExamModal = () => {
    let h = `<div class="input-group"><label>მოსწავლე</label><input type="text" id="e-st" class="input-field"></div>
            <div class="input-group"><label>საგანი</label><select id="e-sb" class="input-field">${teacherRoles.slice(2).map(r=>`<option value="${r}">${r}</option>`).join('')}</select></div>
            <div style="margin-top:10px;"><label><input type="radio" name="e-ss" value="ჩააბარა" checked> ჩააბარა</label><label style="margin-left:20px;"><input type="radio" name="e-ss" value="ჩაიჭრა"> ჩაიჭრა</label></div>`;
    openModal('გამოცდის შედეგი', h, async()=>{
        const n = document.getElementById('e-st').value;
        const s = document.querySelector('input[name="e-ss"]:checked').value;
        await fetch(`${API_URL}/api/exams`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({studentName:n, subject:document.getElementById('e-sb').value, status:s})});
        if(s==='ჩააბარა') await pushNotification(`${n}-მა ჩააბარა გამოცდა!`);
        renderMainContent();
    });
};
window.showAddMaterialModal = () => {
    let h = `<div class="input-group"><label>სათაური</label><input type="text" id="m-tit" class="input-field"></div><div class="input-group"><label>ლინკი</label><input type="text" id="m-li" class="input-field"></div><div class="input-group"><label>მასწავლებელი</label><input type="text" id="m-te" class="input-field"></div>`;
    openModal('მასალის დამატება', h, async()=>{
        await fetch(`${API_URL}/api/materials`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:document.getElementById('m-tit').value, link:document.getElementById('m-li').value, teacher:document.getElementById('m-te').value})});
        renderMainContent();
    });
};
window.showAddEventModal = () => {
    let h = `<div class="input-group"><label>დასახელება</label><input type="text" id="v-ti" class="input-field"></div><div class="input-group"><label>თარიღი</label><input type="date" id="v-da" class="input-field"></div>`;
    openModal('კალენდარში დამატება', h, async()=>{
        await fetch(`${API_URL}/api/events`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:document.getElementById('v-ti').value, date:document.getElementById('v-da').value})});
        renderMainContent();
    });
};
window.showAddTimetableModal = async() => {
    const t = await fetch(`${API_URL}/api/teachers`).then(r=>r.json());
    const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი'];
    let h = `<div class="input-group"><label>მასწავლებელი</label><select id="tt-t" class="input-field">${t.map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</select></div><div class="input-group"><label>დღე</label><select id="tt-d" class="input-field">${days.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="input-group"><label>კლასი</label><input type="text" id="tt-c" class="input-field"></div>`;
    openModal('ცხრილი', h, async()=>{
        await fetch(`${API_URL}/api/timetable`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({teacherId:document.getElementById('tt-t').value, day:document.getElementById('tt-d').value, class:document.getElementById('tt-c').value})});
        renderMainContent();
    });
};
window.genCert = (n,s) => {
    openModal('სერთიფიკატი', `<div class="certificate-view"><h1>სერთიფიკატი</h1><p>გადაეცემა <b>${n}</b>-ს</p><p>საგანში: <b>${s}</b></p></div>`, ()=>window.print());
    modalSubmitBtn.textContent='დაბეჭდვა';
};
window.showAddHomeworkModal = async () => {
    const t = await fetch(`${API_URL}/api/teachers`).then(r=>r.json());
    const teacherProfile = t.find(tea => tea.email === state.currentUser.email);
    
    let h = `
        <div class="input-group"><label>დავალების სათაური</label><input type="text" id="h-tit" class="input-field" placeholder="მაგ: მათემატიკის სავარჯიშოები"></div>
        <div class="input-group"><label>კლასი</label><input type="text" id="h-cl" class="input-field" placeholder="მაგ: 12ა"></div>
        <div class="input-group"><label>საგანი</label><input type="text" id="h-sub" class="input-field" value="${teacherProfile ? teacherProfile.role : ''}"></div>
        <div class="input-group"><label>ბოლო ვადა</label><input type="date" id="h-dd" class="input-field"></div>
    `;
    
    openModal('დავალების დამატება', h, async () => {
        const title = document.getElementById('h-tit').value;
        const className = document.getElementById('h-cl').value;
        const subject = document.getElementById('h-sub').value;
        const deadline = document.getElementById('h-dd').value;
        
        await fetch(`${API_URL}/api/homework`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                class: className,
                subject,
                deadline,
                teacherId: teacherProfile ? teacherProfile.id : null,
                date: new Date().toLocaleDateString()
            })
        });
        await pushNotification(`ახალი დავალება კლასისთვის ${className}: ${title}`);
        renderMainContent();
    });
};
