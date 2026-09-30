const { createApp } = Vue;

createApp({
    data() {
        return {
            // 綁定輸入框的資料
            userId: '',
            height: '',
            weight: '',
            // 記錄目前的篩選狀態
            filter: 'all', 
            // 存放所有健康紀錄的陣列
            records: [] 
        };
    },
    // ====== [新增 1] 網頁剛載入時，從 LocalStorage 把資料讀出來 ======
    mounted() {
        const savedData = localStorage.getItem('health-data');
        if (savedData) {
            this.records = JSON.parse(savedData);
        }
    },
    // ====== [新增 2] 只要 records 有任何變動，就自動存檔 ======
    watch: {
        records: {
            handler(newRecords) {
                localStorage.setItem('health-data', JSON.stringify(newRecords));
            },
            deep: true // 確保連 checkbox 打勾狀態都會被監聽並存檔
        }
    },
    computed: {
        // [任務篩選] 當 filter 或 records 改變時，這裡會自動重新計算顯示的名單
        filteredRecords() {
            if (this.filter === 'warning') {
                return this.records.filter(r => r.status.includes('⚠️'));
            }
            return this.records;
        },
        // ====== [新增 3] 專門計算「需注意(⚠️)」的筆數，給全域統計儀表板使用 ======
        warningCount() {
            return this.records.filter(r => r.status.includes('⚠️')).length;
        }
    },
    methods: {
        // [新增任務]
        addRecord() {
            if (!this.userId || !this.height || !this.weight) {
                alert('請填寫完整的代號、身高與體重！');
                return;
            }

            const h = parseFloat(this.height) / 100;
            const w = parseFloat(this.weight);
            const bmi = (w / (h * h)).toFixed(1);
            
            let status = '正常';
            let tasksText = ['💧 維持每日喝水 2000cc', '🛌 保持充足睡眠 7-8 小時', '🧘‍♀️ 伸展放鬆身體 10 分鐘'];

            if (bmi >= 24) { 
                status = '過重 ⚠️'; 
                tasksText = ['🚫 拒絕含糖飲料與甜點', '🏃‍♂️ 完成 30 分鐘有氧運動', '🥗 晚餐減少碳水化合物']; 
            } else if (bmi < 18.5) { 
                status = '過輕 ⚠️'; 
                tasksText = ['🥚 補充高蛋白食物 (如雞蛋、豆漿)', '🏋️‍♀️ 完成 15 分鐘無氧/重量訓練', '🥪 三餐外加一次健康點心']; 
            }

            // 將文字轉為包含完成狀態的物件陣列
            const tasks = tasksText.map(text => ({ text: text, completed: false }));

            // 將新紀錄推入陣列最前面
            this.records.unshift({
                id: Date.now(), 
                userId: this.userId,
                height: this.height,
                weight: this.weight,
                bmi: bmi,
                status: status,
                tasks: tasks,
                isOpen: false 
            });

            // 清空身高體重
            this.height = '';
            this.weight = '';
        },
        // [刪除任務]
        deleteRecord(id) {
            this.records = this.records.filter(record => record.id !== id);
        },
        // [統計計算] 算出陣列中 completed 為 true 的數量
        completedCount(tasks) {
            return tasks.filter(task => task.completed).length;
        },
        // [給予評語] 根據完成度回傳文字與顏色
        getComment(tasks) {
            const total = tasks.length;
            const completed = this.completedCount(tasks);
            
            if (completed === total) {
                return { text: "太棒了！今日任務全部達成！ 🎉", color: "#27ae60" };
            } else if (completed === 0) {
                return { text: "還沒開始喔，快點動起來吧！ 💪", color: "#555" };
            } else {
                return { text: "不錯喔！繼續保持，還差一點點！ 🏃‍♂", color: "#e67e22" };
            }
        }
    }
}).mount('#app');
