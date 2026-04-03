const CONFIG = {
    dialogues: {
        D1: ["我準備好了！請給我明確的步驟，我想快點開始。", "主管，這是我第一次做行政，有範本可以參考嗎？"],
        D2: ["我以為很簡單，但現在完全卡住了...好挫折。", "進度完全沒動，我開始懷疑自己是不是選錯行了。"],
        D3: ["功能做好了，但你能幫我詳細檢查一次嗎？我怕出錯。", "我不確定這樣決策對不對，你要不要再看過？"],
        D4: ["風險已排除，進度如期。這件事交給我，放心。", "我已經準備好兩套方案，目前正執行中。"]
    },
    events: ["【資源補給】獲得 2 AP", "【技術革命】D3/D4 退化至 D2", "【福利日】全員信任 +1", "【獵頭情報】獲得免試獵頭機會"]
};

let managerData = {
    name: "",
    employees: [],
    activeEmpIdx: null // 目前正在掃描哪位員工
};

// --- 初始化經理人 ---
function initManager() {
    const name = document.getElementById('playerName').value;
    if(!name) return alert("請輸入姓名");
    managerData.name = name;
    document.getElementById('managerTitle').innerText = `經理人：${name}`;
    
    // 預設給予一位員工
    managerData.employees.push({
        name: "工程師 阿強", bus: {d:1, xp:0}, adm: {d:1, xp:0}, trust: 0
    });
    
    document.getElementById('setupScreen').style.display = 'none';
    renderEmployees();
}

function renderEmployees() {
    const list = document.getElementById('employeeList');
    list.innerHTML = managerData.employees.map((emp, idx) => `
        <div class="emp-card">
            <div style="display:flex; justify-content:space-between;">
                <b>📂 ${emp.name}</b>
                <span style="color:#d29922;">信任: ${emp.trust}</span>
            </div>
            <div class="heart-voice" id="voice_${idx}">點擊診斷聽取員工心聲...</div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="diagnose(${idx}, 'bus')" class="secondary-btn">診斷：業務</button>
                <button onclick="diagnose(${idx}, 'adm')" class="secondary-btn">診斷：行政</button>
            </div>
            <button onclick="openScanner(${idx})" class="primary-btn" style="margin-top:15px;">🔍 啟動領導行動掃描</button>
        </div>
    `).join('');
}

// --- 診斷邏輯 ---
let currentSkill = 'bus'; // 紀錄目前診斷哪項技能
function diagnose(idx, skill) {
    currentSkill = skill;
    const emp = managerData.employees[idx];
    const dLevel = emp[skill].d;
    const pool = CONFIG.dialogues[`D${dLevel}`];
    const text = pool[Math.floor(Math.random() * pool.length)];
    
    document.getElementById(`voice_${idx}`).innerText = `「${text}」 (針對${skill === 'bus' ? '業務' : '行政'})`;
    document.getElementById(`voice_${idx}`).style.color = "#c9d1d9";
}

// --- 掃描器邏輯 ---
function openScanner(idx) {
    managerData.activeEmpIdx = idx;
    document.getElementById('scannerOverlay').style.display = 'flex';
}

function closeScanner() {
    document.getElementById('scannerOverlay').style.display = 'none';
}

function processScan() {
    const idx = managerData.activeEmpIdx;
    const iVal = document.getElementById('manual-I').value.trim().toUpperCase();
    const sVal = document.getElementById('manual-S').value.trim().toUpperCase();

    if(!iVal || !sVal) return alert("請輸入卡片代碼 (模擬掃描)");

    // 轉譯邏輯 (01-10 High, 其餘 Low)
    const getLvl = (str) => parseInt(str.replace(/\D/g,'')) <= 10 ? 'H' : 'L';
    const directive = getLvl(iVal);
    const supportive = getLvl(sVal);

    let sStyle = 0, styleName = "";
    if(directive === 'H' && supportive === 'L') { sStyle = 1; styleName = "S1 指導"; }
    else if(directive === 'H' && supportive === 'H') { sStyle = 2; styleName = "S2 教練"; }
    else if(directive === 'L' && supportive === 'H') { sStyle = 3; styleName = "S3 支持"; }
    else { sStyle = 4; styleName = "S4 授權"; }

    const emp = managerData.employees[idx];
    const realD = emp[currentSkill].d;

    let title, content;
    const dice = realD <= 2 ? "d6" : (realD === 3 ? "d8" : "d12");

    if(sStyle === realD) {
        title = "🎉 完美匹配！";
        content = `你使用了 <b>${styleName}</b>。<br>信任 +1。請擲 <b>${dice}</b> 移動棋子。`;
        emp.trust = Math.min(3, emp.trust + 1);
        emp[currentSkill].xp += 2;
    } else if(Math.abs(sStyle - realD) === 1) {
        title = "⚠️ 輕微偏離";
        content = `使用了 ${styleName}。<br>請擲 <b>${dice}</b> 但<b>步數減半</b>。`;
        emp[currentSkill].xp += 1;
    } else {
        title = "❌ 嚴重錯位";
        content = `風格錯誤！<br>信任 -1，<b>原地停留</b>。`;
        emp.trust = Math.max(-3, emp.trust - 1);
    }

    closeScanner();
    openModal(title, content);
    renderEmployees();
}

// --- 地圖工具 ---
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function addEmployee() {
    managerData.employees.push({ name: "新進員工", bus: {d:1, xp:0}, adm: {d:1, xp:0}, trust: 0 });
    renderEmployees();
    toggleSidebar();
    alert("新員工已加入您的團隊！");
}

function triggerEvent() {
    const ev = CONFIG.events[Math.floor(Math.random() * CONFIG.events.length)];
    openModal("🎲 事件抽取", ev);
}

function triggerD2() {
    managerData.employees.forEach(e => {
        if(e.bus.d === 1) e.bus.d = 2;
        if(e.adm.d === 1) e.adm.d = 2;
    });
    openModal("🚩 階段轉變", "所有 D1 員工已進入 D2 幻滅期");
    renderEmployees();
}

function triggerPromotion() {
    let msg = "選擇一位 XP 足夠的員工進行晉升。";
    openModal("🆙 晉升檢查", msg);
}

// --- Modal ---
function openModal(t, c) {
    document.getElementById('modalTitle').innerHTML = t;
    document.getElementById('modalContent').innerHTML = c;
    document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }