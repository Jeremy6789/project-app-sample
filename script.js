// ==========================================
// 1. 代碼映射與資料庫 (V4.0 正式版)
// ==========================================
const TASK_CODES = { "58291": 1, "10473": 2, "72945": 3, "31628": 4, "94052": 5, "48137": 6, "25760": 7, "63914": 8, "82405": 9, "17539": 10 };
const ADMIN_CODES = { "88214": 1, "30592": 2, "41763": 3, "94401": 4, "15638": 5, "74025": 6, "62917": 7, "20384": 8, "53176": 9, "49820": 10 };

const TASKS = {
    1: { name: "核心 Bug 緊急修補", buff: "若本局管理多名員工，額外獲得聲望 +1 點。", answers: { D1:["高指令","低支持","提供精確 Debug 步驟，不需討論。"], D2:["高指令","高支持","解釋掛掉原因，指導追蹤 Log，並給予支持。"], D3:["低指令","高支持","傾聽其方案，給予信心並替其決策背書。"], D4:["低指令","低支持","告知範圍，由其全權負責，主管不介入細節。"] } },
    2: { name: "新框架導入評估", buff: "聲望加成：達成『完美匹配』改為獲得聲望 +2 點。", answers: { D1:["高指令","低支持","指定測驗特定 API 並規定格式做紀錄。"], D2:["高指令","高支持","解釋換框架意義，避免因技術深放棄。"], D3:["低指令","高支持","支持各種壓力測試，主管扮演諮詢者。"], D4:["低指令","低支持","授權全權決定採購細節，展現完全信任。"] } },
    3: { name: "代碼屎山大掃除", buff: "若達成半對或完美匹配可額外獲一顆 d3 骰，一位玩家至多一顆。", answers: { D1:["高指令","低支持","規定規範，指定只修改表層變數命名。"], D2:["高指令","高支持","引導優化結構，並在挫折時給予支持。"], D3:["低指令","高支持","由其主導重構路徑，提供心理後盾。"], D4:["低指令","低支持","授權設計整體架構，只需看最終效能報告。"] } },
    4: { name: "金流 API 串接", buff: "若達成完美匹配，可前進步數為投擲步數 +2 步。", answers: { D1:["高指令","低支持","提供調用範例，要求按特定路徑測試。"], D2:["高指令","高支持","示範處理延遲，失敗時給予高度耐心。"], D3:["低指令","高支持","讓他決定架構，對其安全性顧慮提供支持。"], D4:["低指令","低支持","交由其獨立對接廠商，主管僅驗收成果。"] } },
    5: { name: "啟動速度優化", buff: "本局效果：僅能對每位員工使用 1 張維度卡 (無法達成完美匹配)。", isTask5: true, answers: { D1:["高指令","低支持","給予明確設定，要求回報各頁面加載秒數。"], D2:["高指令","高支持","教導監控工具，並給予正向鼓勵。"], D3:["低指令","高支持","支持嘗試新緩存策略，主管負責決策背書。"], D4:["低指令","低支持","授權進行大手術，確認資源是否充足。"] } },
    6: { name: "資料庫搬遷雲端", buff: "每位玩家額外獲得管理祕訣卡一張。", answers: { D1:["高指令","低支持","給予確認清單，規定每搬移資料夾都要截圖。"], D2:["高指令","高支持","說明遷移風險，帶著做壓力測試並給予肯定。"], D3:["低指令","高支持","詢問其備援看法，協助排除跨部門障礙。"], D4:["低指令","低支持","委託主導時程，主管不干預清理過程。"] } },
    7: { name: "資安滲透測試", buff: "特別效果：可放棄本次領導，聲望直接 +1 點。", canSkip: true, answers: { D1:["高指令","低支持","指定使用特定工具，紀錄工具回報的所有紅燈。"], D2:["高指令","高支持","解釋攻擊原理，帶著修復一個漏洞。"], D3:["低指令","高支持","規劃資安防護體系，肯定謹慎態度。"], D4:["低指令","低支持","全權負責加固工作，主管僅聽取最終評估。"] } },
    8: { name: "自動化測試建置", buff: "限制：若派出多名員工，僅能選中一位員工進行出牌判定。", limitOne: true, answers: { D1:["高指令","低支持","幫定好撰寫框架，叫他先寫 5 個基礎腳本。"], D2:["高指令","高支持","引導克服排斥，討論自動化如何減輕負擔。"], D3:["低指令","高支持","讓他設計測試案例，增加展示成果的信心。"], D4:["低指令","低支持","建立整個流程，主管驗收自動化覆蓋率即可。"] } },
    9: { name: "高併發架構設計", buff: "🚨 立即執行：請將手上的所有管理祕訣卡交給左邊玩家。", isImmediate: true, answers: { D1:["高指令","低支持","指定負責負載平衡參數，不准隨意改動。"], D2:["高指令","高支持","梳理出錯原因，解釋分散式觀念並給予支持。"], D3:["低指令","高支持","由其主導方案，主管支持其決策並背書。"], D4:["低指令","低支持","擔任總召集人，主管聽取規劃。"] } },
    10: { name: "新技術原型 PoC", buff: "🚨 立即執行：請先將手中的 2 張維度卡交換給左邊的玩家。", isImmediate: true, answers: { D1:["高指令","低支持","指定安裝開發套件，按照官網範例跑出專案。"], D2:["高指令","高支持","帶著克服環境困難，解釋新技術市場潛力。"], D3:["低指令","高支持","讓其決定實驗方向，肯定每一小步。"], D4:["低指令","低支持","全權委託主導計畫，僅看最終技術價值。"] } }
};

