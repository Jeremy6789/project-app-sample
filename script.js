const CONFIG = {
    dialogues: {
        D1: ["我準備好了！請給我明確的步驟，我想快點開始。", "主管，這是我第一次做行政，有範本可以參考嗎？"],
        D2: ["我以為很簡單，但現在完全卡住了...好挫折。", "進度完全沒動，我開始懷疑自己是不是選錯行了。"],
        D3: ["功能做好了，但你能幫我詳細檢查一次嗎？我怕出錯。", "我不確定這樣決策對不對，你要不要再看過？"],
        D4: ["風險已排除，進度如期。這件事交給我，放心。", "我已經準備好兩套方案，目前正執行中。"]
    },
    events: [
        "【資源補給】立刻獲得 2 枚 AP 幣。",
        "【跨部門合作】邀請對手，各付 2 AP，雙方員工皆進 3 步。",
        "【技術革命】全場 D3/D4 員工，立即退化至 D2！",
        "【組織重整】全體 D2+ 員工退 1 級，信任值 -1。",
        "【福利日】全員士氣提升！全場員工信任值 +1。",
        "【獵頭情報】獲得一次無消耗且無條件成功的獵頭機會。"
    ]
};

let state = {
    players: [],
    currentP: 0,
    globalRegression: false
};

// --- 初始化 ---
function startGame(num) {
    state.players = [];
    for(let i=1; i<=num; i++) {
        state.players.push({
            name: `經理人 ${i}`,
            employees: [
                { id:1, name: "員工一號", bus: {d:1, xp:0}, adm: {d:1, xp:0}, trust: 0, active: true },
                { id:2, name: "員工二號", bus: {d:1, xp:0}, adm: {d:1, xp:0}, trust: 0, active: false }
            ]
        });
    }
    document.getElementById('setupScreen').style.display = 'none';
    renderTabs();
    renderContent();
}

function renderTabs() {
    const nav = document.getElementById('playerTabs');
    nav.innerHTML = state.players.map((p, i) => `
        <div class="tab ${i === state.currentP ? 'active' : ''}" onclick="switchP(${i})">${p.name}</div>
    `).join('');
}

function switchP(i) {
    state.currentP = i;
    renderTabs();
    renderContent();
}

function renderContent() {
    const main = document.getElementById('appBody');
    const p = state.players[state.currentP];
    
    main.innerHTML = p.employees.map((emp, idx) => {
        if (!emp.active) {
            return `<div class="emp-card" style="opacity:0.5; text-align:center;">
                        <p>員工二號（尚未解鎖）</p>
                        <button class="secondary-btn" onclick="unlockEmp(${idx})">跑完第一圈：解鎖部屬</button>
                    </div>`;
        }
        return `
            <div class="emp-card">
                <div class="emp-header">
                    <span style="font-weight:bold;">📂 ${emp.name}</span>
                    <span class="trust-ui">信任值: ${emp.trust}</span>
                </div>
                
                <div class="skill-box">
                    <label>診斷技能項目</label>
                    <select id="skill_${idx}" class="secondary-btn" style="background:#0d1117; text-align:left;">
                        <option value="bus">業務執行 (Business)</option>
                        <option value="adm">行政管理 (Admin)</option>
                    </select>
                    <button class="secondary-btn" onclick="showHeart(${idx})">🎧 聆聽心聲</button>
                    <div id="voice_${idx}" class="heart-voice"></div>
                </div>

                <div class="input-row">
                    <div><label>指令代碼</label><input id="i_${idx}" placeholder="I-01"></div>
                    <div><label>支持代碼</label><input id="s_${idx}" placeholder="S-01"></div>
                </div>
                <button class="primary-btn" onclick="execute(${idx})">發動領導行動</button>
            </div>
        `;
    }).join('');
}

// --- 核心逻辑 ---

function showHeart(idx) {
    const emp = state.players[state.currentP].employees[idx];
    const skillKey = document.getElementById(`skill_${idx}`).value;
    const dLevel = emp[skillKey].d;
    const pool = CONFIG.dialogues[`D${dLevel}`];
    const text = pool[Math.floor(Math.random() * pool.length)];
    
    const box = document.getElementById(`voice_${idx}`);
    box.innerText = `「${text}」`;
    box.style.display = 'block';
}

