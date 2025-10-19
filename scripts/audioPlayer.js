class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.previousVolume = 0.3;
        this.isFirstLoad = true;
        
        // 音乐列表 - 在这里添加更多音乐
        this.audioSources = [
            {
                url: 'http://music.163.com/song/media/outer/url?id=2742468679.mp3',
                name: '音乐1'
            },
            {
                url: 'http://music.163.com/song/media/outer/url?id=2672191019.mp3',
                name: '音乐2'
            },
            {
                url: 'http://music.163.com/song/media/outer/url?id=2736706230.mp3',
                name: '音乐3'
            },
            
            // 在这里添加更多音乐，格式如下：
            // {
            //     url: 'http://music.163.com/song/media/outer/url?id=XXXXXX.mp3',
            //     name: '音乐名称'
            // }
        ];
        
        this.audioSourceIndex = 0;
        this.setupAudio();
    }

    setupAudio() {
        if (!window.Audio) {
            console.warn('浏览器不支持音频播放');
            return;
        }

        // 先尝试恢复之前的播放状态（包括音乐索引）
        this.restorePlaybackState();
        
        const audioPath = this.getAudioPath();
        console.log('尝试加载音频:', audioPath);
        
        this.audio = new Audio(audioPath);
        this.audio.loop = true;
        this.audio.volume = 0.3;
        
        this.audio.addEventListener('error', (e) => {
            console.error('音频加载失败');
            console.error('音频源:', this.audio.src);
            console.error('当前页面URL:', window.location.href);
            if (this.audio.error) {
                console.error('错误代码:', this.audio.error.code);
                console.error('错误信息:', this.audio.error.message);
            }
        });
        
        this.audio.addEventListener('loadeddata', () => {
            console.log('音频加载成功');
            // 恢复播放进度
            const savedState = sessionStorage.getItem('audioPlaybackState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    if (state.currentTime > 0) {
                        this.audio.currentTime = state.currentTime;
                    }
                } catch (error) {
                    console.warn('恢复播放进度失败:', error);
                }
            }
        });
        
        this.isInitialized = true;
        this.tryPlay();
        
        // 立即尝试设置监听器，如果失败则等待 DOM 加载完成
        this.setupEventListeners();
        
        window.addEventListener('beforeunload', () => {
            this.savePlaybackState();
        });
    }
    
    setupEventListeners() {
        // 设置静音按钮监听器
        this.setupMuteButtonListener();
        // 设置音频源切换按钮监听器
        this.setupAudioSourceButtonListener();
        // 更新UI显示
        this.updateAllUI();
    }
    
    updateAllUI() {
        this.updateMuteButton();
        this.updateAudioSourceButton();
        this.updateMusicTitle();
        this.updateVolumeSlider();
    }
    
    getAudioPath() {
        // 确保索引在有效范围内
        if (this.audioSourceIndex < 0 || this.audioSourceIndex >= this.audioSources.length) {
            this.audioSourceIndex = 0;
        }
        return this.audioSources[this.audioSourceIndex].url;
    }
    
    getCurrentMusicName() {
        if (this.audioSourceIndex >= 0 && this.audioSourceIndex < this.audioSources.length) {
            return this.audioSources[this.audioSourceIndex].name;
        }
        return '背景音乐';
    }

    tryPlay() {
        if (!this.audio) return;
        
        const savedState = sessionStorage.getItem('audioPlaybackState');
        let shouldAutoPlay = true;
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (!state.wasPlaying) {
                    shouldAutoPlay = false;
                }
            } catch (error) {
                console.warn('解析播放状态失败:', error);
            }
        }
        
        if (!shouldAutoPlay) {
            console.log('检测到之前未播放，等待用户交互');
            this.setupUserInteractionListener();
            return;
        }
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('音乐开始播放');
            }).catch(error => {
                console.warn('自动播放失败，等待用户交互:', error);
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
            
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
    }

    toggleMute() {
        if (!this.audio) return;
        
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
        } else {
            this.audio.volume = this.previousVolume;
        }
        
        this.updateMuteButton();
        this.updateVolumeSlider();
        
        return this.isMuted;
    }

    setupMuteButtonListener() {
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            // 移除可能存在的旧监听器
            muteButton.replaceWith(muteButton.cloneNode(true));
            const newMuteButton = document.getElementById('mute-button');
            newMuteButton.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    setupAudioSourceButtonListener() {
        const toggleButton = document.getElementById('toggle-audio-source');
        if (toggleButton) {
            // 移除可能存在的旧监听器
            toggleButton.replaceWith(toggleButton.cloneNode(true));
            const newToggleButton = document.getElementById('toggle-audio-source');
            newToggleButton.addEventListener('click', () => {
                this.toggleAudioSource();
            });
        }
    }

    updateMuteButton() {
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }

    updateVolumeSlider() {
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.isMuted ? 0 : this.previousVolume;
        }
    }

    toggleAudioSource() {
        // 循环切换到下一个音频源
        this.audioSourceIndex = (this.audioSourceIndex + 1) % this.audioSources.length;
        
        const wasPlaying = this.audio && !this.audio.paused;
        const currentTime = this.audio ? this.audio.currentTime : 0;
        
        if (this.audio) {
            this.audio.pause();
            this.audio.src = this.getAudioPath();
            
            if (wasPlaying) {
                this.audio.addEventListener('loadeddata', () => {
                    this.audio.play().catch(e => console.error('播放失败:', e));
                }, { once: true });
            }
        }
        
        this.updateAudioSourceButton();
        this.updateMusicTitle();
        
        // 立即保存状态，确保切换音乐后立即保存
        this.savePlaybackState();
        
        return this.audioSourceIndex;
    }
    
    updateAudioSourceButton() {
        const toggleButton = document.getElementById('toggle-audio-source');
        if (toggleButton) {
            toggleButton.textContent = `🎵${this.audioSourceIndex + 1}`;
        }
    }
    
    updateMusicTitle() {
        const titleElement = document.querySelector('.music-title');
        if (titleElement) {
            titleElement.textContent = this.getCurrentMusicName();
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
        
        if (this.isMuted && newVolume > 0) {
            this.isMuted = false;
            this.previousVolume = newVolume;
        } 
        else if (newVolume === 0 && !this.isMuted) {
            this.isMuted = true;
        }
        else if (!this.isMuted) {
            this.previousVolume = newVolume;
        }
        
        this.audio.volume = newVolume;
        this.updateMuteButton();
    }

    isPlaying() {
        return this.audio && !this.audio.paused;
    }

    savePlaybackState() {
        if (!this.audio) return;
        
        const playbackState = {
            currentTime: this.audio.currentTime,
            volume: this.audio.volume,
            isMuted: this.isMuted,
            previousVolume: this.previousVolume,
            wasPlaying: !this.audio.paused && !this.isMuted,
            audioSourceIndex: this.audioSourceIndex  // 保存当前音乐索引
        };
        
        sessionStorage.setItem('audioPlaybackState', JSON.stringify(playbackState));
    }

    restorePlaybackState() {
        const savedState = sessionStorage.getItem('audioPlaybackState');
        if (!savedState) return;
        
        try {
            const state = JSON.parse(savedState);
            
            // 恢复音乐索引
            if (typeof state.audioSourceIndex === 'number') {
                this.audioSourceIndex = state.audioSourceIndex;
            }
            
            // 恢复音量和静音状态
            this.previousVolume = state.previousVolume || 0.3;
            this.isMuted = state.isMuted || false;
            
            if (this.audio) {
                if (state.currentTime > 0) {
                    this.audio.currentTime = state.currentTime;
                }
                
                if (this.isMuted) {
                    this.audio.volume = 0;
                } else {
                    this.audio.volume = state.volume || 0.3;
                }
            }
        } catch (error) {
            console.warn('恢复播放状态失败:', error);
        }
    }
}