const ADMINS = {
    1: { name: "年度軟體授權清查", d: "D4", ans: "低指令 / 低支持", ex: "「我信任你的專業，細節你定，週一再給我結果即可。」" },
    2: { name: "報帳系統測試", d: "D1", ans: "高指令 / 低支持", ex: "「照這份清單測一遍，下午三點前截圖回報給我。」" },
    3: { name: "慶功宴餐廳規劃", d: "D3", ans: "低指令 / 高支持", ex: "「這兩家選得很好！我支持你的眼光，放心訂位。」" },
    4: { name: "技術文件重新分類", d: "D2", ans: "高指令 / 高支持", ex: "「我先帶你整理一次邏輯，我們先做完這一區。」" },
    5: { name: "新人設備領取引導", d: "D1", ans: "高指令 / 低支持", ex: "「拿這張清單帶新人領設備並逐項勾選，完成後交回。」" },
    6: { name: "季度績效目標設定", d: "D3", ans: "低指令 / 高支持", ex: "「挑戰高標看看，別擔心達不到，我會是資源後盾。」" },
    7: { name: "辦公室座位搬遷", d: "D4", ans: "低指令 / 低支持", ex: "「安排很周全！週一入座後再跟我簡單更新配置狀況即可。」" },
    8: { name: "加班費計算諮詢", d: "D2", ans: "高指令 / 高支持", ex: "「我劃好重點了，你先試著回覆，遇到困難再轉給我。」" },
    9: { name: "彙整部門週報摘要", d: "D3", ans: "低指令 / 高支持", ex: "「文筆非常精準，直接發出去就可以了。你寫得很好！」" },
    10: { name: "固定資產盤點", d: "D2", ans: "高指令 / 高支持", ex: "「為了能申請新設備，我們先完成盤點，下週再專心開發。」" }
};

// ==========================================
// 2. 狀態管理與頁面控制
// ==========================================
let gameData = { taskCount: 0, currentTask: null, currentTaskId: 0, selectedEmployees: [], scanner: null, scannerType: "" };

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const target = document.getElementById('page-' + id);
    if(target) target.style.display = 'block';
    
    // 清理輸入框內容
    if(id === 'task-select') document.getElementById('task-code-input').value = "";
    if(id === 'admin-select') document.getElementById('admin-code-input').value = "";
    window.scrollTo(0,0);
}

// ==========================================
// 3. 掃描與輸入驗證
// ==========================================
function startFlow(type) {
    gameData.scannerType = type;
    const readerId = type === 'task' ? 'task-reader' : 'admin-reader';
    showPage(type + '-select');

    if (gameData.scanner) gameData.scanner.clear();
    gameData.scanner = new Html5Qrcode(readerId);
    
    // 移除 qrbox 以達到全螢幕掃描效果
    gameData.scanner.start({ facingMode: "environment" }, { fps: 10 }, (decodedText) => {
        gameData.scanner.stop().then(() => { handleUniversalInput(decodedText); });
    }, () => {}).catch(err => console.error("相機錯誤"));
}

function stopScanner() {
    if (gameData.scanner && gameData.scanner.isScanning) {
        gameData.scanner.stop().then(() => { gameData.scanner.clear(); showPage('home'); });
    } else { showPage('home'); }
}

function handleUniversalInput(input) {
    const code = input.trim();
    if (gameData.scannerType === 'task') {
        const id = TASK_CODES[code];
        if (id) loadTask(id); else alert("任務代碼錯誤");
    } else {
        const id = ADMIN_CODES[code];
        if (id) loadAdmin(id); else alert("行政代碼錯誤");
    }
}