function execute(idx) {
    const iVal = document.getElementById(`i_${idx}`).value.trim().toUpperCase();
    const sVal = document.getElementById(`s_${idx}`).value.trim().toUpperCase();
    
    if(!iVal || !sVal) return alert("請輸入代碼");

    // 代碼轉譯 (01-10 High, 其餘 Low)
    const getLvl = (str) => parseInt(str.replace(/\D/g,'')) <= 10 ? 'H' : 'L';
    const directive = getLvl(iVal);
    const supportive = getLvl(sVal);

    let sStyle = 0, styleName = "", ap = 0;
    if(directive === 'H' && supportive === 'L') { sStyle = 1; styleName = "S1 指導"; ap = 2; }
    else if(directive === 'H' && supportive === 'H') { sStyle = 2; styleName = "S2 教練"; ap = 2; }
    else if(directive === 'L' && supportive === 'H') { sStyle = 3; styleName = "S3 支持"; ap = 1; }
    else { sStyle = 4; styleName = "S4 授權"; ap = 0; }

    const emp = state.players[state.currentP].employees[idx];
    const skillKey = document.getElementById(`skill_${idx}`).value;
    const realD = emp[skillKey].d;

    let title, content;
    const dice = realD <= 2 ? "d6" : (realD === 3 ? "d8" : "d12");

    if(sStyle === realD) {
        title = "🎉 完美匹配！";
        content = `風格：${styleName}<br><b>效果：</b>信任 +1，消耗 ${ap} AP。<br><b>地圖動作：</b>請擲 1 次 <b>${dice}</b>。`;
        emp.trust = Math.min(3, emp.trust + 1);
        emp[skillKey].xp += 2; // 增加隱藏XP
    } else if(Math.abs(sStyle - realD) === 1) {
        title = "⚠️ 輕微偏離";
        content = `風格：${styleName}<br><b>效果：</b>消耗 ${ap} AP。<br><b>地圖動作：</b>請擲 1 次 <b>${dice}</b> 但<b>步數減半</b>。`;
        emp[skillKey].xp += 1;
    } else {
        title = "❌ 嚴重錯位";
        content = `風格：${styleName}<br><b>效果：</b>信任 -1，消耗 ${ap} AP。<br><b>地圖動作：原地停留</b>。`;
        emp.trust = Math.max(-3, emp.trust - 1);
    }

    openModal(title, content);
    renderContent();
}

// --- 地圖工具 ---

function triggerEvent() {
    const ev = CONFIG.events[Math.floor(Math.random() * CONFIG.events.length)];
    openModal("🎲 隨機事件抽取", ev);
}

function triggerD2Checkpoint() {
    openModal("🚩 D2 幻滅檢查點", "請確認是否已跨越第 6 格？<br><br><button class='primary-btn' onclick='applyD2()'>確認：轉為 D2 階段</button>");
}

function applyD2() {
    const p = state.players[state.currentP];
    p.employees.forEach(e => {
        if(e.active) {
            if(e.bus.d === 1) e.bus.d = 2;
            if(e.adm.d === 1) e.adm.d = 2;
        }
    });
    closeModal();
    renderContent();
    alert("目前玩家所有 D1 技能已轉為 D2 幻滅期");
}

function triggerPromotion() {
    const p = state.players[state.currentP];
    let html = "選擇要晉升的員工與技能：<br><br>";
    p.employees.forEach((e, i) => {
        if(e.active) {
            html += `<button class='secondary-btn' onclick='doPromo(${i},"bus")'>${e.name}-業務 (目前D${e.bus.d})</button>`;
            html += `<button class='secondary-btn' onclick='doPromo(${i},"adm")'>${e.name}-行政 (目前D${e.adm.d})</button>`;
        }
    });
    openModal("🆙 晉升檢查", html);
}

function doPromo(empIdx, skill) {
    const emp = state.players[state.currentP].employees[empIdx];
    if(emp[skill].d >= 4) return alert("已達最高等級");
    
    // 檢查隱藏 XP
    if(emp[skill].xp >= 5) {
        emp[skill].d += 1;
        emp[skill].xp = 0;
        alert("升級成功！請更換棋子底環並領取新骰子。");
    } else {
        alert("XP 不足！(提示：完美匹配可獲得更多 XP)");
    }
    closeModal();
    renderContent();
}

function triggerHeadhunt() {
    openModal("🧲 發起獵人頭", "請在桌面上決定目標：<br>1. 支付 2 AP<br>2. 比拼骰子 (發起者 d6 vs 被獵者 d8)<br><br>成功後請至 App 切換員工歸屬。");
}

function unlockEmp(idx) {
    state.players[state.currentP].employees[idx].active = true;
    renderContent();
    alert("新員工已入職！");
}

// --- 通用 UI ---

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function openModal(t, c) {
    document.getElementById('modalTitle').innerHTML = t;
    document.getElementById('modalContent').innerHTML = c;
    document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }