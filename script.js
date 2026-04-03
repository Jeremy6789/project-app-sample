// ==========================================
// 1. 資料庫與全域設定
// ==========================================
const FOLLOWER_DB = {
    "F01": { name: "阿強 (後端工程師)", bus: 1, adm: 1 },
    "F02": { name: "小玲 (前端設計師)", bus: 1, adm: 1 },
    "F03": { name: "老陳 (系統架構師)", bus: 1, adm: 1 },
    "F04": { name: "美美 (產品經理)", bus: 1, adm: 1 }
};

const CONFIG = {
    dialogues: {
        D1: ["我準備好了！請給我明確的步驟，我想快點開始。", "主管，這是我第一次做，有參考文件嗎？"],
        D2: ["這比我想像中難...我努力過了但沒進度，我好挫折。", "進度完全沒動，我開始懷疑自己了。"],
        D3: ["功能做好了，但你能幫我詳細檢查一次嗎？我怕出錯。", "我不確定這樣做對不對，你要不要再看過？"],
        D4: ["風險已排除，進度如期。這件事交給我，放心。", "我已經準備好兩套方案，目前正執行中。"]
    },
    events: ["【資源補給】獲得 2 AP", "【技術革命】D3/D4 退化至 D2", "【福利日】全員信任 +1", "【跨部門合作】結盟前進 3 步"]
};

let managerData = {
    name: "",
    employees: [],
    activeEmpIdx: 0,
    currentSkill: 'bus' 
};

function sanitizeCode(code) {
    return code.replace(/[\s-]/g, '').toUpperCase();
}

// ==========================================
// 2. 初始入職流程
// ==========================================

function showFirstFollowerScan() {
    const name = document.getElementById('playerName').value;
    if(!name) return alert("請輸入暱稱");
    managerData.name = name;
    document.getElementById('setupScreen').style.display = 'none';
    openGenericScanner("首位部屬入職", "請掃描部屬卡 (F)", "FOLLOWER (F)", initFirstFollower, null, false);
}

function initFirstFollower() {
    const code = sanitizeCode(document.getElementById('generic-code').value);
    if(!FOLLOWER_DB[code]) return alert("無效代碼！請掃 F01-F04");
    managerData.employees.push({ name: FOLLOWER_DB[code].name, bus: { d: 1, xp: 0 }, adm: { d: 1, xp: 0 }, trust: 0 });
    closeGenericScanner();
    document.getElementById('appHeader').style.display = 'block';
    document.getElementById('fabBtn').style.display = 'block';
    document.getElementById('managerTitle').innerText = `經理人：${managerData.name}`;
    renderEmployees();
}

// ==========================================
// 3. 領導診斷與行動
// ==========================================

function renderEmployees() {
    const list = document.getElementById('employeeList');
    list.innerHTML = managerData.employees.map((emp, idx) => `
        <div class="emp-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="font-size:1.1rem; color:var(--primary);">📂 ${emp.name}</b>
                <span style="color:var(--warning); font-weight:bold;">信任: ${emp.trust}</span>
            </div>
            <div class="heart-voice" id="voice_${idx}">點擊診斷按鈕聽取心聲...</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="diagnose(${idx}, 'bus')" class="secondary-btn">診斷：業務</button>
                <button onclick="diagnose(${idx}, 'adm')" class="secondary-btn">診斷：行政</button>
            </div>
            <button onclick="openActionScanner(${idx})" class="primary-btn" style="margin-top:15px; height:50px;">🔍 啟動領導行動掃描</button>
        </div>
    `).join('');
}

function diagnose(idx, skill) {
    managerData.currentSkill = skill;
    const emp = managerData.employees[idx];
    const dLevel = emp[skill].d;
    const pool = CONFIG.dialogues[`D${dLevel}`];
    const text = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById(`voice_${idx}`).innerText = `「${text}」\n(針對${skill === 'bus' ? '業務執行' : '行政管理'})`;
}

function openActionScanner(idx) {
    managerData.activeEmpIdx = idx;
    document.getElementById('actionScanner').style.display = 'flex';
}

function closeActionScanner() {
    document.getElementById('actionScanner').style.display = 'none';
}

