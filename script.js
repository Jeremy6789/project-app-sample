// ==========================================
// 1. 資料庫同步 (員工、心聲、全局事件)
// ==========================================

const FOLLOWER_DB = {
    "F01": { name: "Alex (前端開發)", bus: 1, adm: 1 },
    "F02": { name: "Chloe (前端開發)", bus: 1, adm: 1 },
    "F03": { name: "Ian (前端開發)", bus: 1, adm: 1 },
    "F04": { name: "Zoe (前端開發)", bus: 1, adm: 1 },
    "F05": { name: "Bob (後端架構)", bus: 1, adm: 1 },
    "F06": { name: "Fiona (後端架構)", bus: 1, adm: 1 },
    "F07": { name: "Kevin (後端架構)", bus: 1, adm: 1 },
    "F08": { name: "Rachel (後端架構)", bus: 1, adm: 1 },
    "F09": { name: "David (雲端維運)", bus: 1, adm: 1 },
    "F10": { name: "Emily (雲端維運)", bus: 1, adm: 1 },
    "F11": { name: "George (雲端維運)", bus: 1, adm: 1 },
    "F12": { name: "Luna (雲端維運)", bus: 1, adm: 1 }
};

const DIALOGUE_POOL = {
    bus: {
        D1: ["這架構超酷！我沒用過但很有興趣。經理，請給我SOP，我想今天就開工！", "這個新開發案聽起來太棒了！給我明確的步驟就行！", "我還沒有串接過這支API，但我相信我一個下午就能搞懂！"],
        D2: ["串接系統比想像中亂，我寫越多越覺得自己不懂。加班解Bug讓我覺得不適合這裡。", "我以為這很簡單，但現在卡了兩天...好挫折。", "這個模組的底層邏輯跟我想的完全不一樣，我越寫越懷疑自己能力。"],
        D3: ["這是我想出的重構方案，測試跑過了，但我還是想先跟您確認路徑是否正確。", "程式碼我寫好了，但你能幫我詳細檢查一次嗎？這畢竟是核心功能，我怕出錯。", "其實我知道這個Bug怎麼解，但這牽涉到其他部門，我有點猶豫。"],
        D4: ["Bug已修復且效率提升30%。我已想好下一步自動化策略。", "風險已排除，進度如期。這週的模組會準時上線，請放心。", "這次的API串接我提前兩天完成了。剩下的時間我打算用來寫技術文件。"]
    },
    adm: {
        D1: ["我很樂意同步進度。請告訴我習慣的彙報格式，我一定準時完成。", "經理，請給我報帳流程的SOP，我下班前就能處理好！", "整理團隊的休假與排班表交給我吧！只要給我系統權限就行。"],
        D2: ["每天寫工時報表真的有意義嗎？我光寫Code就沒時間了。", "請購系統操作比我想的複雜，一直被退件，我真的覺得很浪費時間。", "寫技術文件比寫Code還難，我完全抓不到重點，只能發呆。"],
        D3: ["下季進度表我寫好了，但我怕時間估得太緊。您可以幫我檢查風險嗎？", "這份結案報告整理完了，但在寄給客戶前，想先跟您確認措辭。", "預算我算好了，可是我不確定這樣分配對不對，想和你討論一下。"],
        D4: ["結案報告已完成，我順便優化了模板，以後大家填寫會更輕鬆。", "KPI考核我都已經跟團隊成員一對一面談並填寫完畢，設定得超級棒！", "所有的行政庶務我都已經系統化了，現在團隊可以百分之百專注在開發上。"]
    }
};

