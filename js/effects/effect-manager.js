// 特效管理器
const EffectManager = {
    effects: new Map(), // 存储注册的特效类
    currentEffect: null, // 当前激活的特效实例
    activeEffectName: null, // 当前激活的特效名称
    
    // 初始化
    init() {
        this.instances = new Map();

        // 按脚本是否加载成功进行注册，保证单个特效失败不影响主流程。
        if (typeof HeartEffect !== 'undefined') this.registerEffect('heart', HeartEffect);
        if (typeof RockEffect !== 'undefined') this.registerEffect('rock', RockEffect);
        if (typeof VictoryEffect !== 'undefined') this.registerEffect('victory', VictoryEffect);
        
        // 默认不激活任何特效
        this.currentEffect = null;
        this.activeEffectName = null;
    },
    
    // 注册特效
    registerEffect(name, EffectClass) {
        this.effects.set(name, EffectClass);
    },

    // 触发特效 (核心入口)
    trigger(name, data) {
        // 如果当前特效已经是该特效，则更新它
        if (this.activeEffectName === name && this.currentEffect) {
            // 如果特效未激活（可能是停止了），重新启动
            if (!this.currentEffect.active) {
                this.currentEffect.start(data);
            }
            this.currentEffect.update(data);
            return;
        }

        // 切换特效
        this.switchEffect(name, data);
    },

    // 停止当前特效
    stopCurrent() {
        const stoppedName = this.activeEffectName;
        if (this.currentEffect) {
            this.currentEffect.stop();
        }
        this.currentEffect = null;
        this.activeEffectName = null;
        return stoppedName;
    },

    // 切换特效
    switchEffect(name, data) {
        // 1. 停止当前特效
        if (this.currentEffect) {
            this.currentEffect.stop();
        }

        // 2. 检查是否有注册该特效
        const EffectClass = this.effects.get(name);
        if (!EffectClass) {
            console.warn(`Effect '${name}' not registered.`);
            return;
        }

        // 3. 创建或复用实例
        let instance = this.instances.get(name);
        if (!instance) {
            instance = new EffectClass({
                container: DomManager.elements.container,
                canvas: DomManager.elements.canvas,
                ctx: DomManager.elements.ctx
            });
            this.instances.set(name, instance);
        }

        this.currentEffect = instance;
        this.activeEffectName = name;

        // 4. 启动新特效
        this.currentEffect.start(data);
    },
    
    // 兼容旧代码：处理爱心手势 (将被 GestureDetector 的新逻辑取代)
    handleHeartGesture(heartResult) {
        this.trigger('heart', heartResult);
    },

    // 兼容旧代码：重置爱心手势
    resetHeartGesture() {
        if (this.activeEffectName === 'heart') {
            this.stopCurrent();
        }
        DomManager.hideElement(DomManager.elements.heartIndicator);
    },
    
    // 清除所有特效粒子
    clearAllParticles() {
        if (this.instances) {
            this.instances.forEach(instance => {
                if (instance.stop) {
                    instance.stop();
                } else if (instance.reset) {
                    instance.reset();
                }
            });
        }
        this.currentEffect = null;
        this.activeEffectName = null;
        DomManager.clearHeartParticles();
    }
};