function validateTaskCode() { handleUniversalInput(document.getElementById('task-code-input').value); }
function validateAdminCode() { handleUniversalInput(document.getElementById('admin-code-input').value); }

// ==========================================
// 4. 全局任務流程
// ==========================================
function loadTask(id) {
    gameData.currentTaskId = id;
    gameData.currentTask = TASKS[id];



    document.getElementById('task-info-header').innerHTML = `
        <h2 style="margin:0;">任務 ${id}：${gameData.currentTask.name}</h2>
        <div class="buff-box">💡 本局效果：${gameData.currentTask.buff}</div>`;

    const list = document.getElementById('employee-selection-list');
    list.innerHTML = "";
    [1,2,3,4].forEach(d => {
        list.innerHTML += `<div class="selection-item" onclick="this.classList.toggle('active')" id="select-d${d}"><div class="check-circle">✓</div><div class="menu-info"><span class="menu-title">D${d} 員工</span></div></div>`;
    });

    const step1Extra = document.getElementById('step1-extra-action');
    step1Extra.innerHTML = (id === 7) ? `<button class="confirm-btn" style="background:var(--primary);" onclick="nextRound(false, true)">放棄領導 (任務 7 獎勵：聲望 +1)</button>` : "";
    showPage('task-step1');
}

function toggleStyleState(btn) {
    const parentRow = btn.closest('.diagnosis-row');
    const isTask5 = gameData.currentTask.isTask5;

    if (isTask5) {
        // 任務 5 限制：僅能使用一張
        if (btn.classList.contains('correct')) {
            btn.classList.remove('correct'); btn.classList.add('wrong');
        } else if (btn.classList.contains('wrong')) {
            btn.classList.remove('wrong');
        } else {
            const otherActive = parentRow.querySelector('.style-btn.correct, .style-btn.wrong');
            if (otherActive) { alert("任務 5 限制：每位員工限用 1 張維度卡！"); return; }
            btn.classList.add('correct');
        }
    } else {
        // 一般三態切換
        if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) btn.classList.add('correct');
        else if (btn.classList.contains('correct')) { btn.classList.remove('correct'); btn.classList.add('wrong'); }
        else btn.classList.remove('wrong');
    }
}

function goToTaskStep2() {
    gameData.selectedEmployees = [];
    [1,2,3,4].forEach(d => { if(document.getElementById(`select-d${d}`).classList.contains('active')) gameData.selectedEmployees.push(d); });
    
    if(gameData.selectedEmployees.length === 0) return alert("請至少選擇一位員工");
    if(gameData.currentTask.limitOne && gameData.selectedEmployees.length > 1) return alert("任務 8 限制：本回合僅能選擇一位員工。");

    const grid = document.getElementById('diagnosis-grid');
    grid.innerHTML = `<p class="zone-hint" style="color:var(--primary); font-weight:bold;">💡 點選您對該員工「實際出牌」的狀況 (灰➔綠➔紅)：</p>`;
    gameData.selectedEmployees.forEach(d => {
        const ans = gameData.currentTask.answers['D'+d];
        grid.innerHTML += `
            <div class="diagnosis-row">
                <span class="d-label">對 D${d} 員工 (正確應為 S${d})：</span>
                <div class="btn-group">
                    <button class="style-btn" onclick="toggleStyleState(this)">[${ans[0]}] 卡</button>
                    <button class="style-btn" onclick="toggleStyleState(this)">[${ans[1]}] 卡</button>
                </div>
            </div>`;
    });

    const step2Extra = document.getElementById('step2-extra-action');
    step2Extra.innerHTML = (gameData.currentTaskId === 7) ? `<button class="confirm-btn" style="background:var(--primary); margin-top:10px;" onclick="nextRound(false, true)">放棄領導 (聲望 +1)</button>` : "";
    showPage('task-step2');
}

