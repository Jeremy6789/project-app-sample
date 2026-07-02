// ==========================================
// 1. 代碼映射與資料庫
// ==========================================
const TASK_CODES = { "58291": 1, "10473": 2, "72945": 3, "31628": 4, "94052": 5, "48137": 6, "25760": 7, "63914": 8, "82405": 9, "17539": 10 };
const ADMIN_CODES = { "88214": 1, "30592": 2, "41763": 3, "94401": 4, "15638": 5, "74025": 6, "62917": 7, "20384": 8, "53176": 9, "49820": 10 };

const TASKS = {
    1: { name: "核心 Bug 緊急修補", buff: "若本局管理多名員工，額外獲得聲望 +1 點。", 
        answers: { 
            D1:["高指令","低支持","提供精確的 Debug 步驟，要求他檢查特定區塊的代碼，不需討論。"], 
            D2:["高指令","高支持","解釋系統掛掉的原因，指導他如何追蹤 Log，並在他因壓力大而焦慮時給予支持。"], 
            D3:["低指令","高支持","他在技術上沒問題但怕改壞系統。主管要傾聽他的方案，給予他信心並替他的決策背書。"], 
            D4:["低指令","低支持","告知當機範圍，由他全權負責修復計畫。主管不介入技術細節。"] 
        } 
    },
    2: { name: "新框架導入評估", buff: "聲望加成：達成『完美匹配』改為獲得聲望 +2 點。", 
        answers: { 
            D1:["高指令","低支持","指定他去測驗特定的 3 個 API，規定回報格式，要求他只針對技術參數做紀錄。"], 
            D2:["高指令","高支持","解釋換框架的長遠意義，討論研究路徑，避免他因技術太深而放棄。"], 
            D3:["低指令","高支持","支持他進行各種效能壓力測試，主管扮演技術諮詢者，對其結果給予肯定。"], 
            D4:["低指令","低支持","授權他擔任技術負責人，由他決定是否採購相關授權，主管完全相信其專業判斷。"] 
        } 
    },
    3: { name: "代碼屎山大掃除", buff: "達成『半對』或『完美匹配』，皆可加領 1 顆 d6 骰子。", 
        answers: { 
            D1:["高指令","低支持","規定代碼風格規範，指定他只能修改最表層、不涉及邏輯的變數命名。"], 
            D2:["高指令","高支持","帶著他看哪些代碼寫得太爛，解釋重構好處，引導他學習如何優化結構。"], 
            D3:["低指令","高支持","由他主導重構路徑，主管負責提供心理後盾，在他怕不小心改壞系統時給予支持。"], 
            D4:["低指令","低支持","授權他設計整體的架構優化方向，主管只需看最終效能提升的報告。"] 
        } 
    },
    4: { name: "第三方 API 串接", buff: "若達成『完美匹配』，指定步數擴大為 1~8 步。", 
        answers: { 
            D1:["高指令","低支持","提供 API 文件與調用範例，要求他按照特定的路徑進行連線測試。"], 
            D2:["高指令","高支持","示範如何處理網路延遲與錯誤回報，解釋串接邏輯，並在他失敗時給予高度耐心。"], 
            D3:["低指令","高支持","讓他決定串接的架構，主管扮演顧問角色，在他對安全性顧慮時提供信心支持。"], 
            D4:["低指令","低支持","交由他獨立與外部協力廠商對接，主管不介入過程，僅驗收最終整合成果。"] 
        } 
    },
    5: { name: "啟動速度優化", buff: "達成『完美匹配』無法獲得指定骰，改為領取一顆 d6。", 
        answers: { 
            D1:["高指令","低支持","給予明確的測試環境設定，要求他回報各個頁面的加載秒數。"], 
            D2:["高指令","高支持","教導他如何使用監控工具，解釋效能低下的原因，並在他感到挫折時給予正向鼓勵。"], 
            D3:["低指令","高支持","支持他嘗試新的緩存策略，主管負責背書決策，增強他處理技術難題的勇氣。"], 
            D4:["低指令","低支持","完全授權由他進行效能大手術，主管只需在必要時確認資源是否充足。"] 
        } 
    },
    6: { name: "資料庫搬遷雲端", buff: "結算後，每位玩家可從銀行免費獲得 1 張管理祕訣卡。", 
        answers: { 
            D1:["高指令","低支持","給予搬遷確認清單，規定每搬移一個資料夾都要截圖回報。"], 
            D2:["高指令","高支持","說明遷移失敗後的預防方法，帶著他做壓力測試，在繁瑣工作中給予肯定。"], 
            D3:["低指令","高支持","詢問其對資料備援的看法，協助排除跨部門的權限障礙。"], 
            D4:["低指令","低支持","委託其主導整體的搬遷策略與時程，主管不干預清理過程。"] 
        } 
    },
    7: { name: "資安滲透測試", buff: "特別效果：可放棄本次領導，聲望直接 +1 點。", 
        canSkip: true,
        answers: { 
            D1:["高指令","低支持","指定使用特定的資安掃描工具，並要求他記錄工具回報的所有紅燈項目。"], 
            D2:["高指令","高支持","解釋駭客攻擊原理，帶著他修復一個漏洞，並在他覺得技術太深時給予指導。"], 
            D3:["低指令","高支持","讓其規劃資安防護體系，肯定其謹慎態度，減少他怕漏掉漏洞的擔憂。"], 
            D4:["低指令","低支持","授權其擔任負責人，全權負責系統加固工作，主管僅聽取最終風險評估。"] 
        } 
    },
    8: { name: "自動化測試建置", buff: "達成『半對』或『完美匹配』均可領指定骰 (1~6步)。", 
        answers: { 
            D1:["高指令","低支持","幫他定好自動化測試的撰寫框架，叫他先寫 5 個最基礎的 UI 測試腳本。"], 
            D2:["高指令","高支持","引導他克服對新技術腳本的排斥，跟他討論自動化如何減輕他的負擔。"], 
            D3:["低指令","高支持","讓他設計測試案例，主管扮演聽眾給予肯定，增加他在會議展示成果的信心。"], 
            D4:["低指令","低支持","交給他全權負責建立整個 CI/CD 流程，主管驗收自動化覆蓋率即可。"] 
        } 
    },
    9: { name: "高併發架構設計", buff: "結算後，請額外從牌庫抽取 1 張維度卡。", 
        answers: { 
            D1:["高指令","低支持","直接指定他負責負載平衡的參數設定，不准隨意改動代碼。"], 
            D2:["高指令","高支持","與其共同梳理流量尖峰出錯原因，解釋分散式架構的觀念，並給予支持。"], 
            D3:["低指令","高支持","由其主導解決方案，主管負責支持其決策，並在他不安時給予背書。"], 
            D4:["低指令","低支持","由其擔任專案總召集人，主管僅作為聽取最終架構規劃。"] 
        } 
    },
    10: { name: "新技術原型 PoC", buff: "結算後，請將手上的 2 張維度卡交換給左邊玩家。", 
        answers: { 
            D1:["高指令","低支持","指定安裝開發套件，並要求他按照官網範例跑出一個基礎測試專案。"], 
            D2:["高指令","高支持","帶著他克服環境建置的困難，解釋新技術市場潛力，遇到困難給予具體指導。"], 
            D3:["低指令","高支持","讓他決定實驗方向，主管扮演資源提供者，肯定其在嘗試創新中的每一小步。"], 
            D4:["低指令","低支持","全權委託其主導新技術的 PoC 計畫，主管只看最後該技術是否值得投入。"] 
        } 
    }
};

