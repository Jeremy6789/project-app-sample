const TASKS = {
    1: { name: "核心 Bug 緊急修補", env: "⚠️ 緊急搶修：完美匹配者，額外拿 1 顆 d3", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    2: { name: "新開發框架評估", env: "🌟 創新加成：對 D1/D2 達成匹配，聲望 +2", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    3: { name: "舊有代碼大掃除", env: "🚫 品質問責：禁止使用 S4 授權", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S1" } }, // S4 改為失誤
    4: { name: "第三方 API 串接", env: "🔗 技術串接：S3 匹配成功者步數 +2", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    5: { name: "App 啟動速度優化", env: "⏳ 核心倦怠：D4 產出之指定骰點數 -1", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    6: { name: "資料庫搬遷雲端", env: "✅ 穩健遷移：若本輪無失誤，聲望額外 +1", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    7: { name: "安全性滲透測試", env: "🧧 行政紅利：行政挑戰格獎勵變為 +4 聲望", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    8: { name: "自動化測試建置", env: "🎁 工具補助：完美匹配者，免費抽一張祕訣卡", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    9: { name: "高併發架構設計", env: "🔥 流量噴發：完美匹配之產出步數 x2", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } },
    10: { name: "新技術原型 PoC", env: "💀 嚴厲試錯：失誤達 2 個以上，聲望 -3", answers: { D1:"S1", D2:"S2", D3:"S3", D4:"S4" } }
};

const ADMINS = {
    "A01": "高指令 / 低支持", "A02": "高指令 / 高支持", "A03": "低指令 / 高支持", "A04": "低指令 / 低支持"
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + pageId).style.display = 'block';
}

function lookupTask() {
    const id = document.getElementById('task-id').value;
    const task = TASKS[id];
    if (!task) return alert("請輸入正確編號 (1-10)");

    const res = document.getElementById('task-result');
    res.style.display = 'block';
    res.innerHTML = `
        <div class="env-tag">${task.env}</div>
        <h3>任務：${task.name}</h3>
        <div class="answer-table">
            <div class="ans-row"><span>👤 D1 員工</span> ➔ <span class="badge s1">S1 指導</span> ➔ 🎲 1d3</div>
            <div class="ans-row"><span>👤 D2 員工</span> ➔ <span class="badge s2">S2 教練</span> ➔ 🎲 1d3</div>
            <div class="ans-row"><span>👤 D3 員工</span> ➔ <span class="badge s3">S3 支持</span> ➔ 🎲 1d3</div>
            <div class="ans-row"><span>👤 D4 員工</span> ➔ <span class="badge s4">S4 授權</span> ➔ 🌟 指定骰</div>
        </div>
        <p class="hint">* 以上為完美匹配解答，若僅「半對」則一律拿 1 顆 d3。</p>
    `;
}

function lookupAdmin() {
    const id = document.getElementById('admin-id').value.toUpperCase();
    const ans = ADMINS[id] || "查無此代碼，請確認卡片。";
    const res = document.getElementById('admin-result');
    res.style.display = 'block';
    res.innerHTML = `<h3>行政格解答</h3><p class="big-ans">${ans}</p><p>答對請手動增加 2 點聲望！</p>`;
}