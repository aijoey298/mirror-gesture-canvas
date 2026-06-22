// DOM元素管理器
const DomManager = {
    // DOM元素引用
    elements: {
        video: null,
        canvas: null,
        ctx: null,
        colorName: null,
        colorPreview: null,
        saveProgress: null,
        progressFill: null,
        progressText: null,
        cameraFlash: null,
        frameIndicator: null,
        heartIndicator: null,
        countdownOverlay: null,
        countdownNumber: null,
        photoFrame: null,
        screenshotPreview: null,
        container: null,
        loadingOverlay: null
    },
    
    // 绘画层
    paintCanvas: null,
    paintCtx: null,
    
    // 初始化DOM元素
    init() {
        this.elements.video = document.querySelector('.input_video');
        this.elements.canvas = document.querySelector('.output_canvas');
        this.elements.ctx = this.elements.canvas.getContext('2d');
        this.elements.colorName = document.getElementById('color-name');
        this.elements.colorPreview = document.getElementById('color-preview');
        this.elements.saveProgress = document.getElementById('save-progress');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.cameraFlash = document.getElementById('camera-flash');
        this.elements.frameIndicator = document.getElementById('frame-indicator');
        this.elements.heartIndicator = document.getElementById('heart-indicator');
        this.elements.countdownOverlay = document.getElementById('countdown-overlay');
        this.elements.countdownNumber = document.getElementById('countdown-number');
        this.elements.photoFrame = document.getElementById('photo-frame');
        this.elements.screenshotPreview = document.getElementById('screenshot-preview');
        this.elements.container = document.getElementById('container');
        this.elements.loadingOverlay = document.getElementById('loading-overlay');
        
        // 初始化绘画层
        this.initPaintLayer();
    },
    
    // 初始化绘画层
    initPaintLayer() {
        this.paintCanvas = document.createElement('canvas');
        this.paintCanvas.width = CONFIG.canvas.width;
        this.paintCanvas.height = CONFIG.canvas.height;
        this.paintCtx = this.paintCanvas.getContext('2d');
        
        this.paintCtx.lineCap = CONFIG.drawing.lineCap;
        this.paintCtx.lineJoin = CONFIG.drawing.lineJoin;
        this.paintCtx.lineWidth = CONFIG.drawing.lineWidth;
    },
    
    // 显示主界面
    showMainInterface() {
        this.elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            this.elements.loadingOverlay.style.display = 'none';
            this.elements.container.style.opacity = '1';
            StateManager.app.initialized = true;
        }, 500);
    },
    
    // 显示错误信息
    showError(message, subtext = '请检查摄像头权限') {
        this.elements.loadingOverlay.innerHTML = `
            <div style="color: #ff6b6b; font-size: 24px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
                <div>${message}</div>
                <div style="font-size: 16px; margin-top: 10px; color: #aaa;">${subtext}</div>
            </div>
        `;
    },
    
    // 更新颜色显示
    updateColorDisplay() {
        const color = StateManager.getCurrentColor();
        this.elements.colorName.textContent = color.name;
        this.elements.colorName.style.color = color.primary;
        this.elements.colorPreview.style.backgroundColor = color.primary;
        this.elements.colorPreview.style.boxShadow = `0 0 20px ${color.primary}`;
        
        // 触发颜色变化动画
        this.elements.colorPreview.style.animation = 'none';
        setTimeout(() => {
            this.elements.colorPreview.style.animation = 'colorChange 0.6s ease';
        }, 10);
    },
    
    // 显示/隐藏元素
    showElement(element, displayType = 'block') {
        element.style.display = displayType;
    },
    
    hideElement(element) {
        element.style.display = 'none';
    },
    
    // 更新进度条
    updateProgress(progress) {
        const progressPercent = Math.round(progress * 100);
        this.elements.progressFill.style.width = `${progressPercent}%`;
        this.elements.progressText.textContent = progressPercent >= 100 ? '准备拍照...' : `${progressPercent}%`;
    },
    
    // 清除所有爱心粒子
    clearHeartParticles() {
        document.querySelectorAll('.fullscreen-heart-particle, .heart-particle').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }
};