function resolveTask() {
    let log = "";
    let misalignedAny = false;
    let d3BuffForTask3 = false; // 任務 3 用
    const rows = document.querySelectorAll('.diagnosis-row');
    const tid = gameData.currentTaskId;

    rows.forEach((row, idx) => {
        const dLevel = gameData.selectedEmployees[idx];
        const correctCount = row.querySelectorAll('.style-btn.correct').length;
        const wrongCount = row.querySelectorAll('.style-btn.wrong').length;
        const ansData = gameData.currentTask.answers['D'+dLevel];
        const totalPlayed = correctCount + wrongCount; // 檢查是否有按按鈕

        // 任務 3 判定：只要有派遣且沒出錯，就標記觸發
        if (tid === 3 && (correctCount >= 1 && wrongCount === 0)) d3BuffForTask3 = true;

        if (totalPlayed === 0) {
            // --- 情況 A：有選員工但沒點任何卡片 (視為失誤) ---
            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:#666; font-weight:bold;'>未派遣出牌</span><br>
                        ➔ 未偵測到管理行動，本回合無產出，<b style='color:var(--danger);'></b><br>
                    </div>`;
            misalignedAny = true;
        } else if (wrongCount > 0) {
            // --- 情況 B：嚴重錯位 (點到紅色) ---
            let penalty = 1; 
            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--danger); font-weight:bold;'>嚴重錯位</span><br>
                        ➔ 無產出，<b style='color:var(--danger);'>主管聲望 -${penalty}</b><br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>應採取的正確行為：</b>${ansData[2]}</p>
                    </div>`;
            misalignedAny = true;
        } else if (correctCount === 2) {
            // --- 情況 C：完美匹配 (雙卡皆綠) ---
            let rep = (tid === 2) ? 2 : 1;
            let dice = "d6 骰子一顆";
            if (tid === 4) dice = "投擲步數 + 2 步";

            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--success); font-weight:bold;'>完美匹配</span><br>
                        ➔ 獲得 ${dice}，<b style='color:var(--success);'>主管聲望 +${rep}</b><br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>管理行為舉例：</b>${ansData[2]}</p>
                    </div>`;
        } else if (correctCount === 1) {
            // --- 情況 D：半對保底 (單卡正確) ---
            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--warning); font-weight:bold;'>半對保底</span><br>
                        ➔ 獲得 d3 骰子一顆<br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>正確管理行為舉例：</b>${ansData[2]}</p>
                    </div>`;
        }
    });

    // === 全局效果提示區 ===
    if (tid === 1 && gameData.selectedEmployees.length > 1) {
        log += `<p style='color:var(--primary); font-weight:bold;'>✨ 任務加成：多名員工管理，聲望額外 +1 點。</p>`;
    }
    if (tid === 3 && d3BuffForTask3) {
        log += `<p style='color:var(--primary); font-weight:bold; border-top:1px solid #eee; padding-top:10px;'>🎲 任務紅利：本回合您總計額外領取 1 顆 d3 骰子。</p>`;
    }
    if (tid === 6) {
        log += `<p style='color:var(--primary); font-weight:bold;'>🎁 任務效果：每位玩家請領取 1 張管理祕訣卡。</p>`;
    }

    openModal("結算結果報告", log, () => nextRound());
}

// ==========================================
// 5. 行政挑戰判定 (紅綠框單選改選)
// ==========================================
function loadAdmin(id) {
    gameData.currentAdmin = ADMINS[id];
    document.getElementById('admin-content').innerHTML = `<h2>行政挑戰 ${id}</h2><div class="buff-box" style="background:#f0f7ff; border-left-color:var(--primary); color:#000;"><strong>任務：</strong>${gameData.currentAdmin.name}</div>`;
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
    res.innerHTML = `<div style="font-weight:bold; font-size:1.2rem; color:${guess === correctD ? 'var(--success)' : 'var(--danger)'}">${guess === correctD ? '🎯 診斷正確！聲望 +2' : '❌ 診斷有誤'}</div><div style="background:#fff; padding:15px; border-radius:10px; border:1px solid #ddd; font-size:0.95rem; margin-top:10px; text-align:left;"><b>管理行為舉例：</b>${gameData.currentAdmin.ex}</div>`;
}

// ==========================================
// 6. 通用控制與計數
// ==========================================
function nextRound(skip = false, task7 = false) {
    gameData.taskCount++;
    document.getElementById('round-number').innerText = gameData.taskCount;
    if (task7) {
        openModal("✨ 任務特效結算", "您選擇不派遣員工。年度進度已推進，請聲望直接 +1 點。");
    } else if (skip) {
        // 修正：移除聲望 +1，僅保留管理祕訣卡紅利
        openModal("🧘 管理沉澱期", "本回合無人可派。獲得團隊自動運轉紅利：<br><br><b style='color:var(--primary); font-size:1.1rem;'>● 獲得 1 張免費管理祕訣卡</b>");
    }

    if (gameData.taskCount > 0 && gameData.taskCount % 3 === 0) {
        setTimeout(() => openModal("🌊 組織活水", "強制換血時間到！請全場玩家更換一名員工卡。"), 500);
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

// 初始化按鈕
window.onload = () => {
    const tg = document.getElementById('task-grid');
    for(let i=1; i<=10; i++) tg.innerHTML += `<button class="num-btn" onclick="loadTask(${i})">${i}</button>`;
    const ag = document.getElementById('admin-grid');
    for(let i=1; i<=10; i++) ag.innerHTML += `<button class="num-btn" onclick="loadAdmin(${i})">${i}</button>`;
};