function processActionScan() {
    const iCode = sanitizeCode(document.getElementById('manual-I').value);
    const sCode = sanitizeCode(document.getElementById('manual-S').value);
    if(!iCode || !sCode) return alert("請輸入完整代碼");
    const getLvl = (str) => parseInt(str.replace(/\D/g,'')) <= 10 ? 'H' : 'L';
    const dL = getLvl(iCode), sL = getLvl(sCode);
    let sStyle = 0, styleName = "";
    if(dL === 'H' && sL === 'L') { sStyle = 1; styleName = "S1 指導"; }
    else if(dL === 'H' && sL === 'H') { sStyle = 2; styleName = "S2 教練"; }
    else if(dL === 'L' && sL === 'H') { sStyle = 3; styleName = "S3 支持"; }
    else { sStyle = 4; styleName = "S4 授權"; }
    const emp = managerData.employees[managerData.activeEmpIdx];
    const realD = emp[managerData.currentSkill].d;
    let title, content;
    const dice = realD <= 2 ? "d6" : (realD === 3 ? "d8" : "d12");
    if(sStyle === realD) {
        title = "🎉 完美匹配！"; content = `用了 <b>${styleName}</b>。<br>信任 +1。請擲 <b>${dice}</b>。`;
        emp.trust = Math.min(3, emp.trust + 1);
    } else if(Math.abs(sStyle - realD) === 1) {
        title = "⚠️ 輕微偏離"; content = `用了 ${styleName}。<br>請擲 <b>${dice}</b> 但步數減半。`;
    } else {
        title = "❌ 嚴重錯位"; content = `診斷錯誤！使用了 ${styleName}。<br>信任 -1，原地停留。`;
        emp.trust = Math.max(-3, emp.trust - 1);
    }
    closeActionScanner();
    openModal(title, content);
    renderEmployees();
}

// ==========================================
// 4. 地圖工具箱與獵人頭
// ==========================================

function triggerHeadhunt() {
    toggleSidebar();
    const hunterButtons = `
        <button class="primary-btn" onclick="startHunterFlow()">我是【獵頭成功者】</button>
        <button class="danger-btn" onclick="startHuntedFlow()">【我的員工】被獵走了</button>
        <button class="secondary-btn" onclick="closeModal()">取消</button>
    `;
    openModal("🎯 獵人頭處理", "請選擇您在此次行動中的角色：", hunterButtons);
}

function startHuntedFlow() {
    let html = "請選擇哪位員工已被獵走：<br><br>";
    managerData.employees.forEach((e, i) => {
        html += `<button class="tool-btn" onclick="confirmHunted('${i}')">${e.name}</button>`;
    });
    openModal("選擇被獵員工", html);
}

function confirmHunted(idx) {
    const emp = managerData.employees[idx];
    const buttons = `
        <button class="danger-btn" onclick="executeDeparture(${idx})">確認交接並移除</button>
        <button class="secondary-btn" onclick="closeModal()">返回</button>
    `;
    openModal("📋 交接面板", `請獵頭者輸入數據：<br><br><b>${emp.name}</b><br>業務: D${emp.bus.d} | 行政: D${emp.adm.d}`, buttons);
}

function executeDeparture(idx) {
    managerData.employees.splice(idx, 1);
    renderEmployees();
    closeModal();
}

function startHunterFlow() {
    closeModal();
    openGenericScanner("獵頭人才接收", "請掃描新部屬卡 (F)", "NEW FOLLOWER", processHunterScan, null, true);
}

function processHunterScan() {
    const code = sanitizeCode(document.getElementById('generic-code').value);
    if(!FOLLOWER_DB[code]) return alert("代碼錯誤");
    closeGenericScanner();
    const buttons = `<button class="primary-btn" onclick="saveHunter('${code}')">完成入職</button>`;
    openModal("📝 輸入繼承等級", `業務等級 (1-4): <input type="number" id="h-bus" value="1" class="input-field"><br>行政等級 (1-4): <input type="number" id="h-adm" value="1" class="input-field">`, buttons);
}

function saveHunter(code) {
    const b = parseInt(document.getElementById('h-bus').value);
    const a = parseInt(document.getElementById('h-adm').value);
    managerData.employees.push({ name: FOLLOWER_DB[code].name + " (獵頭)", bus: { d: b, xp: 0 }, adm: { d: a, xp: 0 }, trust: 1 });
    renderEmployees();
    closeModal();
}

// --- 職場危機修正版 ---

function triggerCrisis() {
    toggleSidebar();
    const crisisButtons = `
        <button class="primary-btn" onclick="goToCrisisScanner()">我有責備卡 (R)</button>
        <button class="danger-btn" onclick="resolveCrisisFailure()">我沒有責備卡</button>
    `;
    openModal("🌋 職場危機", "部屬遭遇挫折！請掃描「責備卡 (R)」或點擊「沒有」接受處分。", crisisButtons);
}

