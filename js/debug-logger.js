const DebugLogger = {
    isEnabled: false, // 默认关闭，避免影响性能
    logs: [],
    maxLogs: 100,

    log(module, action, data) {
        if (!this.isEnabled) return;
        
        try {
            const entry = {
                timestamp: Date.now(),
                module,
                action,
                data: data // 移除深拷贝，避免GC压力，但在记录复杂对象时需注意引用问题
            };

            this.logs.push(entry);
            if (this.logs.length > this.maxLogs) this.logs.shift();
        } catch (e) {
            // ignore
        }
    },

    // 记录手势数据快照
    logGestureSnapshot(name, metrics) {
        if (!this.isEnabled) return;
        // 仅在明确开启调试时输出，且大幅降低频率
        // console.table 非常消耗性能，生产环境应禁用
        // if (Math.random() > 0.001) return; 
        // console.groupCollapsed(`[GestureSnapshot] ${name}`);
        // console.table(metrics);
        // console.groupEnd();
    },
    
    // 导出日志
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
};