const GLOBAL_EVENTS = {
    "E01": { 
        name: "技術革命", 
        effect: "所有 D3/D4 員工退化至 D2", 
        showBanner: true, 
        desc: "行業導入了全新的 AI 運算架構，現有的專業知識體系面臨挑戰。所有處於高階階段（D3/D4）的部屬因技術斷層感到焦慮，能力強制退回 D2 幻滅期。",
        action: () => { managerData.employees.forEach(e => { if(e.bus.d > 2) e.bus.d = 2; if(e.adm.d > 2) e.adm.d = 2; }); return "技術斷層發生。"; } 
    },
    "E02": { 
        name: "組織重整", 
        effect: "全員等級退 1 級, 信任 -1", 
        showBanner: true, 
        desc: "公司宣布進行部門併購與裁員。整體環境動盪不堪，員工不僅對未來感到不確定（信任值-1），原有的工作節奏也被打亂（能力等級下降一級）。",
        action: () => { managerData.employees.forEach(e => { if(e.bus.d > 1) e.bus.d--; if(e.adm.d > 1) e.adm.d--; e.trust = Math.max(-3, e.trust - 1); }); return "信心崩跌。"; } 
    },
    "E03": { 
        name: "福利日", 
        effect: "全員信任值 +1", 
        showBanner: true, 
        desc: "公司發放了績效獎金並舉辦團隊建設活動。經理人與員工的夥伴關係得到修復，全體員工的信任感得到顯著提升。",
        action: () => { managerData.employees.forEach(e => e.trust = Math.min(3, e.trust + 1)); return "士氣回升。"; } 
    }
};

let managerData = { name: "", employees: [], activeEmpIdx: 0, currentSkill: 'bus' };

function sanitizeCode(code) { return code.replace(/[\s-]/g, '').toUpperCase(); }

function getAttr(code) {
    const type = code.charAt(0);
    const num = parseInt(code.slice(1));
    if (type === 'I') return num <= 15 ? 'H' : 'L';
    if (type === 'S') return num <= 15 ? 'H' : 'L';
    return null;
}

// 產生隨機心聲索引並存入員工資料
function refreshDialogue(emp) {
    emp.bus.diagIdx = Math.floor(Math.random() * DIALOGUE_POOL.bus.D1.length);
    emp.adm.diagIdx = Math.floor(Math.random() * DIALOGUE_POOL.adm.D1.length);
}

// ==========================================
// 2. 初始流程
// ==========================================

function showFirstFollowerScan() {
    const name = document.getElementById('playerName').value;
    if(!name) return alert("請輸入暱稱");
    managerData.name = name;
    document.getElementById('setupScreen').style.display = 'none';
    openGenericScanner("首位部屬入職", "掃描部屬卡", "FOLLOWER", "F01", initFirstFollower, null, false);
}

function initFirstFollower() {
    const code = sanitizeCode(document.getElementById('generic-code').value);
    if(!FOLLOWER_DB[code]) return alert("錯誤代碼");
    let newEmp = { name: FOLLOWER_DB[code].name, bus: { d: 1 }, adm: { d: 1 }, trust: 3 };
    refreshDialogue(newEmp);
    managerData.employees.push(newEmp);
    closeGenericScanner();
    document.getElementById('appHeader').style.display = 'block';
    document.getElementById('fabBtn').style.display = 'block';
    document.getElementById('managerTitle').innerText = `經理人：${managerData.name}`;
    renderEmployees();
}

// ==========================================
// 3. 核心邏輯：診斷與行動
// ==========================================

function renderEmployees() {
    const list = document.getElementById('employeeList');
    list.innerHTML = managerData.employees.map((emp, idx) => `
        <div class="emp-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="font-size:1.1rem; color:var(--primary);">📂 ${emp.name}</b>
                <div>
                    ${(emp.bus.d === 1 || emp.adm.d === 1) ? `<button class="upgrade-btn" onclick="forceD2(${idx})">🚩 升至 D2</button>` : ''}
                    <span style="color:var(--warning); font-weight:bold; margin-left:10px;">信任: ${emp.trust}</span>
                </div>
            </div>
            <div class="heart-voice" id="voice_${idx}">點擊診斷按鈕聽取心聲...</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="diagnose(${idx}, 'bus')" class="secondary-btn">診斷：業務</button>
                <button onclick="diagnose(${idx}, 'adm')" class="secondary-btn">診斷：行政</button>
            </div>
            <button onclick="openActionScanner(${idx})" class="primary-btn" style="margin-top:15px; height:50px;">🔍 啟動領導行動掃描</button>
        </div>
    `).join('');
    checkHeadhuntStatus();
}

