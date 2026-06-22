// 特效基类
class BaseEffect {
    constructor(options = {}) {
        this.name = options.name || 'unnamed';
        this.active = false;
        this.container = options.container;
        this.canvas = options.canvas;
        this.ctx = options.ctx;
        
        this.init();
    }
    
    init() {
        // 初始化特效
        this.elements = [];
        this.particles = [];
        this.trails = [];
    }

    getCanvasScale() {
        if (!this.canvas) {
            return { x: 1, y: 1, average: 1 };
        }

        const scaleX = this.canvas.clientWidth / this.canvas.width || 1;
        const scaleY = this.canvas.clientHeight / this.canvas.height || 1;
        return {
            x: scaleX,
            y: scaleY,
            average: (scaleX + scaleY) / 2
        };
    }

    toDomPoint(point) {
        const scale = this.getCanvasScale();
        return {
            x: point.x * scale.x,
            y: point.y * scale.y
        };
    }

    toDomLength(length) {
        return length * this.getCanvasScale().average;
    }
    
    // 检测手势（子类必须实现）
    detectGesture(handsData) {
        throw new Error('detectGesture must be implemented by subclass');
    }
    
    // 开始特效
    start(data) {
        this.active = true;
        return this;
    }
    
    // 更新特效
    update(data) {
        return this;
    }
    
    // 停止特效
    stop() {
        this.active = false;
        // 默认实现：如果需要渐隐，子类覆盖此方法
        // 如果只是简单移除，可以调用 reset()
        this.reset();
    }
    
    // 兼容旧代码的别名（将在完全迁移后移除）
    startEffect(data) { return this.start(data); }
    updateEffect(data) { return this.update(data); }
    completeEffect() { this.stop(); }
    
    // 重置特效
    reset() {
        this.active = false;
        this.elements.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        this.elements = [];
    }
    
    // 创建粒子
    createParticle(options) {
        const particle = Utils.createElement('div', options.className, options.innerHTML);
        
        // 坐标映射：将 Canvas 坐标 (x, y) 转换为 DOM 容器内的像素坐标
        // 假设 options.x 和 options.y 是基于 canvas 尺寸 (1280x720) 的坐标
        // 我们需要计算 canvas 在 DOM 中的实际显示尺寸和位置，以处理缩放
        if (options.x !== undefined && options.y !== undefined) {
            let domX = options.x;
            let domY = options.y;

            // 如果容器和画布存在尺寸差异，进行缩放映射
            // 注意：这里假设 this.container 是覆盖在 canvas 上的全屏容器
            // 且 this.canvas 是 source canvas
            // 实际上，如果 CSS 做了 object-fit: cover 或 contain，这里的映射会更复杂
            // 简单起见，我们假设容器是 1:1 覆盖或者我们直接使用百分比
            
            if (this.canvas) {
                const point = this.toDomPoint({ x: options.x, y: options.y });
                domX = point.x;
                domY = point.y;
            }

            particle.style.left = `${domX}px`;
            particle.style.top = `${domY}px`;
        }
        
        // 设置大小
        if (options.size !== undefined) {
            particle.style.fontSize = `${options.size}px`;
        }
        
        // 设置颜色
        if (options.color !== undefined) {
            particle.style.color = options.color;
        }
        
        // 设置动画延迟
        if (options.delay !== undefined) {
            particle.style.animationDelay = options.delay;
        }
        
        // 设置CSS自定义属性
        if (options.cssVars) {
            Object.entries(options.cssVars).forEach(([key, value]) => {
                particle.style.setProperty(key, value);
            });
        }
        
        this.container.appendChild(particle);
        this.elements.push(particle);
        
        // 粒子动画结束后移除
        if (options.duration !== undefined) {
            Utils.removeAfterAnimation(particle, options.duration);
        }
        
        return particle;
    }
}
