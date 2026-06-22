// 摄像头管理器
const CameraManager = {
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
                DomManager.elements.video.srcObject = stream;
                // 关键修复：手动播放视频，否则画面静止黑屏
                DomManager.elements.video.play().catch(e => console.error('视频播放失败:', e));
                
                DomManager.elements.video.onloadedmetadata = () => {
                    resolve();
                };
                DomManager.elements.video.onerror = reject;
            }).catch(reject);
        });
    },
    
    // 只绘制视频（不处理手势）
    drawVideoOnly() {
        if (!StateManager.app.initialized) return;
        
        const ctx = DomManager.elements.ctx;
        const canvas = DomManager.elements.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(DomManager.elements.video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        ctx.drawImage(DomManager.paintCanvas, 0, 0);
    }
};