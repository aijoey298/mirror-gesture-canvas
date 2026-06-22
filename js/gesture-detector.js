const GestureMath = {
    toCanvasPoint(landmark) {
        return {
            x: Utils.getMirroredX(landmark.x),
            y: landmark.y * CONFIG.canvas.height
        };
    },

    distance(a, b) {
        return Utils.calculateDistance(a.x, a.y, b.x, b.y);
    },

    handSize(landmarks) {
        return this.distance(landmarks[0], landmarks[9]) || 0.001;
    },

    isExtended(landmarks, tipIndex, mcpIndex, factor = 1.45) {
        const wrist = landmarks[0];
        return this.distance(wrist, landmarks[tipIndex]) > this.distance(wrist, landmarks[mcpIndex]) * factor;
    },

    isCurled(landmarks, tipIndex, pipIndex, factor = 1.2) {
        const wrist = landmarks[0];
        return this.distance(wrist, landmarks[tipIndex]) < this.distance(wrist, landmarks[pipIndex]) * factor;
    }
};

// 手势定义
const GestureDefinitions = {
    // 爱心手势
    heart: {
        check: (leftLandmarks, rightLandmarks) => {
            if (!leftLandmarks || !rightLandmarks) return null;

            // 获取拇指和食指指尖
            const leftThumbTip = leftLandmarks[4];
            const leftIndexTip = leftLandmarks[8];
            const rightThumbTip = rightLandmarks[4];
            const rightIndexTip = rightLandmarks[8];

            // 转换坐标
            const leftThumbX = Utils.getMirroredX(leftThumbTip.x);
            const leftThumbY = leftThumbTip.y * CONFIG.canvas.height;
            const leftIndexX = Utils.getMirroredX(leftIndexTip.x);
            const leftIndexY = leftIndexTip.y * CONFIG.canvas.height;
            const rightThumbX = Utils.getMirroredX(rightThumbTip.x);
            const rightThumbY = rightThumbTip.y * CONFIG.canvas.height;
            const rightIndexX = Utils.getMirroredX(rightIndexTip.x);
            const rightIndexY = rightIndexTip.y * CONFIG.canvas.height;

            // 计算拇指和食指的距离
            const thumbDistance = Utils.calculateDistance(leftThumbX, leftThumbY, rightThumbX, rightThumbY);
            const indexDistance = Utils.calculateDistance(leftIndexX, leftIndexY, rightIndexX, rightIndexY);

            // 爱心手势条件:拇指和食指都要靠近
            // 放宽阈值到120像素,更容易触发
            const HEART_THRESHOLD = 120;

            const isHeartPose = thumbDistance < HEART_THRESHOLD && indexDistance < HEART_THRESHOLD;

            // 计算中心点(用于显示进度)
            const centerX = (leftIndexX + rightIndexX) / 2;
            const centerY = (leftIndexY + rightIndexY) / 2;

            if (isHeartPose) {
                return {
                    name: 'heart',
                    detected: true,
                    confidence: 0.9,
                    points: {
                        leftThumb: { x: leftThumbX, y: leftThumbY },
                        leftIndex: { x: leftIndexX, y: leftIndexY },
                        rightThumb: { x: rightThumbX, y: rightThumbY },
                        rightIndex: { x: rightIndexX, y: rightIndexY },
                        center: { x: centerX, y: centerY }
                    }
                };
            }
            return null;
        }
    },
    
    // 十字相框手势
    cross: {
        check: (leftLandmarks, rightLandmarks) => {
            if (!leftLandmarks || !rightLandmarks) return null;
            
            const leftIndexTip = leftLandmarks[8];
            const leftThumbTip = leftLandmarks[4];
            const rightIndexTip = rightLandmarks[8];
            const rightThumbTip = rightLandmarks[4];
            
            const leftIndexX = Utils.getMirroredX(leftIndexTip.x);
            const leftIndexY = leftIndexTip.y * CONFIG.canvas.height;
            const leftThumbX = Utils.getMirroredX(leftThumbTip.x);
            const leftThumbY = leftThumbTip.y * CONFIG.canvas.height;
            const rightIndexX = Utils.getMirroredX(rightIndexTip.x);
            const rightIndexY = rightIndexTip.y * CONFIG.canvas.height;
            const rightThumbX = Utils.getMirroredX(rightThumbTip.x);
            const rightThumbY = rightThumbTip.y * CONFIG.canvas.height;
            
            const distLeftIndexRightThumb = Utils.calculateDistance(leftIndexX, leftIndexY, rightThumbX, rightThumbY);
            const distRightIndexLeftThumb = Utils.calculateDistance(rightIndexX, rightIndexY, leftThumbX, leftThumbY);
            
            const isFrameGesture = distLeftIndexRightThumb < CONFIG.thresholds.cross && 
                                  distRightIndexLeftThumb < CONFIG.thresholds.cross;
            
            if (isFrameGesture) {
                return {
                    name: 'cross',
                    detected: true,
                    points: {
                        leftIndex: { x: leftIndexX, y: leftIndexY },
                        leftThumb: { x: leftThumbX, y: leftThumbY },
                        rightIndex: { x: rightIndexX, y: rightIndexY },
                        rightThumb: { x: rightThumbX, y: rightThumbY }
                    }
                };
            }
            return null;
        }
    },

    // 胜利/剪刀手：食指和中指伸直，其他手指收拢
    victory: {
        check: (leftLandmarks, rightLandmarks) => {
            const checkHand = (landmarks) => {
                if (!landmarks || landmarks.length < 21) return null;

                const handSize = GestureMath.handSize(landmarks);
                const isIndexExtended = GestureMath.isExtended(landmarks, 8, 5, 1.45);
                const isMiddleExtended = GestureMath.isExtended(landmarks, 12, 9, 1.38);
                const isRingCurled = GestureMath.isCurled(landmarks, 16, 14, 1.24);
                const isPinkyCurled = GestureMath.isCurled(landmarks, 20, 18, 1.24);
                const fingerGap = GestureMath.distance(landmarks[8], landmarks[12]);

                if (!isIndexExtended || !isMiddleExtended || !isRingCurled || !isPinkyCurled || fingerGap < handSize * 0.42) {
                    return null;
                }

                return {
                    indexTip: GestureMath.toCanvasPoint(landmarks[8]),
                    middleTip: GestureMath.toCanvasPoint(landmarks[12])
                };
            };

            const points = [checkHand(leftLandmarks), checkHand(rightLandmarks)].filter(Boolean);
            if (points.length === 0) return null;

            return {
                name: 'victory',
                detected: true,
                points
            };
        }
    },

    // 摇滚手势 (金属礼)
    rock: {
        CONSTANTS: {
            FINGER_EXTENDED_THRESHOLD: 0.15, // 手指伸直判断阈值
            THUMB_PRESS_THRESHOLD: 0.15      // 拇指压住判断阈值 (相对于手掌大小)
        },

        check: (leftLandmarks, rightLandmarks) => {
            const C = GestureDefinitions.rock.CONSTANTS;
            
            const checkHand = (landmarks, handLabel) => {
                if (!landmarks) return null;

                // 边界防护：输入验证
                if (landmarks.length < 21) {
                    // DebugLogger.log('GestureDetector', 'InputError', { msg: 'Invalid landmarks length' });
                    return null;
                }

                const wrist = landmarks[0];
                const indexTip = landmarks[8];
                const middleTip = landmarks[12];
                const ringTip = landmarks[16];
                const pinkyTip = landmarks[20];
                
                // 基准距离：手腕到中指指根 (MCP) 的距离，作为手掌大小参考
                const middleMCP = landmarks[9];
                const handSize = Utils.calculateDistance(wrist.x, wrist.y, middleMCP.x, middleMCP.y);
                
                // 边界防护：handSize 异常处理
                if (handSize === 0) return null;

                // 1. 食指和小指伸直
                // 判断标准：指尖到手腕的距离 > 指根(MCP)到手腕的距离 * 1.5 (粗略判断伸直)
                // 更准确：指尖到MCP距离 接近 手指长度
                const indexMCP = landmarks[5];
                const pinkyMCP = landmarks[17];
                
                const distIndexTipWrist = Utils.calculateDistance(wrist.x, wrist.y, indexTip.x, indexTip.y);
                const distIndexMCPWrist = Utils.calculateDistance(wrist.x, wrist.y, indexMCP.x, indexMCP.y);
                const isIndexExtended = distIndexTipWrist > distIndexMCPWrist * 1.5;

                const distPinkyTipWrist = Utils.calculateDistance(wrist.x, wrist.y, pinkyTip.x, pinkyTip.y);
                const distPinkyMCPWrist = Utils.calculateDistance(wrist.x, wrist.y, pinkyMCP.x, pinkyMCP.y);
                const isPinkyExtended = distPinkyTipWrist > distPinkyMCPWrist * 1.4; // 小指较短，阈值稍低

                if (!isIndexExtended || !isPinkyExtended) return null;

                // 2. 中指和无名指弯曲
                const middlePIP = landmarks[10]; // 近指节
                const ringPIP = landmarks[14];
                
                const distMiddleTipWrist = Utils.calculateDistance(wrist.x, wrist.y, middleTip.x, middleTip.y);
                const distMiddlePIPWrist = Utils.calculateDistance(wrist.x, wrist.y, middlePIP.x, middlePIP.y);
                // 弯曲：指尖到手腕距离 < PIP到手腕距离 (或接近)
                const isMiddleCurled = distMiddleTipWrist < distMiddlePIPWrist * 1.2;

                const distRingTipWrist = Utils.calculateDistance(wrist.x, wrist.y, ringTip.x, ringTip.y);
                const distRingPIPWrist = Utils.calculateDistance(wrist.x, wrist.y, ringPIP.x, ringPIP.y);
                const isRingCurled = distRingTipWrist < distRingPIPWrist * 1.2;

                if (!isMiddleCurled || !isRingCurled) return null;

                // 3. 拇指压住中指/无名指
                // 判断标准：拇指指尖靠近中指或无名指的第二指节 (PIP)
                const thumbTip = landmarks[4];
                
                // 坐标转换用于计算距离（因为landmarks是归一化的）
                // 简单起见，这里直接用归一化坐标计算相对距离，对比 handSize
                const distThumbMiddlePIP = Utils.calculateDistance(thumbTip.x, thumbTip.y, middlePIP.x, middlePIP.y);
                const distThumbRingPIP = Utils.calculateDistance(thumbTip.x, thumbTip.y, ringPIP.x, ringPIP.y);
                const distThumbMiddleMCP = Utils.calculateDistance(thumbTip.x, thumbTip.y, middleMCP.x, middleMCP.y); // 有时压在 MCP 上
                
                const isThumbPressing = (distThumbMiddlePIP < handSize * 0.6) || 
                                      (distThumbRingPIP < handSize * 0.6) ||
                                      (distThumbMiddleMCP < handSize * 0.6);

                if (isThumbPressing) {
                    // 返回像素坐标
                    return {
                        indexTip: { x: Utils.getMirroredX(indexTip.x), y: indexTip.y * CONFIG.canvas.height },
                        indexDip: { x: Utils.getMirroredX(landmarks[7].x), y: landmarks[7].y * CONFIG.canvas.height }, // 用于计算方向
                        pinkyTip: { x: Utils.getMirroredX(pinkyTip.x), y: pinkyTip.y * CONFIG.canvas.height },
                        pinkyDip: { x: Utils.getMirroredX(landmarks[19].x), y: landmarks[19].y * CONFIG.canvas.height } // 用于计算方向
                    };
                }
                return null;
            };

            const leftResult = checkHand(leftLandmarks, 'left');
            const rightResult = checkHand(rightLandmarks, 'right');

            if (leftResult || rightResult) {
                const points = [];
                if (leftResult) points.push(leftResult);
                if (rightResult) points.push(rightResult);
                
                return {
                    name: 'rock',
                    detected: true,
                    points: points // 数组，可能包含一只手或两只手
                };
            }
            return null;
        }
    }
};

