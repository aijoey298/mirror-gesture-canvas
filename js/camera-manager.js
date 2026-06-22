// 摄像头管理器
const CameraManager = {
    previewFrameId: null,
    lastAnalysisFrameAt: 0,

    // 初始化摄像头
    async init() {
        return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('浏览器不支持摄像头'));
                return;
            }
            
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: CONFIG.canvas.width },
                    height: { ideal: CONFIG.canvas.height },
                    facingMode: 'user'
                },
                audio: false
            }).then(stream => {
                const video = DomManager.elements.video;
                video.srcObject = stream;
                video.onerror = reject;

                const ready = () => {
                    video.play().then(() => {
                        this.startPreviewLoop();
                        resolve();
                    }).catch(reject);
                };

                if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
                    ready();
                } else {
                    video.onloadedmetadata = ready;
                }
            }).catch(reject);
        });
    },

    markAnalysisFrame() {
        this.lastAnalysisFrameAt = Date.now();
    },

    startPreviewLoop() {
        if (this.previewFrameId) return;

        const tick = () => {
            const noRecentAnalysisFrame = Date.now() - this.lastAnalysisFrameAt > 250;

            if (StateManager.app.initialized && noRecentAnalysisFrame) {
                this.drawVideoOnly({ force: true });
            }

            this.previewFrameId = requestAnimationFrame(tick);
        };

        this.previewFrameId = requestAnimationFrame(tick);
    },

    stop() {
        if (this.previewFrameId) {
            cancelAnimationFrame(this.previewFrameId);
            this.previewFrameId = null;
        }

        const stream = DomManager.elements.video?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            DomManager.elements.video.srcObject = null;
        }
    },
    
    // 只绘制视频（不处理手势）
    drawVideoOnly(options = {}) {
        if (!StateManager.app.initialized && !options.force) return;
        
        const ctx = DomManager.elements.ctx;
        const canvas = DomManager.elements.canvas;
        const video = DomManager.elements.video;

        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        ctx.drawImage(DomManager.paintCanvas, 0, 0);
    }
};