const ADMINS = {
    1: { name: "年度軟體授權清查", d: "D4", ans: "低指令 / 低支持", ex: "「我信任你的專業，細節你定，週一再給我結果即可。」" },
    2: { name: "報帳系統測試", d: "D1", ans: "高指令 / 低支持", ex: "「照這份清單測一遍，下午三點前截圖回報給我。」" },
    3: { name: "慶功宴餐廳規劃", d: "D3", ans: "低指令 / 高支持", ex: "「這兩家選得很好！我支持你的眼光，放心訂位。」" },
    4: { name: "技術 Wiki 重整", d: "D2", ans: "高指令 / 高支持", ex: "「我先帶你整理一次邏輯，我們先做完這一區。」" },
    5: { name: "新人設備領取", d: "D1", ans: "高指令 / 低支持", ex: "「拿這張清單帶新人領設備並逐項勾選，完成後交回給我。」" },
    6: { name: "季度績效考核", d: "D3", ans: "低指令 / 高支持", ex: "「挑戰高標看看，別擔心達不到，我會是最強的資源後盾。」" },
    7: { name: "辦公室座位搬遷", d: "D4", ans: "低指令 / 低支持", ex: "「安排很周全！週一入座後再跟我簡單更新配置狀況即可。」" },
    8: { name: "加班費新制諮詢", d: "D2", ans: "高指令 / 高支持", ex: "「我劃好重點了，你先試著回覆，遇到困難再轉給我處理。」" },
    9: { name: "部門週報彙整", d: "D3", ans: "低指令 / 高支持", ex: "「文筆非常精準，直接發出去就可以了。你寫得很好！」" },
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
// 3. 掃描與代碼判定 (移除 qrbox 以拿掉輔助框)
// ==========================================
function startFlow(type) {
    gameData.scannerType = type;
    const readerId = type === 'task' ? 'task-reader' : 'admin-reader';
    showPage(type + '-select');

    if (gameData.scanner) gameData.scanner.clear();
    gameData.scanner = new Html5Qrcode(readerId);
    
    // 修正點：移除 qrbox 屬性，這樣就不會出現中間的方框與半透明遮罩
    const config = { fps: 10 }; 

    gameData.scanner.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
            gameData.scanner.stop().then(() => {
                handleUniversalInput(decodedText);
            });
        },
        () => {} // 忽略失敗報錯
    ).catch(err => console.error("相機啟動失敗"));
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
        if (id) loadTask(id); else alert("任務代碼無效");
    } else {
        const id = ADMIN_CODES[code];
        if (id) loadAdmin(id); else alert("行政代碼無效");
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
    if (id === 7) step1Extra.innerHTML = `<button class="ghost-btn" style="border-color:var(--primary); color:var(--primary); border-style:solid; border-width:2px;" onclick="nextRound(false, true)">放棄領導 (任務 7 放棄紅利：聲望 +1)</button>`;
    else step1Extra.innerHTML = "";

    showPage('task-step1');
}

