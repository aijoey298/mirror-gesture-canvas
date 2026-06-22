// 应用状态管理器
const StateManager = {
    // 应用状态
    app: {
        initialized: false,
        saving: false,
        countdown: false,
        countdownQueued: false
    },
    
    // 手势状态
    gesture: {
        cross: {
            active: false,
            startTime: 0,
            progress: 0
        },
        heart: {
            active: false,
            startTime: 0,
            holdDuration: 0,
            startPoint: null
        }
    },
    
    // 手部状态
    hands: [
        { 
            prevX: null, 
            prevY: null, 
            colorChangeTriggered: false,
            cooldown: 0,
            lastIndexPos: {x: 0, y: 0},
            smoothX: null,
            smoothY: null,
            lastMidX: null,
            lastMidY: null
        },
        { 
            prevX: null, 
            prevY: null, 
            colorChangeTriggered: false,
            cooldown: 0,
            lastIndexPos: {x: 0, y: 0},
            smoothX: null,
            smoothY: null,
            lastMidX: null,
            lastMidY: null
        }
    ],
    
    // 当前颜色索引
    currentColorIndex: 0,
    
    // 时间相关
    lastFrameTime: Date.now(),
    countdownValue: 3,
    countdownInterval: null,
    
    // 重置函数
    reset() {
        this.app.saving = false;
        this.app.countdown = false;
        this.app.countdownQueued = false;
        this.gesture.cross.active = false;
        this.gesture.cross.progress = 0;
        this.gesture.heart.active = false;
        this.gesture.heart.holdDuration = 0;
        this.gesture.heart.startPoint = null;
        this.countdownValue = 3;

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    },
    
    // 重置手部状态
    resetHands() {
        for (let i = 0; i < 2; i++) {
            this.hands[i].prevX = null;
            this.hands[i].prevY = null;
            this.hands[i].colorChangeTriggered = false;
            this.hands[i].smoothX = null;
            this.hands[i].smoothY = null;
            this.hands[i].lastMidX = null;
            this.hands[i].lastMidY = null;
        }
    },
    
    // 获取当前颜色
    getCurrentColor() {
        return CONFIG.colors[this.currentColorIndex];
    },
    
    // 切换颜色
    changeColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % CONFIG.colors.length;
        return this.getCurrentColor();
    },
    
    // 更新冷却时间
    updateCooldowns() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        for (let i = 0; i < 2; i++) {
            if (this.hands[i].cooldown > 0) {
                this.hands[i].cooldown = Math.max(0, this.hands[i].cooldown - deltaTime);
            }
        }
    },
    
    // 检查颜色切换冷却
    canChangeColor(handIndex) {
        return !this.hands[handIndex].colorChangeTriggered && this.hands[handIndex].cooldown <= 0;
    },
    
    // 设置颜色切换冷却
    setColorChangeCooldown(handIndex) {
        this.hands[handIndex].colorChangeTriggered = true;
        this.hands[handIndex].cooldown = CONFIG.times.colorCooldown;
    }
};
