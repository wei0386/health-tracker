// 建立一個陣列來存放所有的紀錄資料
let records = [];

// [存檔功能] 將資料存入瀏覽器的 LocalStorage
function saveRecords() {
    localStorage.setItem('vanilla-health-data', JSON.stringify(records));
    updateGlobalStats(); // 存檔的同時，更新上方的儀表板數字
}

// [讀檔功能] 網頁打開時，從 LocalStorage 讀取資料
function loadRecords() {
    const savedData = localStorage.getItem('vanilla-health-data');
    if (savedData) {
        records = JSON.parse(savedData);
    }
    renderAll(); // 讀取完畢後，把畫面畫出來
}

// [更新儀表板] 計算並更新全域統計的數字
function updateGlobalStats() {
    const total = records.length;
    const warning = records.filter(r => r.status.includes('⚠️')).length;
    
    // 確保畫面上有這個元素再更新，避免報錯
    const totalEl = document.getElementById('totalCount');
    const warningEl = document.getElementById('warningCount');
    if(totalEl && warningEl) {
        totalEl.innerText = total;
        warningEl.innerText = warning;
    }
}

// [核心功能] 根據 records 陣列，把所有 HTML 標籤動態產生在畫面上
function renderAll() {
    const list = document.getElementById('recordList');
    list.innerHTML = ''; // 先清空目前的畫面
    
    // 取得目前是被點擊的(active)篩選按鈕
    const activeFilter = document.querySelector('.filter-btn.active').innerText;

    // 迴圈跑過每一筆紀錄，把它畫出來
    records.forEach(function(record) {
        // 如果目前是選「僅顯示需注意」，且這筆紀錄沒有警告符號，就跳過不畫
        if (activeFilter === '僅顯示需注意' && !record.status.includes('⚠️')) {
            return; 
        }
        
        const item = document.createElement('div');
        item.className = 'record-item';
        
        // ====== [語意化修改區域 開始] ======
        // 產生任務清單的 HTML：加入 <li> 標籤來包裝每一個任務
        const tasksHtml = record.tasks.map((task, index) => `
            <li>
                <label class="task-item">
                    <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </label>
            </li>
        `).join('');

        item.innerHTML = `
            <div class="record-header">
                <span>代號: ${record.userId}</span>
                <span>狀態: ${record.status} (BMI: ${record.bmi})</span>
            </div>
            <div class="record-details">
                <p><strong>輸入數據：</strong> 身高 ${record.height} cm | 體重 ${record.weight} kg</p>
                <p><strong>今日專屬健康任務：</strong></p>
                
                <!-- 這裡改成 <ul> 無序清單標籤 -->
                <ul class="task-list">
                    ${tasksHtml}
                </ul>
                
                <div class="task-stats">
                    <p class="stats-text"></p>
                    <p class="stats-comment"></p>
                </div>
                <button class="delete-btn">刪除此紀錄</button>
            </div>
        `;
        // ====== [語意化修改區域 結束] ======

        // 綁定「展開/收合」點擊事件
        item.querySelector('.record-header').addEventListener('click', function() {
            item.classList.toggle('active');
        });

        // 綁定「刪除按鈕」點擊事件
        item.querySelector('.delete-btn').addEventListener('click', function() {
            records = records.filter(r => r.id !== record.id); // 從陣列中過濾掉這筆
            saveRecords(); // 存檔
            renderAll();   // 重新渲染畫面
        });

        // 綁定「每一個 Checkbox」的事件與更新單筆評語
        const checkboxes = item.querySelectorAll('.task-checkbox');
        const statsText = item.querySelector('.stats-text');
        const statsComment = item.querySelector('.stats-comment');

        function updateSingleStats() {
            const totalTasks = record.tasks.length;
            const completedTasks = record.tasks.filter(t => t.completed).length;
            statsText.innerText = `進度：已完成 ${completedTasks} / 共 ${totalTasks} 項`;
            
            if (completedTasks === totalTasks) {
                statsComment.innerText = "太棒了！今日任務全部達成！ 🎉";
                statsComment.style.color = "#27ae60";
            } else if (completedTasks === 0) {
                statsComment.innerText = "還沒開始喔，快點動起來吧！ 💪";
                statsComment.style.color = "#555";
            } else {
                statsComment.innerText = "不錯喔！繼續保持，還差一點點！ 🏃‍♂";
                statsComment.style.color = "#e67e22";
            }
        }

        updateSingleStats(); // 剛建立時先計算一次評語

        checkboxes.forEach(box => {
            box.addEventListener('change', function(e) {
                const taskIndex = e.target.getAttribute('data-index');
                record.tasks[taskIndex].completed = e.target.checked; // 更新陣列狀態
                saveRecords(); // 存檔
                updateSingleStats(); // 更新文字評語
            });
        });

        // 將這筆 HTML 塞進清單中
        list.appendChild(item);
    });
    
    // 確保即使沒資料，也會更新儀表板為 0
    updateGlobalStats();
}

// ====== 綁定最上方的「新增按鈕」與「篩選按鈕」 ======
document.getElementById('addBtn').addEventListener('click', function() {
    const userId = document.getElementById('userId').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;

    if (!userId || !height || !weight) {
        alert('請填寫完整的代號、身高與體重！');
        return;
    }

    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const bmi = (w / (h * h)).toFixed(1);
    
    let status = '正常';
    let tasksText = ['💧 維持每日喝水 2000cc', '🛌 保持充足睡眠 7-8 小時', '🧘‍♀️ 伸展放鬆身體 10 分鐘'];

    if (bmi >= 24) { 
        status = '過重 ⚠️'; 
        tasksText = ['🚫 拒絕含糖飲料與甜點', '🏃‍♂️ 完成 30 分鐘有氧運動', '🥗 晚餐減少碳水化合物']; 
    } else if (bmi < 18.5) { 
        status = '過輕 ⚠️'; 
        tasksText = ['🥚 補充高蛋白食物 (如雞蛋、豆漿)', '🏋‍♀️ 完成 15 分鐘無氧/重量訓練', '🥪 三餐外加一次健康點心']; 
    }

    const tasks = tasksText.map(text => ({ text: text, completed: false }));

    // 把新資料加進陣列的最前面
    records.unshift({
        id: Date.now(),
        userId: userId,
        height: height,
        weight: weight,
        bmi: bmi,
        status: status,
        tasks: tasks
    });

    saveRecords(); // 存檔
    renderAll();   // 重新渲染畫面

    document.getElementById('height').value = '';
    document.getElementById('weight').value = '';
});

// 篩選按鈕邏輯
const filterBtns = document.querySelectorAll('.filter-btn');
const btnAll = filterBtns[0];       
const btnWarning = filterBtns[1];   

btnAll.addEventListener('click', function() {
    btnAll.classList.add('active');
    btnWarning.classList.remove('active');
    renderAll(); // 點擊篩選後，根據 active 狀態重新畫畫面
});

btnWarning.addEventListener('click', function() {
    btnWarning.classList.add('active');
    btnAll.classList.remove('active');
    renderAll(); 
});

// ====== 網頁開啟的第一步：讀取資料並啟動 ======
loadRecords();
