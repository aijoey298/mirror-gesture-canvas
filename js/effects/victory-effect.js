class VictoryEffect extends BaseEffect {
    constructor(options) {
        super({
            name: 'victory',
            ...options
        });
        
        this.particleInterval = null;
    }

    // 启动特效
    start(data) {
        if (this.active) return;
        this.active = true;
        this.lastData = data;

        // 立即发射
        this.emitParticles(data);

        // 持续发射 - 提高频率：150ms -> 80ms
        if (this.particleInterval) clearInterval(this.particleInterval);
        this.particleInterval = setInterval(() => {
            if (this.lastData) {
                this.emitParticles(this.lastData);
            }
        }, 80);
    }

    update(data) {
        this.lastData = data;
        return this;
    }

    stop() {
        this.active = false;
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }

        document.querySelectorAll('.victory-particle').forEach(particle => {
            particle.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            particle.style.opacity = '0';
            particle.style.transform += ' scale(0.6)';

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 400);
        });
    }

    // 发射粒子
    emitParticles(data) {
        if (!data || !data.points) return;

        const hands = Array.isArray(data.points) ? data.points : [data.points];

        hands.forEach(handPoints => {
            const indexTip = handPoints.indexTip;
            const middleTip = handPoints.middleTip;

            // 在食指和中指上方生成兔子耳朵
            this.createRabbitEar(indexTip.x, indexTip.y, -15); // 左耳倾斜
            this.createRabbitEar(middleTip.x, middleTip.y, 15);  // 右耳倾斜
        });
    }

    createRabbitEar(x, y, baseRotation) {
        // 放大尺寸：2倍 (原逻辑是彩带，现在改为耳朵)
        // 假设基础尺寸为 40px，现在设为 80-100px
        const size = 80 + Math.random() * 20;
        
        const ear = this.createParticle({
            className: 'victory-particle',
            innerHTML: '🐰', // 换成兔子emoji，或者使用 SVG 绘制更真实的耳朵
            x: x - size / 2,
            y: y - size / 2,
            size: size
        });
        
        // 动画：快速弹跳上升
        const duration = 0.8 + Math.random() * 0.4; // 0.8-1.2s，加快速度
        
        // 初始状态
        ear.style.transform = `rotate(${baseRotation}deg) scale(0)`;
        ear.style.opacity = '0';
        ear.style.transition = `all ${duration}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`; // 弹性效果
        
        setTimeout(() => {
            // 向上弹起并变大
            const jumpHeight = 150 + Math.random() * 50;
            const driftX = (Math.random() - 0.5) * 40;
            
            ear.style.opacity = '1';
            ear.style.transform = `translate(${driftX}px, -${jumpHeight}px) rotate(${baseRotation}deg) scale(1)`;
            
            // 然后淡出
            setTimeout(() => {
                ear.style.opacity = '0';
                ear.style.transform += ' translateY(-50px)';
            }, duration * 600);
        }, 10);
        
        Utils.removeAfterAnimation(ear, duration * 1000);
    }
    
    // 移除旧的 createConfetti 和 createBalloon 方法
    createConfetti() {}
    createBalloon() {}
}
