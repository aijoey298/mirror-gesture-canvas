// 主入口文件
class GestureCanvasApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // 初始化DOM管理器
            DomManager.init();

            // 初始化UI管理器
            UIManager.init();

            // 初始化摄像头
            await CameraManager.init();

            // 初始化手势识别
            await GestureDetector.init();

            // 初始化特效管理器
            EffectManager.init();

            // 显示主界面
            DomManager.showMainInterface();

            // 添加页面卸载时的清理
            window.addEventListener('beforeunload', () => this.cleanup());

        } catch (error) {
            console.error('应用初始化失败:', error);

            let errorMessage = '摄像头初始化失败';
            let subtext = '请检查摄像头权限';

            if (error.name === 'NotReadableError' || error.message.includes('Device in use')) {
                errorMessage = '摄像头被占用';
                subtext = '请关闭其他使用摄像头的应用（如相机、腾讯会议等）后刷新页面';
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = '摄像头权限被拒绝';
                subtext = '请在浏览器设置中允许访问摄像头后刷新页面';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '未找到摄像头';
                subtext = '请检查设备是否连接了摄像头';
            }

            DomManager.showError(errorMessage, subtext);
        }
    }

    // 清理资源
    cleanup() {
        try {
            GestureDetector.stop();
            CameraManager.stop();

            // 清理特效粒子
            EffectManager.clearAllParticles();

            // 清空画布
            if (DomManager.paintCtx) {
                DomManager.paintCtx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            }

            console.log('资源已清理');
        } catch (error) {
            console.warn('清理资源时出错:', error);
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GestureCanvasApp();
});
