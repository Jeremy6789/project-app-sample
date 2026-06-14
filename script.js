// ==========================================
// 1. 資料庫與代碼映射
// ==========================================
const TASK_CODES = { "58291": 1, "10473": 2, "72945": 3, "31628": 4, "94052": 5, "48137": 6, "25760": 7, "63914": 8, "82405": 9, "17539": 10 };
const ADMIN_CODES = { "88214": 1, "30592": 2, "41763": 3, "92401": 4, "15638": 5, "74025": 6, "62917": 7, "20384": 8, "53176": 9, "49820": 10 };

const TASKS = {
    1: { name: "核心 Bug 緊急修補", buff: "若本回合管理多名員工，額外獲得聲望 +1 點。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    2: { name: "新框架導入評估", buff: "聲望增減變動：達成『完美匹配』改為獲得聲望 +2 點。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    3: { name: "代碼屎山大掃除", buff: "達成『半對』或『完美匹配』，可額外獲得一顆 d6 骰子。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    4: { name: "金流 API 串接", buff: "若達成『完美匹配』，指定前進步數擴大為 1~8 步。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    5: { name: "啟動速度優化", buff: "達成『完美匹配』無法獲得指定骰，改為領取一顆 d6。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    6: { name: "資料庫搬遷雲端", buff: "本回合結算後，每位玩家可從銀行免費獲得 1 張管理祕訣卡。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    7: { name: "資安滲透測試", buff: "特別效果：可放棄本次領導，聲望直接 +1 點。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] }, canSkip: true },
    8: { name: "自動化測試建置", buff: "本回合達成『半對』或『完美匹配』均可領取指定骰 (1~6步)。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    9: { name: "高併發架構設計", buff: "每位玩家請額外從牌庫抽取 1 張維度卡加入手牌中。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } },
    10: { name: "新技術原型 PoC", buff: "本回合結算後，請將手上的 2 張維度卡交換給左邊的玩家。", answers: { D1:["高指令","低支持"], D2:["高指令","高支持"], D3:["低指令","高支持"], D4:["低指令","低支持"] } }
};

const ADMINS = {
    1: { name: "年度軟體授權清查", d: "D4", ans: "低指令 / 低支持" },
    2: { name: "報帳系統測試", d: "D1", ans: "高指令 / 低支持" },
    3: { name: "慶功宴餐廳規劃", d: "D3", ans: "低指令 / 高支持" },
    4: { name: "技術 Wiki 重整", d: "D2", ans: "高指令 / 高支持" },
    5: { name: "新人設備領取", d: "D1", ans: "高指令 / 低支持" },
    6: { name: "季度績效考核", d: "D3", ans: "低指令 / 高支持" },
    7: { name: "辦公室座位搬遷", d: "D4", ans: "低指令 / 低支持" },
    8: { name: "加班費新制諮詢", d: "D2", ans: "高指令 / 高支持" },
    9: { name: "部門週報彙整", d: "D3", ans: "低指令 / 高支持" },
    10: { name: "固定資產盤點", d: "D2", ans: "高指令 / 高支持" }
};

let gameData = { taskCount: 0, currentTask: null, currentTaskId: 0, currentAdmin: null, selectedEmployees: [], scannerType: "" };
const html5QrCode = new Html5Qrcode("reader-placeholder"); // 初始化後隨即更換實體 ID

// ==========================================
// 3. 掃描與代碼判定
// ==========================================
function startFlow(type) {
    gameData.scannerType = type;
    const readerId = type === 'task' ? 'task-reader' : 'admin-reader';
    showPage(type + '-select');

    // 確保舊掃描器已清理
    if (gameData.scanner) {
        gameData.scanner.clear();
    }

    gameData.scanner = new Html5Qrcode(readerId);
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    gameData.scanner.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
            // 成功掃描後的動作：先停止相機，再處理資料
            console.log("掃描成功:", decodedText);
            gameData.scanner.stop().then(() => {
                handleUniversalInput(decodedText);
            }).catch(err => {
                console.log("停止掃描時出錯", err);
                handleUniversalInput(decodedText); // 就算停止失敗也強行處理資料
            });
        },
        (errorMessage) => {
            // 忽略「找不到 QR Code」的每幀報錯，避免彈窗
            // console.log(errorMessage); 
        }
    ).catch(err => {
        console.error("相機啟動失敗", err);
    });
}

function stopScanner() {
    if (gameData.scanner && gameData.scanner.isScanning) {
        gameData.scanner.stop().then(() => {
            gameData.scanner.clear();
            showPage('home');
        });
    } else {
        showPage('home');
    }
}

function handleUniversalInput(input) {
    const code = input.trim();
    if (gameData.scannerType === 'task') {
        const id = TASK_CODES[code];
        if (id) { loadTask(id); } 
        else { alert("任務代碼無效: " + code); showPage('task-select'); }
    } else {
        const id = ADMIN_CODES[code];
        if (id) { loadAdmin(id); } 
        else { alert("行政代碼無效: " + code); showPage('admin-select'); }
    }
}

function validateTaskCode() { 
    const val = document.getElementById('task-code-input').value;
    handleUniversalInput(val); 
}

function validateAdminCode() { 
    const val = document.getElementById('admin-code-input').value;
    handleUniversalInput(val); 
}

// ==========================================
// 4. 全局任務判定流程
// ==========================================

function loadTask(id) {
    gameData.currentTaskId = id;
    gameData.currentTask = TASKS[id];
    document.getElementById('task-info-header').innerHTML = `
        <h2 style="margin:0; font-size:1.3rem;">任務 ${id}：${gameData.currentTask.name}</h2>
        <div class="buff-box">💡 本局效果：${gameData.currentTask.buff}</div>`;

    const list = document.getElementById('employee-selection-list');
    list.innerHTML = "";
    [1,2,3,4].forEach(d => {
        list.innerHTML += `
            <div class="selection-item" onclick="this.classList.toggle('active')" id="select-d${d}">
                <div class="check-circle">✓</div>
                <div class="menu-info"><span class="menu-title">D${d} 員工</span></div>
            </div>`;
    });

    const step1Extra = document.getElementById('step1-extra-action');
    step1Extra.innerHTML = (id === 7) ? `<button class="ghost-btn" style="border-color:var(--primary); color:var(--primary); border-style:solid;" onclick="nextRound(false, true)">放棄領導 (任務 7 特效：聲望 +1)</button>` : "";

    showPage('task-step1');
}

function goToTaskStep2() {
    gameData.selectedEmployees = [];
    [1,2,3,4].forEach(d => { if(document.getElementById(`select-d${d}`).classList.contains('active')) gameData.selectedEmployees.push(d); });
    if(gameData.selectedEmployees.length === 0) return alert("請至少選擇一位員工");

    const grid = document.getElementById('diagnosis-grid');
    grid.innerHTML = `<p class="zone-hint" style="color:var(--primary); font-weight:bold;">💡 點選您對該員工「實際打出」且「正確」的卡牌：</p>`;
    gameData.selectedEmployees.forEach(d => {
        const ans = gameData.currentTask.answers['D'+d];
        grid.innerHTML += `
            <div class="diagnosis-row">
                <span class="d-label">對 D${d} 員工 (正確應為 S${d})：</span>
                <div class="btn-group">
                    <button class="style-btn" onclick="this.classList.toggle('active')">正確的 [${ans[0]}] 卡</button>
                    <button class="style-btn" onclick="this.classList.toggle('active')">正確的 [${ans[1]}] 卡</button>
                </div>
            </div>`;
    });

    const step2Extra = document.getElementById('step2-extra-action');
    step2Extra.innerHTML = (gameData.currentTaskId === 7) ? `<button class="ghost-btn" style="color:var(--primary); border-style:solid; border-width:2px;" onclick="nextRound(false, true)">放棄領導 (聲望 +1)</button>` : "";
    showPage('task-step2');
}

function resolveTask() {
    let log = "";
    let misalignedAny = false;
    const rows = document.querySelectorAll('.diagnosis-row');
    const tid = gameData.currentTaskId;

    rows.forEach((row, idx) => {
        const d = gameData.selectedEmployees[idx];
        const active = row.querySelectorAll('.style-btn.active').length;
        if (active === 2) {
            let rep = (tid === 2) ? 2 : 1;
            let dice = (tid===3)?"指定骰+1d6":(tid===4)?"指定骰(1-8步)":(tid===5)?"d6 骰子":(tid===9)?"指定骰(步數x2)":"指定骰(1-6步)";
            log += `<p><strong>D${d}：</strong><span style="color:var(--success)">完美匹配</span><br>➔ ${dice}，聲望 +${rep}</p>`;
        } else if (active === 1) {
            let dice = (tid===3)?"d3+1d6骰":(tid===8)?"指定骰(1-6步)":"d3 骰子一顆";
            log += `<p><strong>D${d}：</strong><span style="color:var(--warning)">半對保底</span><br>➔ ${dice}</p>`;
        } else {
            log += `<p><strong>D${d}：</strong><span style="color:var(--danger)">嚴重錯位</span><br>➔ 無產出，聲望 -1</p>`;
            misalignedAny = true;
        }
    });

    if (tid === 1 && gameData.selectedEmployees.length > 1) log += `<p style="color:var(--primary)">✨ 任務效果：聲望額外 +1</p>`;
    if (tid === 10 && misalignedAny) log += `<p style="color:var(--danger); font-weight:bold;">⚠️ 嚴厲問責：聲望改為 -3 點！</p>`;

    openModal("結算結果報告", log, () => nextRound());
}

// ==========================================
// 5. 行政挑戰判定 (修復紅綠框改選)
// ==========================================
function loadAdmin(id) {
    gameData.currentAdmin = ADMINS[id];
    document.getElementById('admin-content').innerHTML = `<h2>行政挑戰編號 ${id}</h2><div class="buff-box">${gameData.currentAdmin.name}</div>`;
    document.getElementById('admin-result').style.display = 'none';
    
    document.querySelectorAll('.d-btn').forEach(b => b.className = 'd-btn');
    showPage('admin-detail');
}

function revealAdmin(btn, guess) {
    const correctD = gameData.currentAdmin.d;
    document.querySelectorAll('.d-btn').forEach(b => {
        b.classList.remove('btn-correct', 'btn-wrong');
        if(b.innerText === correctD) b.classList.add('btn-correct');
    });
    if (guess !== correctD) btn.classList.add('btn-wrong');

    const res = document.getElementById('admin-result');
    res.style.display = 'block';
    res.innerHTML = `<h3>${guess === correctD ? '🎯 診斷正確！聲望 +2' : '❌ 診斷有誤'}</h3><p>正確答案：<strong>${correctD}</strong> (${gameData.currentAdmin.ans})</p>`;
}

// ==========================================
// 6. 通用 UI 控制
// ==========================================
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + id).style.display = 'block';
    if(id === 'task-select') document.getElementById('task-code-input').value = "";
    if(id === 'admin-select') document.getElementById('admin-code-input').value = "";
    window.scrollTo(0,0);
}

function nextRound(skip = false, task7 = false) {
    gameData.taskCount++;
    document.getElementById('round-number').innerText = gameData.taskCount;
    if (task7) openModal("✨ 任務效果", "放棄領導成功，聲望直接 +1 點。");
    else if (skip) openModal("🧘 管理沉澱", "年度進度已推進，請領取紅利。");

    if (gameData.taskCount > 0 && gameData.taskCount % 3 === 0) {
        setTimeout(() => openModal("🌊 組織活水", "<span style='color:var(--danger); font-weight:bold;'>強制換血時間到！</span><br>請全場經理人更換一名員工卡。"), 500);
    }
    showPage('home');
}

function openModal(t, b, cb) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerHTML = b;
    document.getElementById('modal-close-btn').onclick = () => { closeModal(); if(cb) cb(); };
    document.getElementById('app-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('app-modal').style.display = 'none'; }

window.onload = init;