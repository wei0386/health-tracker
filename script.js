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
    let tasks = [
        '💧 維持每日喝水 2000cc', 
        '🛌 保持充足睡眠 7-8 小時', 
        '🧘‍♀️ 伸展放鬆身體 10 分鐘'
    ]; 

    if (bmi >= 24) { 
        status = '過重 ⚠️'; 
        tasks = [
            '🚫 拒絕含糖飲料與甜點', 
            '🏃‍♂️ 完成 30 分鐘有氧運動', 
            '🥗 晚餐減少碳水化合物'
        ]; 
    } else if (bmi < 18.5) { 
        status = '過輕 ⚠️'; 
        tasks = [
            '🥚 補充高蛋白食物 (如雞蛋、豆漿)', 
            '🏋️‍♀️ 完成 15 分鐘無氧/重量訓練', 
            '🥪 三餐外加一次健康點心'
        ]; 
    }

    const tasksHtml = tasks.map(task => `
        <label class="task-item">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${task}</span>
        </label>
    `).join('');

    const list = document.getElementById('recordList');
    const item = document.createElement('div');
    item.className = 'record-item';
    
    // ====== [新增] 加上了 task-stats 統計區塊 ======
    item.innerHTML = `
        <div class="record-header">
            <span>代號: ${userId}</span>
            <span>狀態: ${status} (BMI: ${bmi})</span>
        </div>
        <div class="record-details">
            <p><strong>輸入數據：</strong> 身高 ${height} cm | 體重 ${weight} kg</p>
            <p><strong>今日專屬健康任務：</strong></p>
            <div class="task-list">
                ${tasksHtml}
            </div>
            
            <div class="task-stats">
                <p class="stats-text">進度：已完成 0 / 共 ${tasks.length} 項</p>
                <p class="stats-comment">還沒開始喔，快點動起來吧！ 💪</p>
            </div>

            <button class="delete-btn">刪除此紀錄</button>
        </div>
    `;

    // 展開/收合事件
    item.querySelector('.record-header').addEventListener('click', function() {
        item.classList.toggle('active');
    });

    // 刪除事件
    item.querySelector('.delete-btn').addEventListener('click', function() {
        item.remove();
    });

    // ====== [新增核心功能] 任務統計與評語 ======
    const checkboxes = item.querySelectorAll('.task-checkbox');
    const statsText = item.querySelector('.stats-text');
    const statsComment = item.querySelector('.stats-comment');

    // 幫每一個勾選框加上監聽器，只要有變動就重新計算
    checkboxes.forEach(function(box) {
        box.addEventListener('change', function() {
            const total = checkboxes.length;
            let completed = 0;
            
            // 計算目前打勾的數量
            checkboxes.forEach(function(cb) {
                if (cb.checked) {
                    completed++;
                }
            });
            
            // 更新文字顯示
            statsText.innerText = `進度：已完成 ${completed} / 共 ${total} 項`;
            
            // 根據完成度給予不同評語與顏色
            if (completed === total) {
                statsComment.innerText = "太棒了！今日任務全部達成！ 🎉";
                statsComment.style.color = "#27ae60"; // 綠色
            } else if (completed === 0) {
                statsComment.innerText = "還沒開始喔，快點動起來吧！ 💪";
                statsComment.style.color = "#555";    // 灰色
            } else {
                statsComment.innerText = "不錯喔！繼續保持，還差一點點！ 🏃‍♂️️";
                statsComment.style.color = "#e67e22"; // 橘色
            }
        });
    });
    // ===============================================

    list.prepend(item); 
    
    document.getElementById('height').value = '';
    document.getElementById('weight').value = '';
});

// ====== 以下是「任務篩選」功能 ======
const filterBtns = document.querySelectorAll('.filter-btn');
const btnAll = filterBtns[0];       
const btnWarning = filterBtns[1];   

btnAll.addEventListener('click', function() {
    btnAll.classList.add('active');
    btnWarning.classList.remove('active');
    const records = document.querySelectorAll('.record-item');
    records.forEach(function(record) {
        record.style.display = 'block';
    });
});

btnWarning.addEventListener('click', function() {
    btnWarning.classList.add('active');
    btnAll.classList.remove('active');
    const records = document.querySelectorAll('.record-item');
    records.forEach(function(record) {
        const headerText = record.querySelector('.record-header').innerText;
        if (headerText.includes('⚠️')) {
            record.style.display = 'block';
        } else {
            record.style.display = 'none';
        }
    });
});