function diagnose(idx, skill) {
    managerData.currentSkill = skill;
    const emp = managerData.employees[idx];
    const dLevel = emp[skill].d;
    const pool = DIALOGUE_POOL[skill][`D${dLevel}`];
    // 使用預存的索引，確保在執行領導前內容固定
    const diagText = pool[emp[skill].diagIdx % pool.length];
    document.getElementById(`voice_${idx}`).innerText = `「${diagText}」\n(針對${skill === 'bus' ? '業務' : '行政'} D${dLevel})`;
}

function processActionScan() {
    const iCode = sanitizeCode(document.getElementById('manual-I').value);
    const sCode = sanitizeCode(document.getElementById('manual-S').value);
    if(!iCode || !sCode) return alert("輸入代碼");

    const iAttr = getAttr(iCode), sAttr = getAttr(sCode);
    let s=0, ap=0;
    if(iAttr==='H'&&sAttr==='L'){ s=1; ap=2; }
    else if(iAttr==='H'&&sAttr==='H'){ s=2; ap=2; }
    else if(iAttr==='L'&&sAttr==='H'){ s=3; ap=1; }
    else { s=4; ap=0; }

    const emp = managerData.employees[managerData.activeEmpIdx];
    const realD = emp[managerData.currentSkill].d;
    const dice = realD <= 2 ? "d6" : (realD === 3 ? "d8" : "d12");

    let t, c;
    if(s === realD) {
        t="🎉 完美匹配！"; 
        c=`領導風格：<b>S${s}</b><br><b style='color:var(--primary); font-size:1.2rem;'>消耗：${ap} AP</b><br>信任 +1。請擲 <b>${dice}</b>。`;
        emp.trust = Math.min(3, emp.trust + 1);
    } else if(Math.abs(s - realD) === 1) {
        t="⚠️ 輕微偏離";
        c=`領導風格：<b>S${s}</b><br><b style='color:var(--primary); font-size:1.2rem;'>消耗：${ap} AP</b><br>請擲 <b>${dice}</b> 但步數減半。`;
    } else {
        t="❌ 嚴重錯位";
        c=`領導風格：<b>S${s}</b><br><b style='color:var(--primary); font-size:1.2rem;'>消耗：${ap} AP</b><br>信任 -1。原地停留。`;
        emp.trust = Math.max(-3, emp.trust - 1);
    }

    // 關鍵：執行完畢後隨機更換下一回合的心聲
    refreshDialogue(emp);
    closeActionScanner(); renderEmployees(); openModal(t, c);
}

// ==========================================
// 4. 獵人頭預警與全局事件
// ==========================================

function checkHeadhuntStatus() {
    const banner = document.getElementById('globalStatusBanner');
    const bannerText = document.getElementById('globalStatusText');
    
    // 優先檢查是否有員工開放獵人頭
    const leavers = managerData.employees.filter(e => e.trust <= -1);
    if(leavers.length > 0) {
        const names = leavers.map(e => e.name).join(', ');
        banner.style.display = "flex";
        banner.style.background = "#fee2e2"; // 淡紅色
        banner.style.color = "#991b1b";
        bannerText.innerHTML = `⚠️ 警告：${names} 已開放獵人頭！`;
    } else {
        // 如果沒有獵人頭，則顯示一般的全局事件(如果有)
        // 此處邏輯由 applyGlobalEvent 處理顯示，這裡主要負責關閉獵頭警報
        if (!bannerText.innerText.includes("🌍 全局")) {
            banner.style.display = "none";
        }
    }
}

function applyGlobalEvent() {
    const code = sanitizeCode(document.getElementById('generic-code').value);
    const ev = GLOBAL_EVENTS[code];
    if(!ev) return alert("無效代碼");
    
    const msg = ev.action();
    if(ev.showBanner) {
        const banner = document.getElementById('globalStatusBanner');
        const bannerText = document.getElementById('globalStatusText');
        banner.style.display = "flex";
        banner.style.background = "#f59e0b"; // 橘色
        banner.style.color = "#000";
        bannerText.innerText = `🌍 全局：${ev.name} (${ev.effect})`;
    }
    
    closeGenericScanner(); renderEmployees();
    openModal(`🌍 全局事件：${ev.name}`, `<b>具體情況：</b><br>${ev.desc}<br><br><b>遊戲效果：</b>${ev.effect}`);
}