// 创建全局播放器实例
window.audioPlayer = new AudioPlayer();

// 当 header 加载完成后，更新 UI
window.addEventListener('headerLoaded', () => {
    if (window.audioPlayer) {
        window.audioPlayer.setupEventListeners();
    }
});

// 页面加载完成后设置播放器UI
window.addEventListener('DOMContentLoaded', () => {
    setupAudioPlayerUI();
});

function setupAudioPlayerUI() {
    const playerContainer = document.createElement('div');
    playerContainer.id = 'audio-player';
    playerContainer.innerHTML = `
        <div class="player-controls">
            <button id="play-pause-btn" class="player-btn">🔇</button>
            <button id="toggle-audio-source-player" class="player-btn">🎵1</button>
            <div class="volume-slider-container">
                <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="0.3">
            </div>
            <span class="music-title">${window.audioPlayer.getCurrentMusicName()}</span>
        </div>
    `;
    
    document.body.appendChild(playerContainer);
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const toggleButtonPlayer = document.getElementById('toggle-audio-source-player');
    
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
        
        const savedState = sessionStorage.getItem('audioPlaybackState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                volumeSlider.value = state.isMuted ? 0 : (state.volume || 0.3);
            } catch (error) {
                console.warn('恢复音量滑块状态失败:', error);
            }
        }
    }
    
    if (toggleButtonPlayer) {
        toggleButtonPlayer.addEventListener('click', () => {
            window.audioPlayer.toggleAudioSource();
            // 同步更新播放器上的按钮
            toggleButtonPlayer.textContent = `🎵${window.audioPlayer.audioSourceIndex + 1}`;
        });
        // 更新按钮显示
        toggleButtonPlayer.textContent = `🎵${window.audioPlayer.audioSourceIndex + 1}`;  
    }
    
    function updatePlayButton() {
        if (!playPauseBtn) return;
        playPauseBtn.textContent = window.audioPlayer.isPlaying() ? '🔊' : '🔇';
    }
    
    updatePlayButton();
}
