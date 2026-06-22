// 全局配置常量
const CONFIG = {
    // 颜色配置
    colors: [
        { name: '黄色', primary: '#FFFF00', secondary: '#FFFF66', accent: '#FFFFAA' },
        { name: '绿色', primary: '#00FF00', secondary: '#66FF66', accent: '#AAFFAA' },
        { name: '红色', primary: '#FF0000', secondary: '#FF6666', accent: '#FFAAAA' },
        { name: '蓝色', primary: '#0000FF', secondary: '#6666FF', accent: '#AAAAFF' },
        { name: '粉色', primary: '#FF4081', secondary: '#FF80AB', accent: '#FFB6C1' }
    ],
    
    // 阈值配置
    thresholds: {
        pinch: 45,
        colorChange: 35,
        fist: 0.55,
        cross: 35,
        heart: 120,         // 大幅增大阈值（原60），让用户不需要太标准的手势也能触发
        heartCompleteDistance: 150
    },
    
    // 时间配置
    times: {
        crossHold: 1000,
        colorCooldown: 500,
        countdown: 3,
        heartHold: 200  // 缩短保持时间到200ms（原500ms），让特效几乎即时出现
    },
    
    // 绘画配置
    drawing: {
        lineWidth: 12,
        lineCap: 'round',
        lineJoin: 'round'
    },
    
    // 人脸区域估计
    faceArea: {
        x: 320,      // 人脸区域左边界（屏幕宽度的1/4）
        y: 90,       // 人脸区域上边界（屏幕高度的1/8）
        width: 640,  // 人脸区域宽度（屏幕宽度的1/2）
        height: 360  // 人脸区域高度（屏幕高度的1/2）
    },
    
    // 爱心发射区域
    heartEmissionZones: [
        { x: 0, y: 600, width: 200, height: 120 },
        { x: 1080, y: 600, width: 200, height: 120 },
        { x: 300, y: 600, width: 200, height: 120 },
        { x: 780, y: 600, width: 200, height: 120 },
        { x: 540, y: 600, width: 200, height: 120 },
        { x: 0, y: 500, width: 150, height: 100 },
        { x: 1130, y: 500, width: 150, height: 100 },
        { x: 200, y: 550, width: 150, height: 100 },
        { x: 930, y: 550, width: 150, height: 100 }
    ],
    
    // 画布尺寸
    canvas: {
        width: 1280,
        height: 720
    }
};