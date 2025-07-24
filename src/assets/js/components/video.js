/* 
	================================================
	  
	Вставка видео
	
	================================================
*/

export function video() {
	class LazyVideo {
		constructor(videoUrl, options = {}) {
			let defaultOptions = {
				isFile: false,
			};

			this.options = Object.assign(defaultOptions, options);
			this.isFile = options.isFile;
			this.container = options.container;
			this.videoUrl = this.normalizeUrl(videoUrl);

			if (this.container) {
				this.thumbnail = this.container.querySelector('.video__thumbnail');
				this.playButton = this.container.querySelector('.video__play');
			} else {
				console.error('Ошибка: не найден блок .video');
				return;
			}

			this.check();
			this.init();
		}

		check() {
			if (!this.videoUrl) {
				console.error('Ошибка: не указан адрес видео');
				return;
			}

			if (!this.playButton) {
				console.error('Ошибка: не найдена кнопка');
				return;
			}
		}

		init() {
			this.playButton?.addEventListener('click', () => this.loadVideo());
		}

		loadVideo() {
			this.thumbnail.remove();
			this.playButton.remove();

			if (this.isFile) {
				const video = document.createElement('video');
				video.src = this.videoUrl;
				video.controls = true;
				video.autoplay = true;
				this.container.appendChild(video);
			} else {
				const iframe = document.createElement('iframe');
				iframe.src = `${this.videoUrl}${this.videoUrl.includes('?') ? '&' : '?'}autoplay=1`;
				iframe.allow = 'autoplay; encrypted-media';
				iframe.allowFullscreen = true;
				this.container.appendChild(iframe);
			}
		}

		normalizeUrl(url) {
			// vkvideo.ru короткий формат
			const vkShortRegex = /^https:\/\/vkvideo\.ru\/video(\d+)_(\d+)$/;
			const vkMatch = url.match(vkShortRegex);
			if (vkMatch) {
				const oid = vkMatch[1];
				const id = vkMatch[2];
				return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&hd=2`;
			}

			// rutube.ru обычный видео-URL
			const rutubeRegex = /^https:\/\/rutube\.ru\/video\/([a-z0-9]+)\/?$/i;
			const rutubeMatch = url.match(rutubeRegex);
			if (rutubeMatch) {
				const id = rutubeMatch[1];
				return `https://rutube.ru/play/embed/${id}`;
			}

			return url;
		}
	}

	const videos = document.querySelectorAll('.video');

	if (videos) {
		videos.forEach(video => {
			const videoUrl = video.dataset.url;

			const isFile = (() => {
				try {
					const url = new URL(videoUrl, window.location.origin);
					return url.origin === window.location.origin;
				} catch {
					return true;
				}
			})();

			new LazyVideo(videoUrl, {
				container: video,
				isFile: isFile
			});
		});
	}
}
