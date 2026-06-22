// 绘画管理器
const DrawingManager = {
    // 绘制手部关键点和连线
    drawHandWithCurrentColor(landmarks, colorConfig) {
        const ctx = DomManager.elements.ctx;
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20]
        ];
        
        connections.forEach(([startIdx, endIdx]) => {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            
            const startX = Utils.getMirroredX(start.x);
            const startY = start.y * CONFIG.canvas.height;
            const endX = Utils.getMirroredX(end.x);
            const endY = end.y * CONFIG.canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = colorConfig.secondary;
            ctx.lineWidth = 4;
            ctx.stroke();
        });
        
        landmarks.forEach((landmark, idx) => {
            const isFingertip = [4, 8, 12, 16, 20].includes(idx);
            const pointColor = isFingertip ? colorConfig.primary : colorConfig.accent;
            const pointSize = isFingertip ? 8 : 6;
            
            const x = Utils.getMirroredX(landmark.x);
            const y = landmark.y * CONFIG.canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            ctx.fillStyle = pointColor;
            ctx.fill();
            
            if (isFingertip) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });
    },
    
    // 处理绘画
    handleDrawing(landmarks, handIndex, pinchDist) {
        const thumb = landmarks[4];
        const index = landmarks[8];
        
        // 获取当前坐标
        let indexX = Utils.getMirroredX(index.x);
        let indexY = index.y * CONFIG.canvas.height;
        
        const state = StateManager.hands[handIndex];
        const currentColor = StateManager.getCurrentColor();
        
        // 1. 手势平滑处理 (EMA)
        // alpha 越小越平滑但延迟越高，0.2-0.3 是较好的平衡点
        const alpha = 0.3;
        
        if (state.smoothX === undefined || state.smoothX === null) {
            // 初始化
            state.smoothX = indexX;
            state.smoothY = indexY;
        } else {
            // EMA 公式: current = alpha * new + (1 - alpha) * old
            state.smoothX = alpha * indexX + (1 - alpha) * state.smoothX;
            state.smoothY = alpha * indexY + (1 - alpha) * state.smoothY;
        }
        
        // 使用平滑后的坐标进行绘制
        const drawX = state.smoothX;
        const drawY = state.smoothY;
        
        if (pinchDist < CONFIG.thresholds.pinch) {
            if (state.prevX !== null && state.prevY !== null) {
                // 2. 曲线绘制优化 (Quadratic Bezier Curve)
                // 取中点作为控制点，实现平滑连接
                
                // 计算中点
                const midX = (state.prevX + drawX) / 2;
                const midY = (state.prevY + drawY) / 2;
                
                // 准备上下文列表 (同时绘制到 buffer 和 main canvas)
                const contexts = [DomManager.paintCtx, DomManager.elements.ctx];
                
                contexts.forEach(ctx => {
                    ctx.beginPath();
                    // 从上一次的终点开始 (注意：如果使用贝塞尔曲线，这里的起点应该是上一段曲线的终点，即上一次的中点)
                    // 但为了简单且连续，我们通常从 prev 点画到 mid 点，用 prev 点作为控制点...
                    // 更标准的做法是：moveTo(prevX, prevY) -> quadraticCurveTo(prevX, prevY, midX, midY) 是不对的
                    // 正确的平滑曲线策略：
                    // 起点：lastMidX, lastMidY
                    // 控制点：prevX, prevY
                    // 终点：midX, midY
                    
                    if (state.lastMidX !== null && state.lastMidY !== null) {
                        ctx.moveTo(state.lastMidX, state.lastMidY);
                        ctx.quadraticCurveTo(state.prevX, state.prevY, midX, midY);
                    } else {
                        // 第一段，直接直线
                        ctx.moveTo(state.prevX, state.prevY);
                        ctx.lineTo(midX, midY);
                    }
                    
                    ctx.strokeStyle = currentColor.primary;
                    ctx.lineWidth = CONFIG.drawing.lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                });
                
                // 更新状态
                state.lastMidX = midX;
                state.lastMidY = midY;
            } else {
                // 刚开始画，重置 lastMid
                state.lastMidX = null;
                state.lastMidY = null;
            }
            
            state.prevX = drawX;
            state.prevY = drawY;
        } else {
            // 抬起手，结束绘制
            state.prevX = null;
            state.prevY = null;
            state.lastMidX = null;
            state.lastMidY = null;
            // 此时不重置 smoothX/Y，保持位置连续性，直到下一次识别重置
        }
    },
    
    // 绘制十字相框
    drawCrossFrame(points) {
        const ctx = DomManager.elements.ctx;
        
        ctx.beginPath();
        ctx.moveTo(points.leftIndex.x, points.leftIndex.y);
        ctx.lineTo(points.rightThumb.x, points.rightThumb.y);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 6;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(points.rightIndex.x, points.rightIndex.y);
        ctx.lineTo(points.leftThumb.x, points.leftThumb.y);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 6;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const pointNames = ['leftIndex', 'rightThumb', 'rightIndex', 'leftThumb'];
        pointNames.forEach(name => {
            const point = points[name];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#4CAF50';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    },
    
    // 绘制爱心手势连接线
    drawHeartConnection(points, progress = 0) {
        const ctx = DomManager.elements.ctx;
        const heartColor = CONFIG.colors[4].primary;

        // 绘制拇指连接线(爱心底部)
        if (points.leftThumb && points.rightThumb) {
            ctx.beginPath();
            ctx.moveTo(points.leftThumb.x, points.leftThumb.y);
            ctx.lineTo(points.rightThumb.x, points.rightThumb.y);
            ctx.strokeStyle = heartColor;
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.6 + (progress * 0.4);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // 绘制食指连接线(爱心顶部)
        ctx.beginPath();
        ctx.moveTo(points.leftIndex.x, points.leftIndex.y);
        ctx.lineTo(points.rightIndex.x, points.rightIndex.y);
        ctx.strokeStyle = heartColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6 + (progress * 0.4);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // 绘制中心进度指示器
        this.drawHeartProgress(ctx, points.center, progress);
    },

    // 绘制小爱心图标
    drawMiniHeart(ctx, x, y, color, direction) {
        const size = 12;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(direction, 1);

        ctx.beginPath();
        ctx.moveTo(0, size / 2);
        ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 4, 0, size);
        ctx.bezierCurveTo(size, size / 4, size / 2, -size / 4, 0, size / 2);

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.restore();
    },

    // 绘制爱心进度指示器
    drawHeartProgress(ctx, center, progress) {
        const radius = 30;

        // 背景圆圈
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 64, 129, 0.3)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // 进度弧
        if (progress > 0) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
            ctx.strokeStyle = CONFIG.colors[4].primary;
            ctx.lineWidth = 6;
            ctx.stroke();
        }

        // 进度百分比
        if (progress > 0) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round(progress * 100)}%`, center.x, center.y);
            ctx.textAlign = 'left';  // 重置对齐方式
        }
    },
    
    // 绘制爱心路径
    drawHeartPath(points) {
        if (points.length < 2) return;
        
        const heartColor = CONFIG.colors[4].primary;
        
        // 在绘画层绘制
        DomManager.paintCtx.beginPath();
        DomManager.paintCtx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            if (i % 3 === 0) {
                const cp1x = points[i-1].x + (points[i].x - points[i-1].x) * 0.3;
                const cp1y = points[i-1].y + (points[i].y - points[i-1].y) * 0.3;
                const cp2x = points[i-1].x + (points[i].x - points[i-1].x) * 0.7;
                const cp2y = points[i-1].y + (points[i].y - points[i-1].y) * 0.7;
                DomManager.paintCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
            } else {
                DomManager.paintCtx.lineTo(points[i].x, points[i].y);
            }
        }
        
        DomManager.paintCtx.strokeStyle = heartColor;
        DomManager.paintCtx.lineWidth = CONFIG.drawing.lineWidth + 4;
        DomManager.paintCtx.stroke();
        
        // 在主画布实时预览
        const ctx = DomManager.elements.ctx;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            if (i % 3 === 0) {
                const cp1x = points[i-1].x + (points[i].x - points[i-1].x) * 0.3;
                const cp1y = points[i-1].y + (points[i].y - points[i-1].y) * 0.3;
                const cp2x = points[i-1].x + (points[i].x - points[i-1].x) * 0.7;
                const cp2y = points[i-1].y + (points[i].y - points[i-1].y) * 0.7;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
            } else {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }
        
        ctx.strokeStyle = heartColor;
        ctx.lineWidth = CONFIG.drawing.lineWidth + 4;
        ctx.stroke();
    },
    
    // 清空画布
    clearCanvas() {
        DomManager.paintCtx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    },
    
    // 绘制UI元素到画布（用于备用保存方法）
    drawUIElements(ctx) {
        const color = StateManager.getCurrentColor();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(20, 20, 200, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial Rounded MT Bold, Arial';
        ctx.fillText('当前颜色:', 40, 50);
        
        ctx.beginPath();
        ctx.arc(160, 40, 12, 0, Math.PI * 2);
        ctx.fillStyle = color.primary;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = color.primary;
        ctx.fillText(color.name, 180, 50);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        const hintWidth = 800;
        const hintX = (CONFIG.canvas.width - hintWidth) / 2;
        ctx.fillRect(hintX, CONFIG.canvas.height - 80, hintWidth, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial Rounded MT Bold, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✌️ 拇指+食指: 绘画 | 🤏 拇指+中指: 切换颜色', CONFIG.canvas.width / 2, CONFIG.canvas.height - 55);
        ctx.fillText('✊ 单手握拳: 清空画布 | 📸 十字相框手势: 保存作品 | ❤️ 双手食指靠近: 绘制爱心', CONFIG.canvas.width / 2, CONFIG.canvas.height - 25);
        ctx.textAlign = 'left';
    }
};