// 修正：增加中轉函式確保掃描器開啟
function goToCrisisScanner() {
    closeModal();
    openGenericScanner("危機化解", "請驗證責備卡(R)", "REPRIMAND", resolveCrisisSuccess, resolveCrisisFailure, true);
}

function resolveCrisisSuccess() {
    const c = sanitizeCode(document.getElementById('generic-code').value);
    if(!c.startsWith('R')) return alert("無效 R 卡代碼！");
    closeGenericScanner();
    openModal("✅ 成功化解", "你正確運用了責備技巧，員工狀態已恢復。");
}

function resolveCrisisFailure() {
    managerData.employees.forEach(e => e.trust = Math.max(-3, e.trust - 1));
    renderEmployees();
    closeGenericScanner();
    closeModal();
    openModal("❌ 危機爆發", "缺乏領導介入！<br><b>後果：</b>全員信任值 -1，地圖退 2 步。");
}

// ==========================================
// 5. 其他工具與 UI
// ==========================================

function triggerPromotion() {
    toggleSidebar();
    let html = "選擇晉升對象：<br><br>";
    managerData.employees.forEach((e, i) => {
        html += `<button class="tool-btn" onclick="startPromo('${i}')">${e.name}</button>`;
    });
    openModal("🆙 晉升格", html);
}

function startPromo(idx) {
    managerData.activeEmpIdx = idx; closeModal();
    openGenericScanner("晉升驗證", "掃描「稱讚卡 (P)」", "PRAISING (P)", () => {
        const c = sanitizeCode(document.getElementById('generic-code').value);
        if(!c.startsWith('P')) return alert("無效 P 卡");
        const emp = managerData.employees[managerData.activeEmpIdx];
        if(emp.bus.d < 4) emp.bus.d++; if(emp.adm.d < 4) emp.adm.d++;
        closeGenericScanner(); renderEmployees(); openModal("✨ 成功", "已晉升！請更換骰子與底環。");
    }, null, true);
}

function openModal(t, c, customHtml = null) {
    document.getElementById('modalTitle').innerHTML = t;
    document.getElementById('modalContent').innerHTML = c;
    const actionsEl = document.getElementById('modalActions');
    if (customHtml) {
        actionsEl.innerHTML = customHtml;
    } else {
        actionsEl.innerHTML = `<button class="primary-btn" onclick="closeModal()">確認並繼續</button>`;
    }
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

function openGenericScanner(title, desc, label, sCb, fCb, showC) {
    document.getElementById('scanTitle').innerText = title;
    document.getElementById('scanDesc').innerText = desc;
    document.getElementById('scanLabel').innerText = label;
    document.getElementById('generic-code').value = "";
    document.getElementById('genericScanner').style.display = 'flex';
    document.getElementById('scanConfirmBtn').onclick = sCb;
    const cancelBtn = document.getElementById('scanCancelBtn');
    cancelBtn.style.display = showC ? "block" : "none";
    cancelBtn.onclick = fCb || closeGenericScanner;
}

function closeGenericScanner() {
    document.getElementById('genericScanner').style.display = 'none';
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function openNewFollowerScan() {
    toggleSidebar();
    openGenericScanner("新部屬入職", "掃描部屬卡 (F)", "FOLLOWER", () => {
        const c = sanitizeCode(document.getElementById('generic-code').value);
        if(!FOLLOWER_DB[c]) return alert("代碼錯誤");
        managerData.employees.push({ name: FOLLOWER_DB[c].name, bus: { d: 1, xp: 0 }, adm: { d: 1, xp: 0 }, trust: 0 });
        closeGenericScanner(); renderEmployees();
    }, null, true);
}

function triggerEvent() {
    toggleSidebar();
    const ev = CONFIG.events[Math.floor(Math.random() * CONFIG.events.length)];
    openModal("🎲 隨機事件", ev);
}

function triggerTraining() {
    toggleSidebar();
    openModal("🏫 總部進修", "停留此格 2 回合，期滿可獲雙能力免費升級一次。");
}

function triggerD2() {
    toggleSidebar();
    managerData.employees.forEach(e => {
        if(e.bus.d === 1) e.bus.d = 2;
        if(e.adm.d === 1) e.adm.d = 2;
    });
    renderEmployees();
    openModal("🚩 階段強制轉變", "員工技能已轉為 D2 幻滅期。");
}

window.onload = () => console.log("System Ready");