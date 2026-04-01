// --- 1. 遊戲資料設定 ---
const GAME_CONFIG = {
    // 診斷心聲資料庫
    dialogues: {
        D1: ["主管，我對這項新任務充滿期待！請告訴我確切的步驟，我想立刻動手。", "我準備好了！請問有標準作業程序（SOP）可以參考嗎？"],
        D2: ["我本來以為很簡單，但現在完全卡住了...我真的適合這項工作嗎？", "進度一點都沒動，我感到很沮喪，不知道該怎麼繼續。"],
        D3: ["功能已經做好了，但我不確定這樣處理對不對，你能幫我做最後確認嗎？", "我怕我自己決定的話會出錯，可以請你再給我一點信心嗎？"],
        D4: ["目前進度超前，風險已經排除了。這件事交給我，週五準時交件。", "我已經準備好兩套方案，目前正執行最有效率的那一套。"]
    },
    // 15 張隨機事件 (黃金比例)
    events: [
        { t: "資源補給", d: "立刻獲得 2 枚 AP 幣。", type: "P" },
        { t: "跨部門合作", d: "邀請對手結盟，各付 2 AP，雙方員工皆前進 3 步。", type: "P" },
        { t: "技術革命", d: "全場 D3/D4 員工，立即退化至 D2 階段！", type: "G" },
        { t: "組織重整", d: "全體 D2+ 員工退 1 級，信任值 -1（可用責備卡抵銷）。", type: "G" },
        { t: "福利日", d: "全員士氣提升！全場員工信任值 +1。", type: "G" },
        { t: "獵頭情報", d: "獲得一次無消耗且無條件成功的獵人頭機會。", type: "P" },
        // ... 可重複添加以上內容至 15 張
    ]
};

// --- 2. 初始化玩家資料 ---
let state = {
    currentP: 0,
    players: [
        { name: "玩家 1", emps: [{ name: "阿強", bD: 1, aD: 1, trust: 0, lock: false }, { name: "新部屬", bD: 1, aD: 1, trust: 0, lock: true }] },
        { name: "玩家 2", emps: [{ name: "小玲", bD: 1, aD: 1, trust: 0, lock: false }, { name: "待解鎖", bD: 1, aD: 1, trust: 0, lock: true }] }
    ]
};

// --- 3. 核心功能 ---
function init() {
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

    main.innerHTML = p.emps.map((e, idx) => {
        if (e.lock) return `<div class="emp-card" style="text-align:center; color:#94a3b8;">跑完第一圈解鎖新部屬</div>`;
        return `
            <div class="emp-card">
                <div class="emp-header">
                    <span class="emp-name">👨‍💻 ${e.name}</span>
                    <span class="trust-badge">信任值: ${e.trust}</span>
                </div>
                <label>選擇診斷技能：</label>
                <select id="skill_${idx}" class="skill-selector">
                    <option value="bD">業務執行 (Business)</option>
                    <option value="aD">行政管理 (Admin)</option>
                </select>
                <button class="btn-diagnose" onclick="getHeartVoice(${idx})">🎧 聆聽心聲</button>
                <div id="voice_${idx}" class="heart-box"></div>
                <div class="input-row">
                    <div><label>指令卡代碼</label><input id="i_${idx}" placeholder="I-01"></div>
                    <div><label>支持卡代碼</label><input id="s_${idx}" placeholder="S-01"></div>
                </div>
                <button class="btn-execute" onclick="checkLeadership(${idx})">發動領導行動</button>
            </div>
        `;
    }).join('');
}

// 診斷邏輯
function getHeartVoice(idx) {
    const emp = state.players[state.currentP].emps[idx];
    const skill = document.getElementById(`skill_${idx}`).value;
    const dLevel = emp[skill];
    const pool = GAME_CONFIG.dialogues[`D${dLevel}`];
    const text = pool[Math.floor(Math.random() * pool.length)];
    
    const box = document.getElementById(`voice_${idx}`);
    box.innerText = `「${text}」`;
    box.style.display = "block";
}

// 領導匹配邏輯 (黑盒子)
function checkLeadership(idx) {
    const iVal = document.getElementById(`i_${idx}`).value.toUpperCase();
    const sVal = document.getElementById(`s_${idx}`).value.toUpperCase();

    if(!iVal || !sVal) return alert("請輸入完整代碼");

    // 代碼轉譯邏輯 (假設 01-10 為高，其餘低)
    const getAttr = (str) => parseInt(str.replace(/\D/g,'')) <= 10 ? 'H' : 'L';
    const directive = getAttr(iVal);
    const supportive = getAttr(sVal);

    // 確定風格 S
    let sStyle = 0, styleName = "", ap = 0;
    if(directive === 'H' && supportive === 'L') { sStyle = 1; styleName = "S1 指導"; ap = 2; }
    else if(directive === 'H' && supportive === 'H') { sStyle = 2; styleName = "S2 教練"; ap = 2; }
    else if(directive === 'L' && supportive === 'H') { sStyle = 3; styleName = "S3 支持"; ap = 1; }
    else { sStyle = 4; styleName = "S4 授權"; ap = 0; }

    const emp = state.players[state.currentP].emps[idx];
    const skill = document.getElementById(`skill_${idx}`).value;
    const realD = emp[skill];
    const dice = realD <= 2 ? "d6" : (realD === 3 ? "d8" : "d12");

    let title = "", detail = "";
    if(sStyle === realD) {
        title = "🎉 完美匹配！";
        detail = `使用了 <b>${styleName}</b>。<br><b>後果：</b>耗 2 AP，信任 +1。<br><b>擲骰：</b>請擲 1 次 <b>${dice}</b>。`;
        emp.trust = Math.min(3, emp.trust + 1);
    } else if(Math.abs(sStyle - realD) === 1) {
        title = "⚠️ 輕微偏離";
        detail = `使用了 <b>${styleName}</b>。<br><b>後果：</b>耗 ${ap} AP，不加信任。<br><b>擲骰：</b>請擲 1 次 <b>${dice}</b> 但<b>步數減半</b>。`;
    } else {
        title = "❌ 嚴重錯位";
        detail = `使用了 <b>${styleName}</b>。<br><b>後果：</b>耗 ${ap} AP，信任 -1。<br><b>動作：原地停留</b>。`;
        emp.trust = Math.max(-3, emp.trust - 1);
    }

    showModal(title, detail);
    renderContent();
}

// 隨機事件
function triggerRandomEvent() {
    const ev = GAME_CONFIG.events[Math.floor(Math.random() * GAME_CONFIG.events.length)];
    showModal(`🎲 隨機事件：${ev.t}`, ev.d);
}

// 彈窗控制
function showModal(t, d) {
    document.getElementById('modalHeader').innerText = t;
    document.getElementById('modalContent').innerHTML = d;
    document.getElementById('modalOverlay').style.display = "flex";
}
function closeModal() { document.getElementById('modalOverlay').style.display = "none"; }

init();