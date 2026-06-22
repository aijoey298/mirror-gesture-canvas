// 爱心特效
class HeartEffect extends BaseEffect {
    constructor(options) {
        super({
            name: 'heart',
            ...options
        });

        this.rainInterval = null; // 雨滴定时器引用
    }

    // 启动持续爱心雨
    start() {
        if (this.active) return; // 避免重复启动
        this.active = true;

        // 立即生成一批，避免延迟
        this.createFloatingHearts(5);

        // 启动定时器，持续生成
        if (this.rainInterval) clearInterval(this.rainInterval);
        this.rainInterval = setInterval(() => {
            this.createFloatingHearts(2); // 每次生成少量，保持平滑
        }, 100); // 每100ms生成一次
    }

    // 停止持续爱心雨
    stop() {
        this.active = false;
        if (this.rainInterval) {
            clearInterval(this.rainInterval);
            this.rainInterval = null;
        }
        
        // 获取所有现存的爱心粒子，让它们加速淡出
        const hearts = document.querySelectorAll('.fullscreen-heart-particle');
        hearts.forEach(heart => {
            heart.style.transition = 'opacity 0.6s ease-out';
            heart.style.setProperty('opacity', '0', 'important');
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 600);
        });
    }

    // 兼容别名
    startContinuousRain() { this.start(); }
    stopContinuousRain() { this.stop(); }

    // 检测爱心手势 (仅供 BaseEffect 调用接口，实际逻辑在 GestureDetector)
    detectGesture(leftLandmarks, rightLandmarks) {
        return null; // 逻辑已移交 GestureDetector，此处仅保留接口兼容
    }

    // 重置特效
    reset() {
        this.stop();
        super.reset();
    }

    // 创建全屏浮动爱心
    createFloatingHearts(count = 30) {
        const colors = ['#ff4081', '#ff80ab', '#ffc1e3', '#ffffff', '#ffeb3b'];
        const emojis = ['❤️', '💖', '💗', '💓', '✨'];
        
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this.active) return; // 如果特效已停止，不再生成后续的延迟粒子

                // 随机位置：偏向两侧
                let startX;
                if (Math.random() > 0.5) {
                    startX = Math.random() * (width * 0.3); // 左侧 0-30%
                } else {
                    startX = width * 0.7 + Math.random() * (width * 0.3); // 右侧 70-100%
                }
                
                // 偶尔允许少量在中间
                if (Math.random() < 0.2) {
                    startX = Math.random() * width;
                }

                const size = 30 + Math.random() * 60; // 30-90px
                const rotation = (Math.random() - 0.5) * 60;
                const duration = 1.5 + Math.random() * 1.5; // 1.5-3s
                const color = colors[Math.floor(Math.random() * colors.length)];

                const heart = this.createParticle({
                    className: 'fullscreen-heart-particle',
                    innerHTML: emojis[Math.floor(Math.random() * emojis.length)],
                    x: startX,
                    y: height,
                    size: size,
                    color,
                    duration: duration * 1000,
                    cssVars: {
                        '--rotation': `${rotation}deg`
                    }
                });

                heart.style.zIndex = '1000';
                heart.style.color = color;
                heart.style.animation = `heartFloatUp ${duration}s linear forwards`;
            }, i * 30);
        }
    }
}