function toggleStyleState(btn) {
    // 狀態循環：default(灰) -> correct(綠) -> wrong(紅)
    if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) {
        btn.classList.add('correct');
    } else if (btn.classList.contains('correct')) {
        btn.classList.remove('correct');
        btn.classList.add('wrong');
    } else {
        btn.classList.remove('wrong');
    }
}

function goToTaskStep2() {
    gameData.selectedEmployees = [];
    [1,2,3,4].forEach(d => {
        if(document.getElementById(`select-d${d}`).classList.contains('active')) gameData.selectedEmployees.push(d);
    });
    if(gameData.selectedEmployees.length === 0) return alert("請至少選擇一位員工");

    const grid = document.getElementById('diagnosis-grid');
    grid.innerHTML = "";
    gameData.selectedEmployees.forEach(d => {
        const ans = gameData.currentTask.answers['D'+d];
        grid.innerHTML += `
            <div class="diagnosis-row">
                <span class="d-label">對 D${d} 員工 (解答應為 S${d})：</span>
                <div class="btn-group">
                    <button class="style-btn" onclick="toggleStyleState(this)">[${ans[0]}] 卡</button>
                    <button class="style-btn" onclick="toggleStyleState(this)">[${ans[1]}] 卡</button>
                </div>
            </div>`;
    });

    const step2Extra = document.getElementById('step2-extra-action');
    step2Extra.innerHTML = (gameData.currentTaskId === 7) ? `<button class="confirm-btn" style="color:#fff; background:var(--primary);" onclick="nextRound(false, true)">放棄領導 (聲望 +1)</button>` : "";
    showPage('task-step2');
}