// ==========================================
// 5. 其他功能 (獎金卡、獵頭、晉升)
// ==========================================

function triggerBonusCard() {
    toggleSidebar();
    openModal("💰 使用獎金卡", "情境選擇：", `
        <button class="primary-btn" onclick="bonusToSelf()">對【我的員工】發獎金</button>
        <button class="danger-btn" onclick="bonusAttacked()">【我被攻擊】引發內鬨</button>
        <button class="secondary-btn" onclick="closeModal()">取消</button>
    `);
}

function bonusToSelf() {
    let html = "選擇獲獎員工 (需掃 P 卡)：<br><br>";
    managerData.employees.forEach((e, i) => html += `<button class="tool-btn" onclick="verifyPBonus(${i})">${e.name}</button>`);
    openModal("給予獎勵", html);
}

function verifyPBonus(idx) {
    managerData.activeEmpIdx = idx; closeModal();
    openGenericScanner("驗證 P 卡", "對自己使用需搭配 P 卡", "PRAISING (P)", "P01", () => {
        const c = sanitizeCode(document.getElementById('generic-code').value);
        if(!c.startsWith('P')) return alert("無效 P 卡");
        managerData.employees[managerData.activeEmpIdx].trust = Math.min(3, managerData.employees[managerData.activeEmpIdx].trust + 2);
        closeGenericScanner(); renderEmployees(); openModal("💰 成功", "信任值 +2");
    }, null, true);
}

function bonusAttacked() {
    let html = "選擇受害員工：<br><br>";
    managerData.employees.forEach((e, i) => html += `<button class="tool-btn" onclick="applyAttack(${i})">${e.name}</button>`);
    openModal("處理攻擊", html);
}
function applyAttack(idx) { 
    managerData.employees[idx].trust = Math.max(-3, managerData.employees[idx].trust - 1); 
    renderEmployees(); closeModal(); openModal("🎯 受擊", "信任值 -1");
}

function triggerHeadhunt() {
    toggleSidebar();
    openModal("🎯 獵人頭處理", "您的角色：", `
        <button class="primary-btn" onclick="startHunterFlow()">我是【獵頭成功者】</button>
        <button class="danger-btn" onclick="startHuntedFlow()">【我的員工】被獵走了</button>
        <button class="secondary-btn" onclick="closeModal()">取消</button>
    `);
}

function startHuntedFlow() {
    let html = "選擇被獵員工：<br><br>";
    managerData.employees.forEach((e, i) => html += `<button class="tool-btn" onclick="confirmHunted('${i}')">${e.name}</button>`);
    openModal("移除員工", html);
}
function confirmHunted(idx) {
    const emp = managerData.employees[idx];
    openModal("📋 交接", `獵頭者錄入：<br>D${emp.bus.d} | D${emp.adm.d}`, `<button class="danger-btn" onclick="execDeparture(${idx})">確認移除</button>`);
}
function execDeparture(idx) { managerData.employees.splice(idx, 1); renderEmployees(); closeModal(); }

function startHunterFlow() { closeModal(); openGenericScanner("獵頭接收", "掃描 F 卡", "FOLLOWER", "F01", processHunterScan, null, true); }
function processHunterScan() {
    const c = sanitizeCode(document.getElementById('generic-code').value);
    if(!FOLLOWER_DB[c]) return alert("錯");
    closeGenericScanner();
    openModal("📝 等級錄入", `業務 (1-4): <input type="number" id="h-bus" value="1" class="input-field"><br>行政 (1-4): <input type="number" id="h-adm" value="1" class="input-field">`, `<button class="primary-btn" onclick="saveHunter('${c}')">完成</button>`);
}
function saveHunter(c) {
    const b = parseInt(document.getElementById('h-bus').value), a = parseInt(document.getElementById('h-adm').value);
    let newEmp = { name: FOLLOWER_DB[c].name + " (獵頭)", bus: { d: b }, adm: { d: a }, trust: 1 };
    refreshDialogue(newEmp);
    managerData.employees.push(newEmp);
    renderEmployees(); closeModal();
}

// --- 通用控制 ---

