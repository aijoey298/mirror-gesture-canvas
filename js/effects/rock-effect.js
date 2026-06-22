class RockEffect extends BaseEffect {
    constructor(options) {
        super({
            name: 'rock',
            ...options
        });
        
        this.particleInterval = null;
    }

    // 启动特效
    start(data) {
        if (this.active) return;
        this.active = true;

        // 立即发射一次
        this.emitParticles(data);

        // 持续发射
        if (this.particleInterval) clearInterval(this.particleInterval);
        this.particleInterval = setInterval(() => {
            if (this.lastData) {
                this.emitParticles(this.lastData);
            }
        }, 100);
    }

    // 更新数据
    update(data) {
        this.lastData = data;
        return this;
    }

    // 停止特效
    stop() {
        this.active = false;
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }

        // 让粒子自然消失
        const particles = document.querySelectorAll('.rock-particle');
        particles.forEach(p => {
            p.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-in';
            p.style.opacity = '0';
            p.style.transform += ' scale(0)';
            
            setTimeout(() => {
                if (p.parentNode) {
                    p.parentNode.removeChild(p);
                }
            }, 500);
        });
    }

    // 发射粒子
    emitParticles(data) {
        if (!data || !data.points) return;

        // 支持双手数据（数组）或单手数据（对象）
        const hands = Array.isArray(data.points) ? data.points : [data.points];

        hands.forEach(handPoints => {
            if (!handPoints.indexTip || !handPoints.pinkyTip) return;

            // 1. 获取发射点：食指和小指指尖
            // 为了视觉更自然，我们根据指尖和指关节(DIP)的方向，稍微向外延伸一点点
            // 但如果 gesture-detector 已经处理好了坐标，这里直接用即可
            const indexSpawn = this.getFingertipSpawn(handPoints.indexTip, handPoints.indexDip, 14); // 食指外推
            const pinkySpawn = handPoints.pinkyTip; // 小指直接用指尖（防止错位）

            // 2. 发射火焰/电火花
            this.spawnFlameBurst(indexSpawn.x, indexSpawn.y);
            this.spawnFlameBurst(pinkySpawn.x, pinkySpawn.y);

            // 3. 随机生成装饰图标 (吉他拨片、骷髅、闪电)
            if (Math.random() < 0.28) { // 稍微降低频率
                const centerX = (handPoints.indexTip.x + handPoints.pinkyTip.x) / 2;
                const centerY = (handPoints.indexTip.y + handPoints.pinkyTip.y) / 2;
                this.spawnIcon(centerX, centerY);
            }
        });
    }

    // 计算指尖发射点（根据指尖和指关节方向外推）
    getFingertipSpawn(tip, dip, offset = 0) {
        if (!dip || offset === 0) return { x: tip.x, y: tip.y };
        
        const dx = tip.x - dip.x;
        const dy = tip.y - dip.y;
        const len = Math.hypot(dx, dy) || 1;
        
        const ux = dx / len;
        const uy = dy / len;
        
        return { 
            x: tip.x + ux * offset, 
            y: tip.y + uy * offset 
        };
    }

    // 生成火焰爆发/电火花
    spawnFlameBurst(x, y) {
        // 随机决定是火焰还是电火花
        const isSpark = Math.random() < 0.4; // 40% 概率是电火花

        if (isSpark) {
            this.createSpark(x, y);
        } else {
            this.createFlame(x, y);
        }
    }

    // 创建电火花粒子
    createSpark(x, y) {
        const sparkCount = 2 + Math.floor(Math.random() * 3); // 每次 2-4 个火花
        
        for (let i = 0; i < sparkCount; i++) {
            const size = 4 + Math.random() * 6; // 较小的粒子
            const spark = this.createParticle({
                className: 'rock-spark', // 需要在 CSS 定义样式
                x: x,
                y: y,
                size: size
            });

            // 快速向随机方向射出
            const angle = Math.random() * 360;
            const distance = 30 + Math.random() * 50;
            const duration = 200 + Math.random() * 200; // 短暂

            spark.style.transition = `all ${duration}ms ease-out`;
            spark.style.backgroundColor = '#00FFFF'; // 青色/电光蓝
            spark.style.borderRadius = '50%';
            spark.style.boxShadow = '0 0 10px #00FFFF, 0 0 20px #FFFFFF';
            
            // 立即启动动画
            setTimeout(() => {
                spark.style.transform = `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) scale(0)`;
                spark.style.opacity = '0';
            }, 10);
            
            Utils.removeAfterAnimation(spark, duration + 50);
        }
    }

    createFlame(x, y) {
        // 喷射效果：初速度向上
        const size = 35 + Math.random() * 30;
        const flame = this.createParticle({
            className: 'rock-particle',
            innerHTML: '🔥',
            x: x - size / 2, 
            y: y - size / 2,
            size: size
        });

        // 向上喷射，带一点随机左右
        // 角度集中在上方 (-90度 +/- 15度)
        const angle = -90 + (Math.random() - 0.5) * 30; 
        const distance = 100 + Math.random() * 80;
        
        flame.style.transition = 'all 0.6s ease-out';
        flame.style.opacity = '1';
        
        setTimeout(() => {
            flame.style.transform = `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) scale(0.6) rotate(${angle + 90}deg)`;
            flame.style.opacity = '0';
        }, 10);
        
        Utils.removeAfterAnimation(flame, 600);
    }
    
    spawnIcon(x, y) {
        // 吉他拨片(用🔻代替或特定emoji), 骷髅, 闪电
        const icons = ['⚡', '🎸', '💀', '🔻']; 
        const icon = icons[Math.floor(Math.random() * icons.length)];
        const size = 40 + Math.random() * 30;
        
        const el = this.createParticle({
            className: 'rock-icon', // CSS 区分样式
            innerHTML: icon,
            x: x - size / 2,
            y: y - size / 2,
            size: size
        });
        
        // 向上漂浮并淡出
        const distance = 120 + Math.random() * 60;
        
        el.style.transition = 'all 1s cubic-bezier(0.1, 0.7, 0.1, 1)';
        el.style.filter = 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))'; // 紫色光晕
        
        setTimeout(() => {
            el.style.transform = `translateY(-${distance}px) rotate(${(Math.random() - 0.5) * 60}deg) scale(1.2)`;
            el.style.opacity = '0';
        }, 10);
        
        Utils.removeAfterAnimation(el, 1000);
    }
}