function resolveTask() {
    let log = "";
    let d6BuffTriggered = false; // 任務 3 用
    const rows = document.querySelectorAll('.diagnosis-row');
    const tid = gameData.currentTaskId;

    rows.forEach((row, idx) => {
        const dLevel = gameData.selectedEmployees[idx];
        const correctCount = row.querySelectorAll('.style-btn.correct').length;
        const wrongCount = row.querySelectorAll('.style-btn.wrong').length;
        
        const ansData = gameData.currentTask.answers['D'+dLevel];
        const exampleText = ansData[2];

        // 任務 3 判定：只要有派遣且沒出錯，就標記觸發
        if (tid === 3 && (correctCount >= 1 && wrongCount === 0)) d6BuffTriggered = true;

        if (wrongCount > 0) {
            // --- 嚴重錯位結果 (每人扣 1 聲望) ---
            let penalty = (tid === 10) ? 3 : 1; // 任務 10 的嚴厲問責
            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--danger); font-weight:bold;'>嚴重錯位</span><br>
                        ➔ 無產出，<b style='color:var(--danger);'>主管聲望 -${penalty}</b><br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>應採取的正確行為：</b>${exampleText}</p>
                    </div>`;
        } else if (correctCount === 2) {
            // --- 完美匹配結果 (+1 聲望) ---
            let rep = (tid === 2) ? 2 : 1;
            let dice = "指定骰 (1-6步)";
            if (tid === 4) dice = "指定骰 (1-8步)";
            if (tid === 5) dice = "d6 骰子 (無指定骰)";
            if (tid === 9) dice = "指定骰 (步數直接 x2)";

            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--success); font-weight:bold;'>完美匹配</span><br>
                        ➔ 獲得 ${dice}，<b style='color:var(--success);'>主管聲望 +${rep}</b><br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>管理行為舉例：</b>${exampleText}</p>
                    </div>`;
        } else if (correctCount === 1) {
            // --- 半對保底結果 (聲望不變) ---
            let dice = "d3 骰子一顆";
            if (tid === 8) dice = "指定骰 (1-6步)";

            log += `<div class='result-item' style='margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;'>
                        <strong>D${dLevel} 員工：</strong><span style='color:var(--warning); font-weight:bold;'>半對保底</span><br>
                        ➔ 獲得 ${dice}，聲望不變<br>
                        <p style='font-size:0.85rem; color:#444; margin-top:5px;'><b>正確管理行為舉例：</b>${exampleText}</p>
                    </div>`;
        } else {
            // 有選員工但沒按任何按鈕
            log += `<p style='color:#999; font-size:0.8rem;'>D${dLevel} 員工：未記錄到任何行動。</p>`;
        }
    });

    // === 全局獎勵提示 (僅剩餘加分與資源提醒) ===
    
    // 任務 1：多員工管理
    if (tid === 1 && gameData.selectedEmployees.length > 1) {
        log += `<p style='color:var(--primary); font-weight:bold;'>✨ 任務 1 特效：管理多名員工，聲望額外 +1 點。</p>`;
    }

    // 任務 3：額外一顆 d6
    if (tid === 3 && d6BuffTriggered) {
        log += `<p style='color:var(--primary); font-weight:bold; border-top:2px solid #eee; padding-top:10px;'>🎲 任務 3 紅利：本回合您總計額外領取 1 顆 d6 骰子。</p>`;
    }

    // 提醒資源變動
    if (tid === 6) log += `<p style='color:var(--primary);'>🎁 提醒：每位玩家從銀行領取 1 張管理祕訣卡。</p>`;
    if (tid === 9) log += `<p style='color:var(--primary);'>🃏 提醒：每位玩家額外抽 1 張維度卡。</p>`;
    if (tid === 10) log += `<p style='color:var(--primary);'>🔄 提醒：請將手上 2 張維度卡換給左邊玩家。</p>`;

    openModal("結算結果報告", log, () => nextRound());
}

// ==========================================
// 5. 行政挑戰
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
    res.innerHTML = `
        <div style="font-weight:bold; font-size:1.2rem; color:${guess === correctD ? 'var(--success)' : 'var(--danger)'}">
            ${guess === correctD ? '🎯 診斷正確！聲望 +2' : '❌ 診斷有誤'}
        </div>
        <p>解答：這名員工屬於 <strong>${correctD}</strong> (${gameData.currentAdmin.ans})</p>
        <div style="background:#fff; padding:15px; border-radius:10px; border:1px solid #ddd; font-size:0.95rem;">
            <b>管理行為舉例：</b>${gameData.currentAdmin.ex}
        </div>`;
}

// ==========================================
// 6. 通用計數與提醒
// ==========================================
function nextRound(skip = false, task7 = false) {
    gameData.taskCount++;
    document.getElementById('round-number').innerText = gameData.taskCount;
    if (task7) openModal("✨ 任務特效結算", "您選擇不派遣員工。年度進度已推進，聲望直接 +1 點。");
    else if (skip) openModal("🧘 管理沉澱期", "本回合無人可派。獲得團隊自動運轉紅利：<br><br><b style='color:var(--primary); font-size:1.1rem;'>● 主管聲望 +1<br>● 獲得 1 張管理祕訣卡</b>");

    if (gameData.taskCount > 0 && gameData.taskCount % 3 === 0) {
        setTimeout(() => openModal("🌊 組織活水", "<span style='color:var(--danger); font-weight:bold;'>強制換血時間到！</span><br>請全場玩家捨棄一張員工卡，並從員工牌庫拿取一張目前未擁有的顏色卡牌。"), 500);
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