// 手势检测器
const GestureDetector = {
    hands: null,
    frameRequestId: null,
    running: false,
    processingFrame: false,
    
    // 初始化手势识别
    async init() {
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults(this.onResults.bind(this));
        this.startFrameLoop();
    },

    startFrameLoop() {
        if (this.running) return;
        this.running = true;

        const tick = async () => {
            if (!this.running) return;

            const video = DomManager.elements.video;

            try {
                if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    if (StateManager.app.countdown || StateManager.app.saving) {
                        CameraManager.drawVideoOnly({ force: true });
                    } else if (!this.processingFrame) {
                        this.processingFrame = true;
                        try {
                            await this.hands.send({ image: video });
                        } finally {
                            this.processingFrame = false;
                        }
                    }
                }
            } catch (error) {
                console.warn('手势识别处理中:', error);
                CameraManager.drawVideoOnly({ force: true });
            }

            this.frameRequestId = requestAnimationFrame(tick);
        };

        this.frameRequestId = requestAnimationFrame(tick);
    },

    stop() {
        this.running = false;

        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }

        if (this.hands && typeof this.hands.close === 'function') {
            this.hands.close();
        }
    },
    
    // 检测十字相框手势
    detectCrossFrame(leftLandmarks, rightLandmarks) {
        if (!leftLandmarks || !rightLandmarks) return null;
        
        const leftIndexTip = leftLandmarks[8];
        const leftThumbTip = leftLandmarks[4];
        const rightIndexTip = rightLandmarks[8];
        const rightThumbTip = rightLandmarks[4];
        
        const leftIndexX = Utils.getMirroredX(leftIndexTip.x);
        const leftIndexY = leftIndexTip.y * CONFIG.canvas.height;
        const leftThumbX = Utils.getMirroredX(leftThumbTip.x);
        const leftThumbY = leftThumbTip.y * CONFIG.canvas.height;
        const rightIndexX = Utils.getMirroredX(rightIndexTip.x);
        const rightIndexY = rightIndexTip.y * CONFIG.canvas.height;
        const rightThumbX = Utils.getMirroredX(rightThumbTip.x);
        const rightThumbY = rightThumbTip.y * CONFIG.canvas.height;
        
        const distLeftIndexRightThumb = Utils.calculateDistance(leftIndexX, leftIndexY, rightThumbX, rightThumbY);
        const distRightIndexLeftThumb = Utils.calculateDistance(rightIndexX, rightIndexY, leftThumbX, leftThumbY);
        
        const isFrameGesture = distLeftIndexRightThumb < CONFIG.thresholds.cross && 
                              distRightIndexLeftThumb < CONFIG.thresholds.cross;
        
        return {
            detected: isFrameGesture,
            points: {
                leftIndex: { x: leftIndexX, y: leftIndexY },
                leftThumb: { x: leftThumbX, y: leftThumbY },
                rightIndex: { x: rightIndexX, y: rightIndexY },
                rightThumb: { x: rightThumbX, y: rightThumbY }
            }
        };
    },
    
    // 检测爱心手势(简化版 - 更容易触发)
    detectHeartGesture(leftLandmarks, rightLandmarks) {
        if (!leftLandmarks || !rightLandmarks) return null;

        // 获取拇指和食指指尖
        const leftThumbTip = leftLandmarks[4];
        const leftIndexTip = leftLandmarks[8];
        const rightThumbTip = rightLandmarks[4];
        const rightIndexTip = rightLandmarks[8];

        // 转换坐标
        const leftThumbX = Utils.getMirroredX(leftThumbTip.x);
        const leftThumbY = leftThumbTip.y * CONFIG.canvas.height;
        const leftIndexX = Utils.getMirroredX(leftIndexTip.x);
        const leftIndexY = leftIndexTip.y * CONFIG.canvas.height;
        const rightThumbX = Utils.getMirroredX(rightThumbTip.x);
        const rightThumbY = rightThumbTip.y * CONFIG.canvas.height;
        const rightIndexX = Utils.getMirroredX(rightIndexTip.x);
        const rightIndexY = rightIndexTip.y * CONFIG.canvas.height;

        // 计算拇指和食指的距离
        const thumbDistance = Utils.calculateDistance(leftThumbX, leftThumbY, rightThumbX, rightThumbY);
        const indexDistance = Utils.calculateDistance(leftIndexX, leftIndexY, rightIndexX, rightIndexY);

        // 爱心手势条件:拇指和食指都要靠近
        // 放宽阈值到120像素,更容易触发
        const HEART_THRESHOLD = 120;

        const isHeartPose = thumbDistance < HEART_THRESHOLD && indexDistance < HEART_THRESHOLD;

        // 计算中心点(用于显示进度)
        const centerX = (leftIndexX + rightIndexX) / 2;
        const centerY = (leftIndexY + rightIndexY) / 2;

        return {
            detected: isHeartPose,
            confidence: isHeartPose ? 0.9 : 0,
            points: {
                leftThumb: { x: leftThumbX, y: leftThumbY },
                leftIndex: { x: leftIndexX, y: leftIndexY },
                rightThumb: { x: rightThumbX, y: rightThumbY },
                rightIndex: { x: rightIndexX, y: rightIndexY },
                center: { x: centerX, y: centerY }
            }
        };
    },
    
    // 检测握拳手势
    detectFist(landmarks) {
        const indexMcp = landmarks[5], middleMcp = landmarks[9], ringMcp = landmarks[13], pinkyMcp = landmarks[17];
        
        const indexMcpX = Utils.getMirroredX(indexMcp.x);
        const indexMcpY = indexMcp.y * CONFIG.canvas.height;
        const pinkyMcpX = Utils.getMirroredX(pinkyMcp.x);
        const pinkyMcpY = pinkyMcp.y * CONFIG.canvas.height;
        
        const handSize = Utils.calculateDistance(indexMcpX, indexMcpY, pinkyMcpX, pinkyMcpY) || 1;
        
        const indexTipX = Utils.getMirroredX(landmarks[8].x);
        const indexTipY = landmarks[8].y * CONFIG.canvas.height;
        const middleTipX = Utils.getMirroredX(landmarks[12].x);
        const middleTipY = landmarks[12].y * CONFIG.canvas.height;
        const ringTipX = Utils.getMirroredX(landmarks[16].x);
        const ringTipY = landmarks[16].y * CONFIG.canvas.height;
        const pinkyTipX = Utils.getMirroredX(landmarks[20].x);
        const pinkyTipY = landmarks[20].y * CONFIG.canvas.height;
        
        const d1 = Math.hypot(indexTipX - indexMcpX, indexTipY - indexMcpY) / handSize;
        const d2 = Math.hypot(middleTipX - Utils.getMirroredX(middleMcp.x), middleTipY - middleMcp.y * CONFIG.canvas.height) / handSize;
        const d3 = Math.hypot(ringTipX - Utils.getMirroredX(ringMcp.x), ringTipY - ringMcp.y * CONFIG.canvas.height) / handSize;
        const d4 = Math.hypot(pinkyTipX - pinkyMcpX, pinkyTipY - pinkyMcpY) / handSize;
        
        return d1 < CONFIG.thresholds.fist && d2 < CONFIG.thresholds.fist && d3 < CONFIG.thresholds.fist && d4 < CONFIG.thresholds.fist;
    },
    
    // 检测捏合手势
    detectPinch(thumb, index) {
        const thumbX = Utils.getMirroredX(thumb.x);
        const thumbY = thumb.y * CONFIG.canvas.height;
        const indexX = Utils.getMirroredX(index.x);
        const indexY = index.y * CONFIG.canvas.height;
        
        return Utils.calculateDistance(thumbX, thumbY, indexX, indexY);
    },
    
    // 检测颜色切换手势
    detectColorChange(thumb, middle) {
        const thumbX = Utils.getMirroredX(thumb.x);
        const thumbY = thumb.y * CONFIG.canvas.height;
        const middleX = Utils.getMirroredX(middle.x);
        const middleY = middle.y * CONFIG.canvas.height;
        
        return Utils.calculateDistance(thumbX, thumbY, middleX, middleY);
    },
    
    // MediaPipe结果处理
    onResults(results) {
        CameraManager.markAnalysisFrame();

        if (StateManager.app.countdown || StateManager.app.saving) {
            CameraManager.drawVideoOnly({ force: true });
            return;
        }

        if (!StateManager.app.initialized) return;

        // 性能优化:限制手势处理频率到约20fps (50ms间隔)
        const now = Date.now();
        if (!this.lastProcessTime) {
            this.lastProcessTime = 0;
        }

        const shouldProcess = (now - this.lastProcessTime) > 50;  // ~20fps

        // 绘制视频和画布(保持流畅)
        const ctx = DomManager.elements.ctx;
        ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-CONFIG.canvas.width, 0);
        ctx.drawImage(DomManager.elements.video, 0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        ctx.restore();

        ctx.drawImage(DomManager.paintCanvas, 0, 0);

        // 更新冷却时间(每次都更新)
        StateManager.updateCooldowns();

        // 如果不需要处理手势,提前返回
        if (!shouldProcess) {
            return;
        }

        this.lastProcessTime = now;

        let clearCanvas = false;
        const detectedThisFrame = [false, false];
        const currentColor = StateManager.getCurrentColor();

        let leftLandmarks = null, rightLandmarks = null;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarksArray = results.multiHandLandmarks;
            const handednessArray = results.multiHandedness;

            for (let i = 0; i < landmarksArray.length; i++) {
                const landmarks = landmarksArray[i];
                const handedness = handednessArray[i];
                const handIndex = Math.min(i, 1);
                detectedThisFrame[handIndex] = true;

                // 绘制手部关键点和连线
                DrawingManager.drawHandWithCurrentColor(landmarks, currentColor);

                // 识别左右手
                const handType = handedness?.label?.toLowerCase() || '';
                if (handType.includes('left')) {
                    leftLandmarks = landmarks;
                } else if (handType.includes('right')) {
                    rightLandmarks = landmarks;
                }

                // 手势检测
                this.processHandGestures(landmarks, handIndex);

                // 检查握拳清空画布
                const isFist = this.detectFist(landmarks);
                const pinchDist = this.detectPinch(landmarks[4], landmarks[8]);

                if (isFist && pinchDist >= CONFIG.thresholds.pinch) {
                    clearCanvas = true;
                }
            }

            // 双手手势检测
            this.processTwoHandGestures(leftLandmarks, rightLandmarks);

        } else {
            // 没有检测到手
            UIManager.hideAllIndicators();
            StateManager.resetHands();
            if (StateManager.gesture.cross.active) {
                UIManager.stopCrossGesture();
            }
            if (EffectManager.activeEffectName) {
                EffectManager.stopCurrent();
            }
        }
        
        // 重置未检测到的手的状态
        for (let i = 0; i < 2; i++) {
            if (!detectedThisFrame[i]) {
                StateManager.hands[i].prevX = null;
                StateManager.hands[i].prevY = null;
                StateManager.hands[i].colorChangeTriggered = false;
                StateManager.hands[i].smoothX = null;
                StateManager.hands[i].smoothY = null;
                StateManager.hands[i].lastMidX = null;
                StateManager.hands[i].lastMidY = null;
            }
        }
        
        // 清空画布
        if (clearCanvas) {
            DrawingManager.clearCanvas();
            EffectManager.resetHeartGesture();
        }
    },
    
    // 处理单手手势
    processHandGestures(landmarks, handIndex) {
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];
        
        // 颜色切换检测
        const colorPinchDist = this.detectColorChange(thumb, middle);
        if (colorPinchDist < CONFIG.thresholds.colorChange) {
            if (StateManager.canChangeColor(handIndex)) {
                UIManager.changeColor();
                StateManager.setColorChangeCooldown(handIndex);
            }
        } else {
            StateManager.hands[handIndex].colorChangeTriggered = false;
        }
        
        // 绘画检测
        const pinchDist = this.detectPinch(thumb, index);
        DrawingManager.handleDrawing(landmarks, handIndex, pinchDist);
    },
    
    // 处理双手手势
    processTwoHandGestures(leftLandmarks, rightLandmarks) {
        const crossGesture = GestureDefinitions.cross.check(leftLandmarks, rightLandmarks);
        if (crossGesture && crossGesture.detected) {
            DrawingManager.drawCrossFrame(crossGesture.points);
            UIManager.updateCrossFrameIndicator(crossGesture.points);

            if (!StateManager.gesture.cross.active) {
                UIManager.startCrossGesture();
            } else {
                UIManager.updateSaveProgress();
            }

            if (EffectManager.activeEffectName) {
                EffectManager.stopCurrent();
            }
            return;
        }

        if (StateManager.gesture.cross.active) {
            UIManager.stopCrossGesture();
        }

        // 1. 按明确优先级检测可视化特效。
        let detectedGesture = null;
        const effectGestureOrder = ['heart', 'rock', 'victory'];

        for (const name of effectGestureOrder) {
            const definition = GestureDefinitions[name];
            if (!definition) continue;

            const result = definition.check(leftLandmarks, rightLandmarks);
            if (result && result.detected) {
                detectedGesture = result;
                break;
            }
        }

        // 2. 状态管理与特效触发
        if (detectedGesture) {
            if (detectedGesture.name === 'heart') {
                DrawingManager.drawHeartConnection(detectedGesture.points, 1);
                UIManager.updateHeartIndicator(detectedGesture.points);
            } else {
                DomManager.hideElement(DomManager.elements.heartIndicator);
            }

            // 检测到手势 -> 触发/更新特效
            EffectManager.trigger(detectedGesture.name, detectedGesture);
            
            // 兼容旧的 StateManager，防止其他部分报错（可选）
            if (detectedGesture.name === 'heart') {
                StateManager.gesture.heart.active = true;
                StateManager.gesture.heart.startTime = Date.now();
            }
        } else {
            DomManager.hideElement(DomManager.elements.heartIndicator);

            if (EffectManager.activeEffectName) {
                const stoppedName = EffectManager.stopCurrent();
                
                // 兼容旧状态
                if (stoppedName === 'heart') {
                    StateManager.gesture.heart.active = false;
                }
            }
        }
    },

    // 检测爱心手势 (旧方法，保留用于参考，不再调用)
    detectHeartGesture(leftLandmarks, rightLandmarks) {
        // ... 已废弃，逻辑移至 GestureDefinitions.heart
        return null; 
    },

    // 检测相框手势 (旧方法，保留用于参考，不再调用)
    detectCrossFrame(leftLandmarks, rightLandmarks) {
        // ... 已废弃，逻辑移至 GestureDefinitions.cross
        return null;
    }
};
