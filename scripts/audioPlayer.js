class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.previousVolume = 0.3; // 存储静音前的音量
        this.setupAudio();
    }

    setupAudio() {
        // 检查浏览器是否支持Audio API
        if (!window.Audio) {
            console.warn('浏览器不支持音频播放');
            return;
        }

        // 创建音频元素
        this.audio = new Audio('/resources/BATTLEPLAN_ARCLIGHT.mp3');
        this.audio.loop = true; // 设置循环播放
        this.audio.volume = 0.3; // 设置初始音量为30%
        
        this.isInitialized = true;
        
        // 尝试播放，处理浏览器自动播放策略限制
        this.tryPlay();
        
        // 设置静音按钮事件监听
        this.setupMuteButtonListener();
    }

    tryPlay() {
        if (!this.audio) return;
        
        // 尝试播放，处理浏览器的自动播放策略限制
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('音乐开始播放');
            }).catch(error => {
                console.warn('自动播放失败，等待用户交互:', error);
                // 添加用户交互监听，一旦用户交互就开始播放
                this.setupUserInteractionListener();
            });
        }
    }

    setupUserInteractionListener() {
        const playOnInteraction = () => {
            if (!this.audio || !this.audio.paused) return;
            
            const playPromise = this.audio.play();
            if (playPromise) {
                playPromise.catch(e => console.error('播放失败:', e));
            }
            
            // 移除监听器，避免重复添加
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
    }

    // 添加静音控制方法
    toggleMute() {
        if (!this.audio) return;
        
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
        } else {
            this.audio.volume = this.previousVolume;
        }
        
        // 更新UI
        this.updateMuteButton();
        this.updateVolumeSlider();
        
        return this.isMuted;
    }

    // 设置静音按钮监听器
    setupMuteButtonListener() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachMuteButtonEvent());
        } else {
            this.attachMuteButtonEvent();
        }
    }

    attachMuteButtonEvent() {
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    // 更新静音按钮显示
    updateMuteButton() {
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }

    // 更新音量滑块
    updateVolumeSlider() {
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.isMuted ? 0 : this.previousVolume;
        }
    }

    togglePlay() {
        if (!this.audio) return;
        
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    setVolume(volume) {
        if (!this.audio) return;
        
        const newVolume = Math.max(0, Math.min(1, volume));
        
        // 如果当前是静音状态且设置了非零音量，则取消静音
        if (this.isMuted && newVolume > 0) {
            this.isMuted = false;
            this.previousVolume = newVolume;
        } 
        // 如果设置了零音量，则进入静音状态
        else if (newVolume === 0 && !this.isMuted) {
            this.isMuted = true;
            // 不需要更新previousVolume，因为用户是明确设置为0
        }
        // 如果不是静音状态且设置了非零音量，更新音量
        else if (!this.isMuted) {
            this.previousVolume = newVolume;
        }
        
        this.audio.volume = newVolume;
        
        // 更新UI
        this.updateMuteButton();
    }

    isPlaying() {
        return this.audio && !this.audio.paused;
    }
}

// 创建全局播放器实例
window.audioPlayer = new AudioPlayer();

// 页面加载完成后设置播放器UI
window.addEventListener('DOMContentLoaded', () => {
    setupAudioPlayerUI();
});

function setupAudioPlayerUI() {
    // 创建播放器控制界面
    const playerContainer = document.createElement('div');
    playerContainer.id = 'audio-player';
    playerContainer.innerHTML = `
        <div class="player-controls">
            <button id="play-pause-btn" class="player-btn">🔇</button>
            <div class="volume-slider-container">
                <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="0.3">
            </div>
            <span class="music-title">背景音乐</span>
        </div>
    `;
    
    document.body.appendChild(playerContainer);
    
    // 添加控制事件
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            window.audioPlayer.togglePlay();
            updatePlayButton();
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            window.audioPlayer.setVolume(parseFloat(e.target.value));
        });
    }
    
    // 更新播放按钮状态
    function updatePlayButton() {
        if (!playPauseBtn) return;
        playPauseBtn.textContent = window.audioPlayer.isPlaying() ? '🔊' : '🔇';
    }
    
    // 初始化播放按钮状态
    updatePlayButton();
}