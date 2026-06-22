// 截图管理器
const ScreenshotManager = {
    // 开始倒计时
    startCountdown() {
        if (StateManager.app.countdown || StateManager.app.saving) return;
        
        StateManager.app.countdown = true;
        StateManager.app.saving = true;
        StateManager.countdownValue = CONFIG.times.countdown;
        
        // 隐藏指示器和进度条
        UIManager.hideAllIndicators();
        
        // 清除所有爱心特效粒子
        EffectManager.clearAllParticles();
        
        // 显示倒计时界面
        DomManager.showElement(DomManager.elements.countdownOverlay, 'flex');
        
        // 显示拍照边框
        DomManager.elements.photoFrame.style.width = '90%';
        DomManager.elements.photoFrame.style.height = '80%';
        DomManager.elements.photoFrame.style.top = '10%';
        DomManager.elements.photoFrame.style.left = '5%';
        DomManager.showElement(DomManager.elements.photoFrame);
        
        // 开始倒计时
        StateManager.countdownInterval = setInterval(() => {
            DomManager.elements.countdownNumber.textContent = StateManager.countdownValue;
            DomManager.elements.countdownNumber.style.animation = 'none';
            setTimeout(() => {
                DomManager.elements.countdownNumber.style.animation = 'countdownPop 1s ease-out';
            }, 10);
            
            if (StateManager.countdownValue <= 0) {
                clearInterval(StateManager.countdownInterval);
                this.takeScreenshot();
            }
            StateManager.countdownValue--;
        }, 1000);
    },
    
    // 停止倒计时
    stopCountdown() {
        if (StateManager.countdownInterval) {
            clearInterval(StateManager.countdownInterval);
            StateManager.countdownInterval = null;
        }
        StateManager.app.countdown = false;
        DomManager.hideElement(DomManager.elements.countdownOverlay);
        DomManager.hideElement(DomManager.elements.photoFrame);
    },
    
    // 拍摄截图
    async takeScreenshot() {
        // 显示闪光效果
        UIManager.showFlash();
        
        // 等待闪光效果显示，然后隐藏倒计时界面和相框
        setTimeout(async () => {
            // 隐藏倒计时界面和相框，以便截图时能拍到人脸
            DomManager.hideElement(DomManager.elements.countdownOverlay);
            DomManager.hideElement(DomManager.elements.photoFrame);
            
            // 短暂延迟确保UI已更新
            setTimeout(async () => {
                try {
                    // 使用html2canvas截取整个容器
                    await this.captureWithHtml2Canvas();
                } catch (error) {
                    console.error('html2canvas截图失败:', error);
                    // 如果html2canvas失败，使用备用方法
                    this.backupSaveMethod();
                }
            }, 50);
        }, 300);
    },
    
    // 使用html2canvas截图
    async captureWithHtml2Canvas() {
        const canvasElement = await html2canvas(DomManager.elements.container, {
            backgroundColor: null,
            scale: 1,
            useCORS: true,
            allowTaint: true
        });
        
        this.showScreenshotPreview(canvasElement);
        this.saveScreenshot(canvasElement);
    },
    
    // 备用保存方法
    backupSaveMethod() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CONFIG.canvas.width;
        tempCanvas.height = CONFIG.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制视频帧
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.translate(-tempCanvas.width, 0);
        tempCtx.drawImage(DomManager.elements.video, 0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.restore();
        
        // 绘制绘画内容
        tempCtx.drawImage(DomManager.paintCanvas, 0, 0);
        
        // 绘制UI元素
        DrawingManager.drawUIElements(tempCtx);
        
        this.showScreenshotPreview(tempCanvas);
        this.saveScreenshot(tempCanvas);
    },
    
    // 显示截图预览
    showScreenshotPreview(canvasElement) {
        DomManager.elements.screenshotPreview.src = canvasElement.toDataURL('image/png');
        DomManager.showElement(DomManager.elements.screenshotPreview);
        
        setTimeout(() => {
            DomManager.elements.screenshotPreview.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    },
    
    // 保存截图
    saveScreenshot(canvasElement) {
        const timestamp = Utils.formatTime(Date.now());
        const fileName = `GestureCanvas_${timestamp}.png`;
        
        canvasElement.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // 2秒后隐藏预览并重置状态
            setTimeout(() => {
                this.resetAfterScreenshot();
            }, 2000);
            
        }, 'image/png', 1.0);
    },
    
    // 截图后重置状态
    resetAfterScreenshot() {
        DomManager.elements.screenshotPreview.style.display = 'none';
        DomManager.elements.screenshotPreview.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        // 重置所有状态
        StateManager.reset();
    }
};