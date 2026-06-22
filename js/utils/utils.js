// 工具函数集合
const Utils = {
    // 计算两点间距离
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // 获取镜像X坐标
    getMirroredX(x, canvasWidth = CONFIG.canvas.width) {
        return (1 - x) * canvasWidth;
    },
    
    // 限制数值范围
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // 生成随机数
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // 生成随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN')
            .replace(/[/:]/g, '-')
            .replace(/\s/g, '_');
    },
    
    // 创建DOM元素
    createElement(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    // 设置元素样式
    setStyle(element, styles) {
        Object.assign(element.style, styles);
    },
    
    // 动画结束后移除元素
    removeAfterAnimation(element, duration) {
        setTimeout(() => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration);
    }
};