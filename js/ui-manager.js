// UI管理器
const UIManager = {
    // 初始化
    init() {
        // 初始颜色显示
        this.updateColorDisplay();
    },
    
    // 更新颜色显示
    updateColorDisplay() {
        DomManager.updateColorDisplay();
    },
    
    // 切换颜色
    changeColor() {
        StateManager.changeColor();
        this.updateColorDisplay();
    },
    
    // 更新相框手势指示器
    updateCrossFrameIndicator(points) {
        const centerX = (points.leftIndex.x + points.rightThumb.x + 
                       points.rightIndex.x + points.leftThumb.x) / 4;
        const centerY = (points.leftIndex.y + points.rightThumb.y + 
                       points.rightIndex.y + points.leftThumb.y) / 4;
        
        DomManager.elements.frameIndicator.style.left = `${centerX - 120}px`;
        DomManager.elements.frameIndicator.style.top = `${centerY - 70}px`;
        DomManager.showElement(DomManager.elements.frameIndicator);
    },
    
    // 更新爱心手势指示器
    updateHeartIndicator(points) {
        DomManager.elements.heartIndicator.style.left = `${points.center.x - 100}px`;
        DomManager.elements.heartIndicator.style.top = `${points.center.y - 70}px`;
        DomManager.showElement(DomManager.elements.heartIndicator);
    },
    
    // 隐藏所有指示器
    hideAllIndicators() {
        DomManager.hideElement(DomManager.elements.frameIndicator);
        DomManager.hideElement(DomManager.elements.heartIndicator);
        DomManager.hideElement(DomManager.elements.saveProgress);
    },
    
    // 显示保存进度
    showSaveProgress() {
        DomManager.showElement(DomManager.elements.saveProgress);
    },
    
    // 更新保存进度
    updateSaveProgress() {
        const now = Date.now();
        const holdTime = now - StateManager.gesture.cross.startTime;
        StateManager.gesture.cross.progress = Math.min(holdTime / CONFIG.times.crossHold, 1);
        
        DomManager.updateProgress(StateManager.gesture.cross.progress);
        
        // 检查是否达到触发时间
        if (holdTime >= CONFIG.times.crossHold &&
            !StateManager.app.saving &&
            !StateManager.app.countdown &&
            !StateManager.app.countdownQueued) {
            StateManager.app.countdownQueued = true;
            setTimeout(() => {
                StateManager.app.countdownQueued = false;
                ScreenshotManager.startCountdown();
            }, 200);
        }
    },
    
    // 开始相框手势
    startCrossGesture() {
        StateManager.gesture.cross.active = true;
        StateManager.gesture.cross.startTime = Date.now();
        this.showSaveProgress();
    },
    
    // 停止相框手势
    stopCrossGesture() {
        StateManager.gesture.cross.active = false;
        DomManager.hideElement(DomManager.elements.saveProgress);
        StateManager.gesture.cross.progress = 0;
        DomManager.updateProgress(0);
    },
    
    // 显示闪光效果
    showFlash() {
        DomManager.elements.cameraFlash.style.animation = 'none';
        setTimeout(() => {
            DomManager.elements.cameraFlash.style.animation = 'flash 0.6s';
        }, 10);
    }
};