function forceD2(idx) { managerData.employees[idx].bus.d = 2; managerData.employees[idx].adm.d = 2; renderEmployees(); }
function openModal(t, c, h = null) {
    document.getElementById('modalTitle').innerHTML = t;
    document.getElementById('modalContent').innerHTML = c;
    document.getElementById('modalActions').innerHTML = h ? h : `<button class="primary-btn" onclick="closeModal()">確認並繼續</button>`;
    document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
function closeBanner() { document.getElementById('globalStatusBanner').style.display = "none"; }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function openGenericScanner(t, d, l, p, s, f, c = true) {
    document.getElementById('scanTitle').innerText = t; document.getElementById('scanDesc').innerText = d; document.getElementById('scanLabel').innerText = l;
    const i = document.getElementById('generic-code'); i.value = ""; i.placeholder = p;
    document.getElementById('genericScanner').style.display = 'flex'; document.getElementById('scanConfirmBtn').onclick = s;
    const b = document.getElementById('scanCancelBtn'); b.style.display = c ? "block" : "none"; b.onclick = f || closeGenericScanner;
}
function closeGenericScanner() { document.getElementById('genericScanner').style.display = 'none'; }
function openActionScanner(idx) { managerData.activeEmpIdx = idx; document.getElementById('actionScanner').style.display = 'flex'; }
function closeActionScanner() { document.getElementById('actionScanner').style.display = 'none'; }

function openGlobalEventInput() { toggleSidebar(); openGenericScanner("同步全局事件", "輸入代碼", "EVENT", "E01", applyGlobalEvent, null, true); }
function triggerPromotion() {
    toggleSidebar();
    let html = "選擇晉升員工：<br><br>";
    managerData.employees.forEach((e, i) => html += `<button class="tool-btn" onclick="startPromo(${i})">${e.name}</button>`);
    openModal("🆙 晉升", html);
}
function startPromo(idx) {
    managerData.activeEmpIdx = idx; closeModal();
    openGenericScanner("晉升驗證", "掃描 P 卡", "PRAISING", "P01", () => {
        const c = sanitizeCode(document.getElementById('generic-code').value);
        if(!c.startsWith('P')) return alert("錯");
        const e = managerData.employees[managerData.activeEmpIdx];
        if(e.bus.d < 4) e.bus.d++; if(e.adm.d < 4) e.adm.d++;
        closeGenericScanner(); renderEmployees(); openModal("✨ 成功", "能力已提升！");
    }, null, true);
}
function openNewFollowerScan() {
    toggleSidebar();
    openGenericScanner("新部屬入職", "掃描部屬卡", "FOLLOWER", "F02", () => {
        const c = sanitizeCode(document.getElementById('generic-code').value);
        if(!FOLLOWER_DB[c]) return alert("錯");
        let n = { name: FOLLOWER_DB[c].name, bus: { d: 1 }, adm: { d: 1 }, trust: 3 };
        refreshDialogue(n);
        managerData.employees.push(n);
        closeGenericScanner(); renderEmployees();
    }, null, true);
}
function triggerCrisis() {
    toggleSidebar();
    openModal("🌋 職場危機", "部屬遭遇挫折！", `<button class="primary-btn" onclick="goToCrisisScanner()">我有責備卡 (R)</button><button class="danger-btn" onclick="resolveCrisisFailure()">我沒有責備卡</button>`);
}
function goToCrisisScanner() { closeModal(); openGenericScanner("危機化解", "驗證 R 卡", "REPRIMAND", "R01", () => { closeGenericScanner(); openModal("✅ 成功", "化解！"); }, resolveCrisisFailure, true); }
function resolveCrisisFailure() { managerData.employees.forEach(e => e.trust--); renderEmployees(); closeGenericScanner(); closeModal(); openModal("❌ 失敗", "全員信任-1"); }
function triggerEvent() { toggleSidebar(); const evs = ["獲得 2 AP", "全員前進 3 步", "免試獵頭"]; openModal("🎲 事件", evs[Math.floor(Math.random()*3)]); }
function triggerTraining() { toggleSidebar(); openModal("🏫 進修", "停留 2 回合獲升級。"); }

window.onload = () => console.log("Career Pilot 2.5 Ready");