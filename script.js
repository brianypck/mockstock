// Firebase 配置 (請替換為你自己的 Firebase 專案配置)
const firebaseConfig = {
    apiKey: "AIzaSyBna5PwceZCpEIIDWxfzPymZjXwXYlO6A", // 請替換為你的 Firebase API Key
    authDomain: "mockstock-9600b.firebaseapp.com",
    projectId: "mockstock-9600b",
    storageBucket: "mockstock-9600b.firebase-storage.app",
    messagingSenderId: "59549037559",
    appId: "1:59549037559:web:da8238b998d0119214f4f2",
    databaseURL: "https://mockstock-9600b-default-rtdb.firebaseio.com/"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const scoresRef = database.ref('scores');

// 股票資料 - 包含每個股票的基礎資訊
const allStocks = [
    { id: '0050', name: '元大台灣50', desc: '追蹤台灣市值前50大公司，分散風險', category: 'ETF', volatility: '低' },
    { id: '2330', name: '台積電', desc: '全球晶圓代工龍頭，護國神山', category: '科技股', volatility: '中' },
    { id: '2603', name: '長榮', desc: '全球貨櫃航運巨頭，受國際貿易影響大', category: '航運股', volatility: '高' },
    { id: '2454', name: '聯發科', desc: '手機晶片設計領導者，近年成長快速', category: '科技股', volatility: '中' },
    { id: '2881', name: '富邦金', desc: '台灣大型金控公司，提供多元金融服務', category: '金融股', volatility: '低' },
    { id: '1301', name: '台塑', desc: '台灣石化工業龍頭，產業鏈完整', category: '塑化股', volatility: '中' },
    { id: '2303', name: '聯電', desc: '全球第二大晶圓代工廠，成熟製程為主', category: '科技股', volatility: '中' },
    { id: '0056', name: '元大高股息', desc: '追蹤高殖利率股票，適合長期存股', category: 'ETF', volatility: '低' },
    { id: '3008', name: '大立光', desc: '光學鏡頭領導廠商，蘋果供應鏈之一', category: '科技股', volatility: '高' },
    { id: '2207', name: '和泰車', desc: '台灣汽車銷售龍頭，代理豐田、凌志等品牌', category: '汽車股', volatility: '中' }
];

// 各情境下的股票預期報酬率 (百分比)
// 範圍表示 [最小值, 最大值]
const marketEvents = {
    'techBoom': { // 科技股爆發
        description: '全球科技創新加速，人工智慧、5G應用普及，科技巨頭獲利飆升。',
        returns: {
            '0050': [12, 25], '2330': [30, 60], '2603': [-5, 10], '2454': [35, 65],
            '2881': [5, 15], '1301': [0, 10], '2303': [20, 40], '0056': [10, 20],
            '3008': [25, 50], '2207': [8, 18]
        }
    },
    'globalRecession': { // 全球經濟衰退
        description: '受地緣政治緊張及通膨影響，全球經濟陷入衰退，消費者信心低迷。',
        returns: {
            '0050': [-10, 0], '2330': [-15, 5], '2603': [-20, -5], '2454': [-25, 0],
            '2881': [0, 8], '1301': [-10, 5], '2303': [-15, 0], '0056': [-5, 5],
            '3008': [-20, -5], '2207': [-10, 0]
        }
    },
    'commodityBoom': { // 原物料大多頭
        description: '能源及大宗商品需求激增，供給受限，原物料價格飆漲。',
        returns: {
            '0050': [5, 15], '2330': [0, 10], '2603': [20, 40], '2454': [5, 15],
            '2881': [8, 18], '1301': [15, 30], '2303': [0, 10], '0056': [7, 15],
            '3008': [0, 10], '2207': [10, 20]
        }
    },
    'financialCrisis': { // 金融危機
        description: '房地產泡沫破裂，銀行業危機蔓延，全球金融市場動盪。',
        returns: {
            '0050': [-20, -10], '2330': [-10, 0], '2603': [-15, -5], '2454': [-10, 5],
            '2881': [-25, -10], '1301': [-10, 0], '2303': [-10, 0], '0056': [-15, -5],
            '3008': [-10, 0], '2207': [-10, 0]
        }
    },
    'postPandemicRecovery': { // 疫情後復甦
        description: '全球從疫情中復甦，消費需求反彈，供應鏈逐步恢復。',
        returns: {
            '0050': [10, 20], '2330': [15, 30], '2603': [5, 20], '2454': [10, 25],
            '2881': [8, 18], '1301': [5, 15], '2303': [10, 20], '0056': [8, 18],
            '3008': [10, 25], '2207': [12, 22]
        }
    },
    'interestRateHike': { // 快速升息循環
        description: '央行為抑制通膨而大幅升息，資金成本上升，股市承壓。',
        returns: {
            '0050': [-8, 2], '2330': [-10, 5], '2603': [5, 15], '2454': [-15, 0],
            '2881': [10, 25], '1301': [0, 10], '2303': [-5, 5], '0056': [-5, 5],
            '3008': [-10, 5], '2207': [-5, 5]
        }
    },
    'aiRevolution': { // AI 革命
        description: '人工智慧技術取得突破性進展，引領新一輪科技產業浪潮。',
        returns: {
            '0050': [15, 30], '2330': [40, 80], '2603': [-5, 5], '2454': [50, 90],
            '2881': [5, 15], '1301': [0, 10], '2303': [25, 50], '0056': [10, 20],
            '3008': [30, 60], '2207': [5, 15]
        }
    },
    'supplyChainDisruption': { // 供應鏈中斷
        description: '地緣政治衝突或自然災害導致全球供應鏈嚴重受阻，影響製造業。',
        returns: {
            '0050': [-5, 5], '2330': [-10, 0], '2603': [10, 30], '2454': [-10, 0],
            '2881': [0, 10], '1301': [5, 20], '2303': [-5, 5], '0056': [0, 10],
            '3008': [-10, 0], '2207': [-5, 10]
        }
    }
};

// DOM 元素變數
let startGameBtn, gameStartSection, gameSection, modeBtns, selectionHint;
let currentYearTitle, currentCapitalDisplay, stockListContainer, selectedCountDisplay, selectedStocksUl, confirmSelectionBtn; 
let resultsSection, returnRateDisplay, riskLevelDisplay, diversificationLevelDisplay, analyzeBtn, nextYearBtn, resultsTitle;
let singleYearStockPerformanceUl;
let analysisSection, localAnalysisDisplay, backToResultsBtn, analysisTitle;
let leaderboardSection, leaderboardList, restartGameBtn, backToHomeBtn;
let challengeEndSection, finalCumulativeReturnDisplay, submitFinalScoreBtn, playerNameInput;
let cumulativeCapitalChartCanvas, cumulativeCapitalChart;


// 遊戲狀態變數
let selectedStocks = [];
let finalReturnRate = 0; // 當前情境的報酬率 (字符串)
let numericFinalReturnRate = 0; // 當前情境的報酬率 (數字)
let selectedMode = 'five-year'; // **預設為五年挑戰**
let currentMarketEvent = null; // 當前隨機選擇的市場事件

// 五年挑戰相關變數
const totalChallengeYears = 5; // 連續挑戰的總年數
let currentChallengeYearIndex = 0; // 當前進行到第幾年 (0-indexed)
let cumulativeReturnRate = 0; // 連續挑戰模式下的累計總報酬率
let allYearsInvestmentRecords = []; // 儲存每年的投資記錄和結果，用於總體分析，現在將包含每年的資產總額
let availableMarketEventKeys = []; // 可用於本輪挑戰的市場事件鍵值列表
let isViewingTotalAnalysis = false; // 追蹤是否正在檢視總體分析 (True for total analysis, False for single year analysis)

// 玩家資金變數
const initialCapital = 1000000; // 每個玩家的初始資金為 100 萬元
let currentCapital = initialCapital; // 當前累計的資金
let gameEnded = false; // 標記遊戲是否已結束
let scoreSubmitted = false; // 標記分數是否已提交，防止重複提交


// 隨機選擇一個市場事件 (現在會排除已出現過的事件)
function getRandomMarketEvent() {
    // 如果可用事件列表為空，則重新填充（確保在五年挑戰中總是有足夠的事件）
    if (availableMarketEventKeys.length === 0) {
        availableMarketEventKeys = Object.keys(marketEvents);
        // 如果總事件數少於挑戰年數，則可能會有重複，但這是為了確保遊戲能繼續
        if (availableMarketEventKeys.length < totalChallengeYears) {
            console.warn("警告：市場情境數量少於挑戰年數，部分情境將會重複。");
        }
    }

    const randomIndex = Math.floor(Math.random() * availableMarketEventKeys.length);
    const selectedEventKey = availableMarketEventKeys[randomIndex];

    // 從可用列表中移除已選事件，確保不重複
    availableMarketEventKeys.splice(randomIndex, 1);

    return {
        key: selectedEventKey,
        data: marketEvents[selectedEventKey]
    };
}


// 在 DOMContentLoaded 事件中初始化所有 DOM 元素和事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有 DOM 元素
    startGameBtn = document.getElementById('start-game-btn');
    gameStartSection = document.getElementById('game-start-section');
    gameSection = document.getElementById('game-section');
    modeBtns = document.querySelectorAll('.mode-btn');
    selectionHint = document.querySelector('.selection-hint');
    currentYearTitle = document.getElementById('current-year-title');
    currentCapitalDisplay = document.getElementById('current-capital-display'); // **獲取新增的 DOM 元素**

    stockListContainer = document.getElementById('stock-list');
    selectedCountDisplay = document.getElementById('selected-count');
    selectedStocksUl = document.getElementById('selected-stocks-ul');
    confirmSelectionBtn = document.getElementById('confirm-selection-btn');

    resultsSection = document.getElementById('results-section');
    returnRateDisplay = document.getElementById('return-rate');
    riskLevelDisplay = document.getElementById('risk-level');
    diversificationLevelDisplay = document.getElementById('diversification-level');
    analyzeBtn = document.getElementById('analyze-btn');
    nextYearBtn = document.getElementById('next-year-btn');
    resultsTitle = document.getElementById('results-title');
    singleYearStockPerformanceUl = document.getElementById('single-year-stock-performance');

    challengeEndSection = document.getElementById('challenge-end-section');
    finalCumulativeReturnDisplay = document.getElementById('final-cumulative-return');
    submitFinalScoreBtn = document.getElementById('submit-final-score-btn');
    playerNameInput = document.getElementById('player-name-input');
    cumulativeCapitalChartCanvas = document.getElementById('cumulative-capital-chart');


    analysisSection = document.getElementById('analysis-section');
    localAnalysisDisplay = document.getElementById('local-analysis');
    backToResultsBtn = document.getElementById('back-to-results-btn');
    analysisTitle = document.getElementById('analysisTitle');

    leaderboardSection = document.getElementById('leaderboard-section');
    leaderboardList = document.getElementById('leaderboard-list');
    restartGameBtn = document.getElementById('restart-game-btn');
    backToHomeBtn = document.getElementById('back-to-home-btn');


    // 遊戲狀態初始化
    function resetGame() {
        selectedStocks = [];
        finalReturnRate = 0;
        numericFinalReturnRate = 0;
        cumulativeReturnRate = 0;
        allYearsInvestmentRecords = [];
        currentChallengeYearIndex = 0;
        currentMarketEvent = null;
        availableMarketEventKeys = Object.keys(marketEvents); // 重置可用市場事件
        currentCapital = initialCapital;
        isViewingTotalAnalysis = false;
        gameEnded = false;
        scoreSubmitted = false;
        
        // 重置圖表
        if (cumulativeCapitalChart) {
            cumulativeCapitalChart.destroy();
            cumulativeCapitalChart = null;
        }

        // 重新啟用提交按鈕和清空輸入框
        if (submitFinalScoreBtn) {
            submitFinalScoreBtn.disabled = false;
        }
        if (playerNameInput) {
            playerNameInput.value = '';
        }

        selectedMode = 'five-year';

        selectedCountDisplay.textContent = '0';
        selectedStocksUl.innerHTML = '';
        confirmSelectionBtn.disabled = true;
        stockListContainer.innerHTML = '';
        localAnalysisDisplay.textContent = '載入中...';
        startGameBtn.disabled = false;
        selectionHint.style.display = 'block';
        selectionHint.textContent = '歡迎挑戰！您將獲得 100 萬元初始資金，並在每輪挑戰中將累積資金平均投資於您所選的 1-5 檔股票中。請點擊開始挑戰。'; 

        // 更新顯示初始資金
        currentCapitalDisplay.textContent = initialCapital.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }); 

        // 確保五年挑戰按鈕是選中狀態
        modeBtns.forEach(btn => {
            if (btn.dataset.mode === 'five-year') {
                btn.classList.add('selected-mode');
            } else {
                btn.classList.remove('selected-mode');
            }
        });


        // 隱藏所有遊戲階段，只顯示開始區塊
        gameStartSection.classList.remove('hidden');
        gameSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        analysisSection.classList.add('hidden');
        leaderboardSection.classList.add('hidden');
        challengeEndSection.classList.add('hidden');

        // 隱藏結果頁面的多餘按鈕
        nextYearBtn.classList.add('hidden');
        backToResultsBtn.classList.add('hidden');
    }


    // 載入股票列表
    function loadStocks() {
        stockListContainer.innerHTML = '';
        allStocks.forEach(stock => {
            const stockCard = document.createElement('div');
            stockCard.classList.add('stock-card');
            stockCard.dataset.id = stock.id;
            stockCard.innerHTML = `
                <h3>${stock.name} (${stock.id})</h3>
                <p>${stock.desc}</p>
                <div class="stock-tags">
                    <span class="stock-tag category">${stock.category}</span>
                    <span class="stock-tag volatility-${stock.volatility}">${stock.volatility}波動</span>
                </div>
            `;
            stockCard.addEventListener('click', () => toggleStockSelection(stockCard, stock));
            stockListContainer.appendChild(stockCard);
        });
        // 每次載入股票後，將所有卡片設為未選中狀態
        document.querySelectorAll('.stock-card').forEach(card => card.classList.remove('selected'));
    }

    // 切換股票選取狀態
    function toggleStockSelection(card, stock) {
        // 如果遊戲已結束，不允許再選擇股票
        if (gameEnded) return;

        const isSelected = selectedStocks.some(s => s.id === stock.id);

        if (isSelected) {
            selectedStocks = selectedStocks.filter(s => s.id !== stock.id);
            card.classList.remove('selected');
        } else {
            if (selectedStocks.length < 5) { 
                selectedStocks.push(stock);
                card.classList.add('selected');
            } else {
                alert('最多只能選擇 5 檔股票！');
            }
        }
        updateSelectedStocksDisplay();
    }

    // 更新已選股票顯示
    function updateSelectedStocksDisplay() {
        selectedCountDisplay.textContent = selectedStocks.length;
        selectedStocksUl.innerHTML = '';
        selectedStocks.forEach(stock => {
            const li = document.createElement('li');
            li.textContent = `${stock.name} (${stock.id})`;
            selectedStocksUl.appendChild(li);
        });

        // 如果遊戲已結束，確認選股按鈕應該被禁用
        // 只要選了至少 1 檔股票，就可以啟用確認按鈕
        confirmSelectionBtn.disabled = selectedStocks.length === 0 || gameEnded;
    }

    // 模擬報酬計算 (根據選定的市場情境)
    function simulateReturns(stocks, eventKey) {
        let totalReturn = 0;
        let totalVolatilityScore = 0;
        let categorySet = new Set();
        const scenarioReturns = marketEvents[eventKey].returns;
        const individualStockReturns = []; 

        stocks.forEach(stock => {
            let stockReturn = 0;
            const [minReturn, maxReturn] = scenarioReturns[stock.id];
            stockReturn = (Math.random() * (maxReturn - minReturn) + minReturn); // 這裡取百分比

            totalReturn += stockReturn; // 這裡累加的是百分比值
            categorySet.add(stock.category);

            if (stock.volatility === '低') {
                totalVolatilityScore += 1;
            } else if (stock.volatility === '中') {
                totalVolatilityScore += 3;
            } else { // '高'
                totalVolatilityScore += 5;
            }
            individualStockReturns.push({
                id: stock.id,
                name: stock.name,
                return: stockReturn.toFixed(2) // 儲存為字串，兩位小數
            });
        });

        // 報酬率基於所選股票數量平均計算
        const averageReturn = totalReturn / stocks.length;
        const currentScenarioReturnRate = averageReturn; 
        finalReturnRate = currentScenarioReturnRate.toFixed(2);
        numericFinalReturnRate = currentScenarioReturnRate;

        // 計算當年的絕對金額變化
        // 這裡的邏輯是，每年的報酬率是基於「上一年的總資產」計算
        const yearCapitalChange = currentCapital * (numericFinalReturnRate / 100);
        currentCapital += yearCapitalChange; // 更新累計資金

        let risk = '';
        const avgVolatilityScore = totalVolatilityScore / stocks.length;
        if (avgVolatilityScore < 2) {
            risk = '低';
        } else if (avgVolatilityScore < 4) {
            risk = '中';
        } else {
            risk = '高';
        }

        let diversification = '';
        if (categorySet.size >= stocks.length && stocks.length >= 4) { // 如果選了 4 檔以上且類別數等於選股數，則非常良好
            diversification = '非常良好';
        } else if (categorySet.size >= Math.ceil(stocks.length * 0.6)) { // 至少 60% 類別分散
            diversification = '良好';
        } else if (categorySet.size >= 2) { // 至少兩種類別
            diversification = '一般';
        } else {
            diversification = '集中';
        }

        return {
            returnRate: finalReturnRate,
            numericReturnRate: numericFinalReturnRate,
            riskLevel: risk,
            diversificationLevel: diversification,
            capitalChange: yearCapitalChange.toFixed(0),
            currentCapital: currentCapital, 
            individualStockReturns: individualStockReturns 
        };
    }

    // 本地生成投資分析 (根據選定的情境和組合)
    function generateLocalAnalysis(stocks, eventKey, isTotalAnalysis = false) {
        let analysisText = '';
        if (isTotalAnalysis) {
            analysisText = '--- 五年挑戰總體分析 ---\n\n';
            // 首先顯示初始資金
            analysisText += `## 初始資金：${initialCapital.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 })} 元\n\n`;

            allYearsInvestmentRecords.forEach((record, index) => {
                const eventDesc = marketEvents[record.eventKey] ? marketEvents[record.eventKey].description : '未知市場情境';
                // 這裡的 record.selectedStocks 已經是物件陣列了
                const selectedStocksNames = record.selectedStocks.map(s => s.name).join('、');

                // 現在 index 0 對應第 1 年的結果，所以直接使用 index + 1
                analysisText += `## 第 ${index + 1} 年情境：${eventDesc}\n`;
                analysisText += `選擇股票：${selectedStocksNames}\n`;
                analysisText += `本年報酬率：${record.returnRate}% (${record.capitalChange} 元)\n`;
                analysisText += `本年結束資產：${record.currentCapital.toFixed(0)} 元\n`;
                analysisText += `風險：${record.riskLevel}\n`;
                analysisText += `分散程度：${record.diversificationLevel}\n\n`;

                // 加入針對單一情境的簡要分析
                const eventSpecificAnalysis = getEventSpecificAnalysis(record.eventKey);
                analysisText += `該年度策略分析：${eventSpecificAnalysis}\n\n`;
            });
            analysisText += `總報酬率：${cumulativeReturnRate.toFixed(2)}% (最終資產：${currentCapital.toFixed(0)} 元)\n\n`;
            analysisText += '--- 挑戰總結 ---\n';
            if (cumulativeReturnRate > 50) {
                analysisText += '恭喜！您的五年投資表現非常出色，累積了可觀的財富，展現了卓越的市場判斷力和資產配置能力！\n';
            } else if (cumulativeReturnRate > 20) {
                analysisText += '表現良好！您的五年投資報酬率不錯，展現了穩健的投資能力。\n';
            } else if (cumulativeReturnRate > 0) {
                analysisText += '您的五年投資取得了正報酬，雖然不多，但也算穩健。未來可以考慮更積極的策略。\n';
            } else {
                analysisText += '您的五年投資報酬率為負，市場挑戰艱鉅。回顧每年的決策，可以從中學習經驗，提升未來的投資判斷。\n';
            }

        } else {
            // 單一情境分析
            const stockNames = stocks.map(s => `${s.name}`).join('、');
            const categories = [...new Set(stocks.map(s => s.category))];
            const volatilities = stocks.map(s => s.volatility);
            const eventDesc = marketEvents[eventKey].description;

            analysisText = `您面臨的市場情境是：**${eventDesc}**\n\n`;
            analysisText += `您的投資組合包含：${stockNames}。`;

            // 根據實際選股數量調整分散性提示
            if (stocks.length === 0) { // 由於已經擋下selectedStocks.length === 0，此處邏輯上不會執行
                analysisText += ` 您本年未選擇任何股票。`; // 這應該不會發生
            } else if (stocks.length === 1) {
                analysisText += ` 您的投資過於集中在單一股票，風險非常高。`;
            } else if (categories.length >= stocks.length && stocks.length >= 4) {
                analysisText += ` 這個組合類股分散性高，有助於降低單一產業波動的風險。`;
            } else if (categories.length >= Math.ceil(stocks.length * 0.6)) {
                analysisText += ` 這個組合類股分散性良好，能在一定程度上抵禦市場風險。`;
            } else if (categories.length >= 2) {
                analysisText += ` 這個組合類股有一定分散性，但仍需留意。`;
            } else {
                analysisText += ` 這個組合類股過於集中在 ${categories[0]} 相關產業，風險較高。`;
            }

            if (volatilities.includes('高') && !volatilities.includes('低')) {
                analysisText += ` 組合中包含較多高波動性股票，可能帶來較高的報酬，但同時也伴隨較大的風險。`;
            } else if (volatilities.includes('低') && !volatilities.includes('高')) {
                analysisText += ` 組合偏向低波動性股票或 ETF，相對穩健，適合保守型投資人。`;
            } else {
                analysisText += ` 您的組合波動性分布相對平均，兼顧成長與穩定。`;
            }

            analysisText += `\n\n${getEventSpecificAnalysis(eventKey)}`;
            analysisText += `\n\n請記住，模擬結果不代表未來實際表現。投資有風險，入市需謹慎。`;
        }
        return analysisText;
    }

    // 取得單一事件的簡要分析
    function getEventSpecificAnalysis(eventKey) {
        let specificAnalysis = '';
        switch (eventKey) {
            case 'techBoom':
                specificAnalysis += `在科技股爆發的情境下，您的組合若能抓住半導體、AI概念股等，將有非常高的潛力。`;
                break;
            case 'globalRecession':
                specificAnalysis += `全球經濟衰退時期，防禦型股票（如公用事業、民生必需品）和ETF可能會相對抗跌，高成長股票則面臨較大挑戰。`;
                break;
            case 'commodityBoom':
                specificAnalysis += `原物料大多頭，能源、塑化、航運等相關類股有望表現強勁。`;
                break;
            case 'financialCrisis':
                specificAnalysis += `金融危機時期市場恐慌，所有股票普遍下跌，風險管理和現金為王至關重要。金融股將首當其衝。`;
                break;
            case 'postPandemicRecovery':
                specificAnalysis += `疫情後復甦階段，消費復甦和供應鏈修復將帶動相關產業，但也可能面臨通膨壓力。`;
                break;
            case 'interestRateHike':
                specificAnalysis += `快速升息對科技股等高估值股票不利，但金融股可能受惠於利差擴大。債券市場也會受到影響。`;
                break;
            case 'aiRevolution':
                specificAnalysis += `AI革命是科技股的重大機遇，特別是AI晶片、伺服器、軟體等相關產業將有爆發性成長。`;
                break;
            case 'supplyChainDisruption':
                specificAnalysis += `供應鏈中斷會衝擊全球製造業，但可能有利於擁有完整本土供應鏈或能轉嫁成本的企業，航運費率也可能再次飆升。`;
                break;
            default:
                specificAnalysis += `這是一個特殊的市場情境。請綜合分析新聞描述和您的持股來判斷。`;
        }
        return specificAnalysis;
    }

    // 繪製總資產變化圖
    function drawCumulativeCapitalChart() {
        if (cumulativeCapitalChart) {
            cumulativeCapitalChart.destroy(); // 銷毀舊圖表以避免重複繪製
        }

        const labels = ['初始資金'];
        const data = [initialCapital]; // 第一個數據點是初始資金

        // 從 allYearsInvestmentRecords 中提取每年的結束資產
        allYearsInvestmentRecords.forEach((record, index) => {
            labels.push(`第 ${index + 1} 年`); // 使用 index + 1 來表示第 N 年
            data.push(record.currentCapital);
        });

        const ctx = cumulativeCapitalChartCanvas.getContext('2d');
        cumulativeCapitalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '總資產 (元)',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // 確保這行是 false
                plugins: {
                    title: {
                        display: true,
                        text: '五年挑戰總資產變化',
                        font: {
                            size: 18
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '挑戰年度'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '資產總額 (元)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('zh-TW', { minimumFractionDigits: 0 }); // 格式化 Y 軸標籤
                            }
                        }
                    }
                }
            }
        });
    }


    // 提交分數到 Firebase (現在只用於五年挑戰結束時的提交)
    function submitScore() {
        // 檢查分數是否已提交
        if (scoreSubmitted) {
            alert('您已經提交過分數了。');
            return; // 阻止重複提交
        }

        // 如果遊戲未結束，不允許提交
        if (!gameEnded) {
            alert('遊戲尚未結束，無法提交分數。');
            return;
        }

        const playerName = playerNameInput.value.trim(); // 從輸入框獲取姓名
        if (playerName) {
            let scoreToSubmit = parseFloat(cumulativeReturnRate.toFixed(2));
            let contextInfo = '五年挑戰';
            // 由於選股數量彈性，直接儲存每年的選股清單會很長。
            // 這裡將所有年份的選股集合起來，去重，並顯示為「總選股組合」
            let allUniqueStocks = new Set();
            allYearsInvestmentRecords.forEach(record => {
                record.selectedStocks.forEach(s => allUniqueStocks.add(`${s.name}(${s.id})`));
            });
            let stocksInfo = Array.from(allUniqueStocks).join('、');
            if (stocksInfo.length > 100) { // 限制長度，避免過長
                stocksInfo = stocksInfo.substring(0, 97) + '...';
            }


            let finalCapitalForLeaderboard = currentCapital.toFixed(0);

            scoresRef.push({
                name: playerName,
                score: scoreToSubmit,
                selectedStocks: stocksInfo, // 這裡可以考慮儲存一個簡化版的選股摘要
                context: contextInfo,
                finalCapital: finalCapitalForLeaderboard,
                timestamp: Date.now()
            }).then(() => {
                alert('成績已提交！');
                loadLeaderboard(); // 確保排行榜資料是最新的
                scoreSubmitted = true; // 設定分數已提交標記
                submitFinalScoreBtn.disabled = true; // 禁用提交按鈕

                // 提交成功後直接導向排行榜
                challengeEndSection.classList.add('hidden');
                analysisSection.classList.add('hidden'); // 確保分析區塊也被隱藏
                leaderboardSection.classList.remove('hidden');

            }).catch(error => {
                console.error("Error writing to Firebase Database", error);
                alert('提交失敗，請稍後再試。將直接導向排行榜。');
                // 提交失敗也導向排行榜
                challengeEndSection.classList.add('hidden');
                analysisSection.classList.add('hidden');
                leaderboardSection.classList.remove('hidden');
                // 在提交失敗後，也重置提交按鈕狀態和標記，以便玩家可以重試
                scoreSubmitted = false;
                if (submitFinalScoreBtn) {
                    submitFinalScoreBtn.disabled = false;
                }
            });
        } else {
            alert('請輸入您的姓名！成績將不會提交，但仍將導向排行榜。');
            // 未輸入姓名也導向排行榜，但不會提交分數
            challengeEndSection.classList.add('hidden');
            analysisSection.classList.add('hidden');
            leaderboardSection.classList.remove('hidden');
        }
    }

    // 載入排行榜 (包含情境資訊和最終資產)
    function loadLeaderboard() {
        leaderboardList.innerHTML = '<li>載入中...</li>';
        scoresRef.orderByChild('score').limitToLast(20).on('value', (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                const scoreData = childSnapshot.val();
                scores.push(scoreData);
            });

            scores.sort((a, b) => b.score - a.score); // 降序排列

            leaderboardList.innerHTML = '';
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<li>目前沒有任何成績。</li>';
            } else {
                scores.forEach((s, index) => {
                    const li = document.createElement('li');
                    // 顯示最終資產，如果沒有則顯示 N/A
                    li.innerHTML = `
                        <span>${index + 1}. ${s.name} (${s.context})</span>
                        <span class="${s.score < 0 ? 'negative' : ''}">${s.score}% (最終資產：${s.finalCapital ? s.finalCapital : 'N/A'} 元)</span>
                        <br><small>總選股：${s.selectedStocks}</small>
                    `;
                    leaderboardList.appendChild(li);
                });
            }
        });
    }

    // --- 事件監聽器 ---

    // 模式選擇按鈕點擊 (現在這個監聽器實際上只會作用於 "五年挑戰" 按鈕，因為它預設被選中)
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 如果遊戲已結束，不允許切換模式
            if (gameEnded) return;

            modeBtns.forEach(b => b.classList.remove('selected-mode'));
            btn.classList.add('selected-mode');
            selectedMode = btn.dataset.mode;
            selectionHint.style.display = 'none';
        });
    });

    // 開始挑戰按鈕
    startGameBtn.addEventListener('click', () => {
        // 如果遊戲已結束，不允許開始新遊戲，除非是從重置按鈕進入
        if (gameEnded) return;

        selectedMode = 'five-year';

        // 重置選股相關狀態
        selectedStocks = [];
        selectedCountDisplay.textContent = '0';
        selectedStocksUl.innerHTML = '';
        confirmSelectionBtn.disabled = true;
        stockListContainer.innerHTML = '';
        localAnalysisDisplay.textContent = '載入中...';


        gameStartSection.classList.add('hidden');
        gameSection.classList.remove('hidden');

        // 直接啟動五年挑戰的第一年
        currentChallengeYearIndex = 0;
        cumulativeReturnRate = 0;
        currentCapital = initialCapital;
        allYearsInvestmentRecords = [];

        availableMarketEventKeys = Object.keys(marketEvents); // 重新初始化可用事件列表
        gameEnded = false;
        scoreSubmitted = false; // 確保新遊戲開始時重置提交標記
        submitFinalScoreBtn.disabled = false; // 確保新遊戲開始時提交按鈕可用
        playerNameInput.value = ''; // 確保新遊戲開始時清空姓名輸入框


        startNextChallengeYear();

        loadStocks();
    });


    // 確認選股組合按鈕
    confirmSelectionBtn.addEventListener('click', () => {
        // 如果遊戲已結束，此按鈕無效
        if (gameEnded) return;

        // 不再強制選擇 5 檔，只要有選股即可
        if (selectedStocks.length === 0) {
            alert('請至少選擇 1 檔股票！');
            return;
        }

        const { returnRate, numericReturnRate, riskLevel, diversificationLevel, capitalChange, currentCapital: updatedCurrentCapital, individualStockReturns } = simulateReturns(selectedStocks, currentMarketEvent.key);
        finalReturnRate = returnRate;
        numericFinalReturnRate = numericReturnRate;

        // 顯示報酬率及當年的絕對金額變化
        returnRateDisplay.textContent = `${returnRate}% (${capitalChange} 元)`;
        returnRateDisplay.classList.toggle('negative', numericReturnRate < 0);
        riskLevelDisplay.textContent = riskLevel;
        diversificationLevelDisplay.textContent = diversificationLevel;
        resultsTitle.textContent = `投資結果 - 市場情境：${currentMarketEvent.data.description}`;

        // 顯示單年個股漲跌幅
        singleYearStockPerformanceUl.innerHTML = '';
        individualStockReturns.forEach(stock => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="stock-name">${stock.name} (${stock.id})</span><span class="stock-return ${parseFloat(stock.return) < 0 ? 'negative' : ''}">${stock.return}%</span>`;
            singleYearStockPerformanceUl.appendChild(li);
        });


        // 記錄本年投資結果
        allYearsInvestmentRecords.push({
            eventKey: currentMarketEvent.key,
            selectedStocks: [...selectedStocks], // 儲存選股的完整物件，便於後續分析
            returnRate: finalReturnRate,
            numericReturnRate: numericFinalReturnRate,
            riskLevel: riskLevel,
            diversificationLevel: diversificationLevel,
            capitalChange: capitalChange,
            currentCapital: updatedCurrentCapital, // 這裡儲存數字，方便圖表繪製
            individualStockReturns: individualStockReturns // 記錄每支股票的報酬率
        });

        // 累計報酬率 (固定為五年挑戰)
        // 這裡的累計報酬率應該是總體的資本變化，而不是簡單的百分比累加，
        // 因為每年的基數不同。但為了簡化遊戲，如果 cumulativeReturnRate 僅用於顯示
        // 總的報酬率百分比，則維持其累加行為。如果需要更精確的「實際財富變化」
        // 百分比，則需要重新計算 (最終資本 / 初始資本 - 1) * 100%
        // 在這裡，我們保持現有邏輯，它代表的是「每年報酬率的簡單平均累計」
        // 如果要顯示「最終資產相較於初始資產的百分比變化」，則應在挑戰結束時計算：
        // (currentCapital / initialCapital - 1) * 100
        cumulativeReturnRate = (currentCapital / initialCapital - 1) * 100; // 修正為實際資本變化帶來的總報酬率


        // 判斷是否為最後一年
        if (currentChallengeYearIndex === totalChallengeYears - 1) { // 如果是第五年
            gameEnded = true; // **設置遊戲結束標記**
            resultsSection.classList.remove('hidden'); // 仍然顯示結果頁面
            gameSection.classList.add('hidden');
            nextYearBtn.textContent = '檢視五年總結'; // 改變按鈕文字
            nextYearBtn.classList.remove('hidden'); // 確保按鈕可見
            confirmSelectionBtn.disabled = true; // 禁用選股確認按鈕

        } else { // 非最後一年
            resultsSection.classList.remove('hidden');
            gameSection.classList.add('hidden');
            nextYearBtn.textContent = '進入下一年挑戰'; // 確保按鈕文字正確
            nextYearBtn.classList.remove('hidden');
        }
    });

    // 檢視本年分析按鈕
    analyzeBtn.addEventListener('click', () => {
        analysisSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        // 判斷是否正在檢視總體分析 (僅當遊戲結束且按鈕文字為「檢視五年總結」時才算)
        // 這裡的邏輯變更為：analyzeBtn 永遠只顯示單年分析
        isViewingTotalAnalysis = false; // 點擊 analyzeBtn 永遠是單年分析
        analysisTitle.textContent = `第 ${currentChallengeYearIndex + 1} 年投資組合分析`;
        const lastYearRecord = allYearsInvestmentRecords[allYearsInvestmentRecords.length -1];
        const analysis = generateLocalAnalysis(lastYearRecord.selectedStocks, lastYearRecord.eventKey, false);
        localAnalysisDisplay.textContent = analysis;
        
        backToResultsBtn.classList.remove('hidden'); // 返回按鈕始終顯示
    });

    // 進入下一年挑戰按鈕 / 檢視五年總結按鈕
    nextYearBtn.addEventListener('click', () => {
        // 如果遊戲已結束，且按鈕文字是「檢視五年總結」，則進入總結頁面
        if (gameEnded && nextYearBtn.textContent === '檢視五年總結') {
            resultsSection.classList.add('hidden');
            gameSection.classList.add('hidden');
            challengeEndSection.classList.remove('hidden');
            // 這裡的 cumulativeReturnRate 已經在 confirmSelectionBtn 點擊時更新為基於總資產的實際累計報酬率
            finalCumulativeReturnDisplay.textContent = `${cumulativeReturnRate.toFixed(2)}% (最終資產：${currentCapital.toFixed(0)} 元)`;
            finalCumulativeReturnDisplay.classList.toggle('negative', cumulativeReturnRate < 0);
            nextYearBtn.classList.add('hidden'); // 隱藏此按鈕
            confirmSelectionBtn.disabled = true; // 再次禁用確認選股按鈕

            drawCumulativeCapitalChart(); // 在這裡繪製總資產圖表
        } else { // 正常進入下一年挑戰
            currentChallengeYearIndex++;
            if (currentChallengeYearIndex < totalChallengeYears) {
                resultsSection.classList.add('hidden');
                gameSection.classList.remove('hidden');
                selectedStocks = []; // 清空已選股票
                updateSelectedStocksDisplay(); // 更新顯示
                loadStocks(); // 重新載入股票卡片狀態
                startNextChallengeYear(); // 開始下一年的流程
            }
        }
    });

    // 返回結果頁面按鈕 (從分析頁面返回)
    backToResultsBtn.addEventListener('click', () => {
        // 無論是單年分析還是總體分析，都返回到挑戰結束頁面（如果是總體分析則返回排行榜）
        if (isViewingTotalAnalysis) { // 這個邏輯目前不會被 analyzeBtn 直接觸發，而是由 nextYearBtn 觸發
            analysisSection.classList.add('hidden');
            leaderboardSection.classList.remove('hidden');
            loadLeaderboard(); // 確保排行榜是最新的
            isViewingTotalAnalysis = false; // 重置標記
        } else { // 否則返回當前年的結果頁面
            analysisSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
        }
    });

    // 提交最終分數按鈕
    submitFinalScoreBtn.addEventListener('click', submitScore);

    // 重新挑戰按鈕
    restartGameBtn.addEventListener('click', () => {
        resetGame();
        // 隱藏排行榜，顯示開始頁面
        leaderboardSection.classList.add('hidden');
        gameStartSection.classList.remove('hidden');
    });

    // 返回首頁按鈕
    backToHomeBtn.addEventListener('click', () => {
        resetGame();
        // 隱藏排行榜，顯示開始頁面
        leaderboardSection.classList.add('hidden');
        gameStartSection.classList.remove('hidden');
    });


    // 啟動下一年的挑戰 (包含情境生成和顯示)
    function startNextChallengeYear() {
        currentMarketEvent = getRandomMarketEvent();
        currentYearTitle.textContent = `五年挑戰 - 第 ${currentChallengeYearIndex + 1} 年：當前市場情境 (${currentMarketEvent.data.description}) (請選 1-5 檔股票)：`; 
        currentCapitalDisplay.textContent = currentCapital.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }); // **更新總資產顯示**
        selectedStocks = []; // 清空之前的選股
        selectedCountDisplay.textContent = '0'; // 確保數字顯示為 0
        selectedStocksUl.innerHTML = ''; // 清空列表
        confirmSelectionBtn.disabled = true; // 確保按鈕被禁用直到選滿 1 檔
        loadStocks(); // 重新載入股票卡片（清除之前選中的狀態）
        nextYearBtn.classList.add('hidden'); // 隱藏下一輪按鈕
        analyzeBtn.classList.remove('hidden'); // 確保檢視詳細分析按鈕可見
    }

    // 初始化遊戲狀態 (頁面載入時)
    resetGame();
    loadLeaderboard(); // 載入排行榜 (可選，看是否一開始就顯示)
});