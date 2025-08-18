(function () {
	'use strict';

	// 
	// 
	// 
	// 
	// Переменные 
	const body = document.querySelector('body');
	const html = document.querySelector('html');
	const popup$1 = document.querySelectorAll('.popup');

	const headerTop = document.querySelector('.header') ? document.querySelector('.header') : document.querySelector('head');
	const headerTopFixed = 'header_fixed';
	let fixedElements = document.querySelectorAll('[data-fixed]');
	let stickyObservers = new Map();

	const menuClass = '.header__mobile';
	const menu = document.querySelector(menuClass) ? document.querySelector(menuClass) : document.querySelector('head');
	const menuLink = document.querySelector('.menu-link') ? document.querySelector('.menu-link') : document.querySelector('head');
	const menuActive = 'active';

	const burgerMedia = 767;
	const bodyOpenModalClass = 'popup-show';

	let windowWidth = window.innerWidth;
	document.querySelector('.container')?.offsetWidth || 0;

	const checkWindowWidth = () => {
		windowWidth = window.innerWidth;
		document.querySelector('.container')?.offsetWidth || 0;
	};

	//
	//  
	//
	//
	// Проверки

	// Проверка на мобильное устройство
	function isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
	}

	// Проверка на десктоп разрешение 
	function isDesktop() {
		return windowWidth > burgerMedia
	}

	// Проверка поддержки webp 
	function checkWebp() {
		const webP = new Image();
		webP.onload = webP.onerror = function () {
			if (webP.height !== 2) {
				document.querySelectorAll('[style]').forEach(item => {
					const styleAttr = item.getAttribute('style');
					if (styleAttr.indexOf('background-image') === 0) {
						item.setAttribute('style', styleAttr.replace('.webp', '.jpg'));
					}
				});
			}
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	// Проверка на браузер safari
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	// Проверка есть ли скролл 
	function haveScroll() {
		return document.documentElement.scrollHeight !== document.documentElement.clientHeight
	}

	// Видимость элемента
	function isHidden(el) {
		return window.getComputedStyle(el).display === 'none'
	}

	// Закрытие бургера на десктопе
	function checkBurgerAndMenu() {
		if (isDesktop()) {
			menuLink.classList.remove('active');
			if (menu) {
				menu.classList.remove(menuActive);
				if (!body.classList.contains(bodyOpenModalClass)) {
					body.classList.remove('no-scroll');
				}
			}
		}

		if (html.classList.contains('lg-on')) {
			if (isMobile()) {
				body.style.paddingRight = '0';
			} else {
				body.style.paddingRight = getScrollBarWidth() + 'px';
			}
		}
	}

	// Получение объектов с медиа-запросами
	function dataMediaQueries(array, dataSetValue) {
		let media = Array.from(array).filter(function (item) {
			if (item.dataset[dataSetValue]) {
				return item.dataset[dataSetValue].split(",")[0]
			}
		});

		if (media.length) {
			let breakpointsArray = [];
			media.forEach(item => {
				let params = item.dataset[dataSetValue];
				let breakpoint = {};
				let paramsArray = params.split(",");
				breakpoint.value = paramsArray[0];
				breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
				breakpoint.item = item;
				breakpointsArray.push(breakpoint);
			});

			let mdQueries = breakpointsArray.map(function (item) {
				return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type
			});

			mdQueries = uniqArray(mdQueries);
			let mdQueriesArray = [];

			if (mdQueries.length) {
				mdQueries.forEach(breakpoint => {
					let paramsArray = breakpoint.split(",");
					let mediaBreakpoint = paramsArray[1];
					let mediaType = paramsArray[2];
					let matchMedia = window.matchMedia(paramsArray[0]);

					let itemsArray = breakpointsArray.filter(function (item) {
						return item.value === mediaBreakpoint && item.type === mediaType
					});

					mdQueriesArray.push({ itemsArray, matchMedia });
				});

				return mdQueriesArray
			}
		}
	}

	// Задержка при вызове функции. Выполняется в конце
	function debounce(fn, delay) {
		let timer;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, arguments), delay);
		};
	}

	// Задержка при вызове функции. Выполняется раз в delay мс
	function throttle(fn, delay) {
		let lastCall = 0;
		return function (...args) {
			const now = Date.now();
			if (now - lastCall >= delay) {
				lastCall = now;
				fn.apply(this, args);
			}
		};
	}

	// Закрытие элемента при клике вне него
	function closeOutClick(closedElement, clickedButton, clickedButtonActiveClass, callback) {
		document.addEventListener('click', (e) => {
			const button = document.querySelector(clickedButton);
			const element = document.querySelector(closedElement);
			const withinBoundaries = e.composedPath().includes(element);

			if (!withinBoundaries && button?.classList.contains(clickedButtonActiveClass) && e.target !== button) {
				element.classList.remove('active');
				button.classList.remove(clickedButtonActiveClass);
			}
		});
	}

	// Плавный скролл
	function scrollToSmoothly(pos, time = 400) {
		const currentPos = window.pageYOffset;
		let start = null;
		window.requestAnimationFrame(function step(currentTime) {
			start = !start ? currentTime : start;
			const progress = currentTime - start;
			if (currentPos < pos) {
				window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
			} else {
				window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
			}
			if (progress < time) {
				window.requestAnimationFrame(step);
			} else {
				window.scrollTo(0, pos);
			}
		});
	}

	window.addEventListener('resize', debounce(checkWindowWidth, 100));


	//
	//
	//
	//
	// Позиционирование

	// Отступ элемента от краев страницы
	function offset(el) {
		var rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		return {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft,
			right: windowWidth - rect.width - (rect.left + scrollLeft),
		}
	}


	// Добавление элементу обертки
	let wrap = (query, tag, wrapContent = false) => {
		let elements;

		let tagName = tag.split('.')[0] || 'div';
		let tagClass = tag.split('.').slice(1);
		tagClass = tagClass.length > 0 ? tagClass : [];

		{
			elements = document.querySelectorAll(query);
		}

		function createWrapElement(item) {
			let newElement = document.createElement(tagName);
			if (tagClass.length) {
				newElement.classList.add(...tagClass);
			}

			if (wrapContent) {
				while (item.firstChild) {
					newElement.appendChild(item.firstChild);
				}
				item.appendChild(newElement);
			} else {
				item.parentElement.insertBefore(newElement, item);
				newElement.appendChild(item);
			}
		}

		if (elements.length) {
			for (let i = 0; i < elements.length; i++) {
				createWrapElement(elements[i]);
			}
		} else {
			if (elements.parentElement) {
				createWrapElement(elements);
			}
		}
	};

	wrap('table', '.table');

	// Изменение ссылок в меню 
	if (!document.querySelector('body').classList.contains('home') && document.querySelector('body').classList.contains('wp')) {
		let menu = document.querySelectorAll('.menu li a');

		for (let i = 0; i < menu.length; i++) {
			if (menu[i].getAttribute('href').indexOf('#') > -1) {
				menu[i].setAttribute('href', '/' + menu[i].getAttribute('href'));
			}
		}
	}

	// Добавление класса loaded после полной загрузки страницы
	function loaded() {
		document.addEventListener('DOMContentLoaded', function () {
			html.classList.add('loaded');
			if (document.querySelector('header')) {
				document.querySelector('header').classList.add('loaded');
			}
			if (haveScroll()) {
				setTimeout(() => {
					html.classList.remove('scrollbar-auto');
				}, 500);
			}
		});
	}

	// Для локалки
	if (window.location.hostname == 'localhost' || window.location.hostname.includes('192.168')) {
		document.querySelectorAll('.logo, .crumbs>li:first-child>a').forEach(logo => {
			logo.setAttribute('href', '/');
		});

		document.querySelectorAll('.menu a').forEach(item => {
			let firstSlash = 0;
			let lastSlash = 0;

			if (item.href.split('/').length - 1 == 4) {
				for (let i = 0; i < item.href.length; i++) {
					if (item.href[i] == '/') {
						if (i > 6 && firstSlash == 0) {
							firstSlash = i;
							continue
						}

						if (i > 6 && lastSlash == 0) {
							lastSlash = i;
						}
					}
				}

				let newLink = '';
				let removeProjectName = '';

				for (let i = 0; i < item.href.length; i++) {
					if (i > firstSlash && i < lastSlash + 1) {
						removeProjectName += item.href[i];
					}
				}

				newLink = item.href.replace(removeProjectName, '');
				item.href = newLink;
			}
		});
	}

	// Расчет высоты шапки
	function setHeaderFixedHeight() {
		if (!headerTop) return;

		requestAnimationFrame(() => {
			const height = headerTop.offsetHeight;

			document.documentElement.style.setProperty('--headerFixedHeight', height + 'px');
		});
	}

	document.addEventListener('DOMContentLoaded', setHeaderFixedHeight);
	if (window.ResizeObserver) {
		const ro = new ResizeObserver(() => {
			setHeaderFixedHeight();
		});
		ro.observe(headerTop);
	}

	// Проверка на браузер safari
	if (isSafari) document.documentElement.classList.add('safari');

	// Проверка поддержки webp 
	checkWebp();

	// Закрытие бургера на десктопе
	window.addEventListener('resize', debounce(checkBurgerAndMenu, 100));
	checkBurgerAndMenu();

	// Добавление класса loaded при загрузке страницы
	loaded();

	/* 
		================================================
		  
		Фиксированное меню
		
		================================================
	*/

	function fixedMenu() {
		if (!headerTop) return;

		const isFixed = isDesktop() && window.scrollY > 200;

		if (isFixed) {
			headerTop.classList.add(headerTopFixed);
		} else {
			headerTop.classList.remove(headerTopFixed);
		}
	}

	window.addEventListener('scroll', throttle(fixedMenu, 100));
	window.addEventListener('resize', throttle(fixedMenu, 100));

	// 
	// 
	// 
	// 
	// Функции для работы со скроллом и скроллбаром

	// Скрытие скроллбара
	function hideScrollbar() {
		// changeScrollbarGutter()

		popup$1.forEach(element => {
			element.style.display = 'none';
		});

		if (haveScroll()) {
			body.classList.add('no-scroll');
		}

		changeScrollbarPadding();
	}

	function showScrollbar() {
		if (!menu.classList.contains(menuActive)) {
			body.classList.remove('no-scroll');
		}

		changeScrollbarPadding(false);

		// if (haveScroll()) {
		// 	body.classList.add('scrollbar-auto')
		// 	html.classList.add('scrollbar-auto')
		// }
	}

	// Ширина скроллбара
	function getScrollBarWidth$1() {
		let div = document.createElement('div');
		div.style.overflowY = 'scroll';
		div.style.width = '50px';
		div.style.height = '50px';
		document.body.append(div);
		let scrollWidth = div.offsetWidth - div.clientWidth;
		div.remove();

		if (haveScroll()) {
			return scrollWidth
		} else {
			return 0
		}
	}

	// Добавление и удаление отступа у body и фиксированных элементов
	function changeScrollbarPadding(add = true) {
		const scrollbarPadding = getScrollBarWidth$1() + 'px';

		fixedElements.forEach(elem => {
			const position = window.getComputedStyle(elem).position;

			if (position === 'sticky') {
				if (add) {
					if (!stickyObservers.has(elem)) {
						const observer = new IntersectionObserver(([entry]) => {
							if (!entry.isIntersecting) {
								elem.style.paddingRight = scrollbarPadding;
							} else {
								elem.style.paddingRight = '0';
							}
						}, {
							threshold: [1]
						});
						observer.observe(elem);
						stickyObservers.set(elem, observer);
					}
				} else {
					elem.style.paddingRight = '0';
					const observer = stickyObservers.get(elem);
					if (observer) {
						observer.unobserve(elem);
						stickyObservers.delete(elem);
					}
				}
			} else {
				elem.style.paddingRight = add ? scrollbarPadding : '0';
			}
		});

		if (isSafari) {
			body.style.paddingRight = add ? scrollbarPadding : '0';
		}
	}

	/* 
		================================================
		  
		Бургер
		
		================================================
	*/

	function burger() {
		if (menuLink) {
			let isAnimating = false;

			menuLink.addEventListener('click', function (e) {
				if (isAnimating) return
				isAnimating = true;

				menuLink.classList.toggle('active');
				menu.classList.toggle(menuActive);

				if (menu.classList.contains(menuActive)) {
					hideScrollbar();

					const scrollY = window.scrollY;
					const headerHeight = headerTop.offsetHeight;

					if (scrollY === 0) {
						menu.style.removeProperty('top');
					} else if (scrollY < headerHeight) {
						menu.style.top = scrollY + 'px';
					} else {
						const headerRect = headerTop.getBoundingClientRect();
						menu.style.top = headerRect.bottom + 'px';
					}
				} else {
					setTimeout(() => {
						showScrollbar();
					}, 400);
				}

				setTimeout(() => {
					isAnimating = false;
				}, 500);
			});



			function checkHeaderOffset() {
				if (isMobile()) {
					changeScrollbarPadding(false);
				} else {
					if (body.classList.contains(bodyOpenModalClass)) {
						changeScrollbarPadding();
					}
				}

				if (isDesktop()) {
					menu.removeAttribute('style');

					if (!body.classList.contains(bodyOpenModalClass)) {
						body.classList.remove('no-scroll');

						if (isSafari) {
							changeScrollbarPadding(false);
						}
					}
				}
			}

			window.addEventListener('resize', debounce(checkHeaderOffset, 50));
			window.addEventListener('resize', debounce(checkHeaderOffset, 150));

			if (document.querySelector('.header__mobile')) {
				closeOutClick('.header__mobile', '.menu-link', 'active');
			}
		}
	}

	//
	//
	//
	//
	// Работа с url

	// Получение хэша
	function getHash() {
		return location.hash ? location.hash.replace('#', '') : '';
	}

	// Удаление хэша
	function removeHash() {
		setTimeout(() => {
			history.pushState("", document.title, window.location.pathname + window.location.search);
		}, 100);
	}

	/* 
		================================================
		  
		Плавная прокрутка
		
		================================================
	*/

	function scroll() {
		let headerScroll = 0;
		const scrollLinks = document.querySelectorAll('.scroll, .menu a');

		if (scrollLinks.length) {
			scrollLinks.forEach(link => {
				link.addEventListener('click', e => {
					const target = link.hash;

					if (target && target !== '#') {
						const scrollBlock = document.querySelector(target);
						e.preventDefault();

						if (scrollBlock) {
							headerScroll = (window.getComputedStyle(scrollBlock).paddingTop === '0px') ? -40 : 0;

							scrollToSmoothly(
								offset(scrollBlock).top - parseInt(headerTop.querySelector('.header-fixed').clientHeight - headerScroll),
								400
							);

							removeHash();
							menu.classList.remove(menuActive);
							menuLink.classList.remove('active');
							body.classList.remove('no-scroll');
						} else {
							let [baseUrl, hash] = link.href.split('#');
							if (window.location.href !== baseUrl && hash) {
								link.setAttribute('href', `${baseUrl}?link=${hash}`);
								window.location = link.getAttribute('href');
							}
						}
					}
				});
			});
		}

		document.addEventListener('DOMContentLoaded', () => {
			const urlParams = new URLSearchParams(window.location.search);
			const link = urlParams.get('link');

			if (link) {
				const scrollBlock = document.getElementById(link);
				if (scrollBlock) {
					headerScroll = (window.getComputedStyle(scrollBlock).paddingTop === '0px') ? -40 : 0;

					scrollToSmoothly(
						offset(scrollBlock).top - parseInt(headerTop.clientHeight - headerScroll),
						400
					);

					urlParams.delete('link');
					window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
				}
			}
		});
	}

	// 
	// 
	// 
	// 
	// Анимации 

	// Плавное появление
	const fadeIn = (el, isItem = false, display, timeout = 400) => {
		document.body.classList.add('_fade');

		let elements = isItem ? el : document.querySelectorAll(el);

		if (elements.length > 0) {
			elements.forEach(element => {
				element.style.opacity = 0;
				element.style.display = 'block';
				element.style.transition = `opacity ${timeout}ms`;
				setTimeout(() => {
					element.style.opacity = 1;
					setTimeout(() => {
						document.body.classList.remove('_fade');
					}, timeout);
				}, 10);
			});
		} else {
			el.style.opacity = 0;
			el.style.display = 'block';
			el.style.transition = `opacity ${timeout}ms`;
			setTimeout(() => {
				el.style.opacity = 1;
				setTimeout(() => {
					document.body.classList.remove('_fade');
				}, timeout);
			}, 10);
		}
	};

	// Плавное исчезание
	const fadeOut = (el, isItem = false, timeout = 400) => {
		document.body.classList.add('_fade');

		let elements = isItem ? el : document.querySelectorAll(el);

		if (elements.length > 0) {
			elements.forEach(element => {
				element.style.opacity = 1;
				element.style.transition = `opacity ${timeout}ms`;
				element.style.opacity = 0;
				setTimeout(() => {
					element.style.display = 'none';
					setTimeout(() => {
						document.body.classList.remove('_fade');
					}, timeout);
				}, timeout);
				setTimeout(() => {
					element.removeAttribute('style');
				}, timeout + 400);
			});
		} else {
			el.style.opacity = 1;
			el.style.transition = `opacity ${timeout}ms`;
			el.style.opacity = 0;
			setTimeout(() => {
				el.style.display = 'none';
				setTimeout(() => {
					document.body.classList.remove('_fade');
				}, timeout);
			}, timeout);
			setTimeout(() => {
				el.removeAttribute('style');
			}, timeout + 400);
		}
	};

	// Плавно скрыть с анимацией слайда 
	const _slideUp = (target, duration = 400, showmore = 0) => {
		if (target && !target.classList.contains('_slide')) {
			target.classList.add('_slide');
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';
			target.style.height = `${target.offsetHeight}px`;
			target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = showmore ? `${showmore}px` : `0px`;
			target.style.paddingBlock = 0;
			target.style.marginBlock = 0;
			window.setTimeout(() => {
				target.style.display = !showmore ? 'none' : 'block';
				!showmore ? target.style.removeProperty('height') : null;
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				!showmore ? target.style.removeProperty('overflow') : null;
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
				target.classList.remove('_slide');
				document.dispatchEvent(new CustomEvent("slideUpDone", {
					detail: {
						target: target
					}
				}));
			}, duration);
		}
	};

	// Плавно показать с анимацией слайда 
	const _slideDown = (target, duration = 400) => {
		if (target && !target.classList.contains('_slide')) {
			target.style.removeProperty('display');
			let display = window.getComputedStyle(target).display;
			if (display === 'none') display = 'block';
			target.style.display = display;
			let height = target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = 0;
			target.style.paddingBLock = 0;
			target.style.marginBlock = 0;
			target.offsetHeight;
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + 'ms';
			target.style.height = height + 'px';
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			window.setTimeout(() => {
				target.style.removeProperty('height');
				target.style.removeProperty('overflow');
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
			}, duration);
		}
	};

	// Плавно изменить состояние между _slideUp и _slideDown
	const _slideToggle = (target, duration = 400) => {
		if (target && isHidden(target)) {
			return _slideDown(target, duration);
		} else {
			return _slideUp(target, duration);
		}
	};

	// Очистка input и textarea при закрытии модалки и отправки формы / Удаление классов ошибки
	let inputs = document.querySelectorAll('input, textarea');

	function clearInputs() {
		inputs.forEach(element => {
			element.classList.remove('wpcf7-not-valid', 'error');
		});
	}

	inputs.forEach(input => {
		const parentElement = input.parentElement;
		const submitButton = input.closest('form')?.querySelector('.submit');

		const updateActiveState = () => {
			if (input.type === 'text' || input.type === 'date') {
				parentElement.classList.toggle('active', input.value.length > 0);
			}
		};

		const resetValidation = () => {
			input.setCustomValidity('');
			submitButton.disabled = false;
		};

		input.addEventListener('keyup', updateActiveState);
		input.addEventListener('change', () => {
			input.classList.remove('wpcf7-not-valid');
			updateActiveState();
		});

		input.addEventListener('input', () => {
			// Форматирование чисел
			if (input.getAttribute('data-number')) {
				input.value = input.value.replace(/\D/g, '').replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
			}

			// Валидация email
			if (input.type === 'email') {
				input.value = input.value.replace(/[^0-9a-zA-Z@.-]+/g, '');
			}

			// Валидация имени
			const nameAttr = input.name?.toLowerCase() || '';
			const placeholder = input.placeholder?.toLowerCase() || '';
			const fioKeywords = ['имя', 'фамилия', 'отчество'];
			const isFIO = nameAttr.includes('name') || fioKeywords.some(word => placeholder.includes(word));

			if (isFIO) {
				input.value = input.value.replace(/[^а-яА-ЯёЁa-zA-Z ]/g, '');
				return;
			}
		});

		if (input.type === 'tel' || input.type === 'email') {
			input.addEventListener('input', resetValidation);
		}
	});

	// Проверка формы перед отправкой
	function initFormValidation(form) {
		// Функция для проверки обязательных полей на выбор
		const checkRequiredChoice = () => {
			let requiredChoice = form.querySelectorAll('[data-required-choice]');
			let hasValue = Array.from(requiredChoice).some(input => input.value.trim() !== '' && input.value !== '+7 ');

			requiredChoice.forEach(input => {
				if (!hasValue) {
					input.setAttribute('required', 'true');
				} else {
					input.removeAttribute('required');
				}
			});
		};

		// Проверка при загрузке страницы
		checkRequiredChoice();

		form.addEventListener('submit', (e) => {
			let isValid = true;

			form.querySelectorAll('input[type="tel"]').forEach(input => {
				const val = input.value.trim();

				const requiredLength = val.startsWith('+7') ? 17 : val.startsWith('8') ? 16 : Infinity;

				if (val.length < requiredLength && val.length > 3) {
					input.setCustomValidity('Телефон должен содержать 11 цифр');
					input.reportValidity();
					isValid = false;
				} else {
					input.setCustomValidity('');
				}
			});

			checkRequiredChoice();

			if (!isValid || !form.checkValidity()) e.preventDefault();
		});

		// Обновление `required` при вводе
		let requiredChoice = form.querySelectorAll('[data-required-choice]');

		requiredChoice.forEach(input => {
			input.addEventListener('input', checkRequiredChoice);
		});
	}

	document.querySelectorAll('form').forEach(initFormValidation);

	/* 
		================================================
		  
		Попапы
		
		================================================
	*/

	function popup() {
		document.querySelectorAll('[data-modal]').forEach(button => {
			button.addEventListener('click', function () {
				let [dataModal, dataTab] = button.getAttribute('data-modal').split('#');

				let popup = document.querySelector(`#${dataModal}`);
				if (!popup) return

				// Удалить хеш текущего попапа
				if (getHash()) {
					history.pushState("", document.title, (window.location.pathname + window.location.search).replace(getHash(), ''));
				}

				hideScrollbar();

				body.classList.add(bodyOpenModalClass);

				// Добавить хеш нового попапа
				if (!window.location.hash.includes(dataModal)) {
					window.location.hash = dataModal;
				}

				fadeIn(popup, true);

				// открыть таб в попапе
				if (dataTab) {
					document.querySelector(`[data-href="#${dataTab}"]`).click();
				}
			});
		});

		// Открытие модалки по хешу
		window.addEventListener('load', () => {
			const hash = window.location.hash.replace('#', '');
			if (hash) {
				const popup = document.querySelector(`.popup[id="${hash}"]`);
				if (popup) {
					setTimeout(() => {
						hideScrollbar();
						fadeIn(popup, true);
					}, 500);
				}
			}
		});


		// 
		// 
		// Закрытие модалок

		function closeModal(removeHashFlag = true) {
			fadeOut('.popup');
			document.querySelectorAll('[data-modal]').forEach(button => button.disabled = true);
			body.classList.remove(bodyOpenModalClass);

			setTimeout(() => {
				let modalInfo = document.querySelector('.popup-info');
				if (modalInfo) {
					modalInfo.value = '';
				}

				showScrollbar();
				document.querySelectorAll('[data-modal]').forEach(button => button.disabled = false);
			}, 400);

			if (removeHashFlag) {
				history.pushState('', document.title, window.location.pathname + window.location.search);
			}

			clearInputs();

			setTimeout(() => {
				document.querySelectorAll('.scrollbar-auto').forEach(item => {
					// item.classList.remove('scrollbar-auto')
				});
			}, 500);
		}

		// Закрытие модалки при клике на крестик
		document.querySelectorAll('[data-popup-close]').forEach(element => {
			element.addEventListener('click', closeModal);
		});

		// Закрытие модалки при клике вне области контента
		let popupDialog = document.querySelectorAll('.popup__dialog');

		window.addEventListener('click', function (e) {
			popupDialog.forEach(popup => {
				if (e.target === popup) {
					closeModal();
				}
			});
		});

		// Закрытие модалки при клике ESC
		window.onkeydown = function (event) {
			if (event.key === 'Escape' && document.querySelectorAll('.lg-show').length === 0) {
				closeModal();
			}
		};

		// Навигация назад/вперёд
		let isAnimating = false;

		window.addEventListener('popstate', async () => {
			if (isAnimating) {
				await new Promise(resolve => {
					const checkAnimation = () => {
						if (!document.body.classList.contains('_fade')) {
							resolve();
						} else {
							setTimeout(checkAnimation, 50);
						}
					};
					checkAnimation();
				});
			}

			const hash = window.location.hash.replace('#', '');
			if (hash) {
				const popup = document.querySelector(`.popup[id="${hash}"]`);
				if (popup) {
					hideScrollbar();
					isAnimating = true;
					await fadeIn(popup, true);
					isAnimating = false;
				}
			} else {
				isAnimating = true;
				await closeModal(false);
				isAnimating = false;
			}
		});
	}

	/* 
		================================================
		  
		Спойлеры
		
		================================================
	*/

	function spoller() {
		const spollersArray = document.querySelectorAll('[data-spollers]');

		if (spollersArray.length > 0) {
			document.addEventListener("click", setSpollerAction);

			// Получение обычных слойлеров
			const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
				return !item.dataset.spollers.split(",")[0];
			});

			// Инициализация обычных слойлеров
			if (spollersRegular.length) {
				initSpollers(spollersRegular);
			}

			// Получение слойлеров с медиа-запросами
			let mdQueriesArray = dataMediaQueries(spollersArray, "spollers");

			if (mdQueriesArray && mdQueriesArray.length) {
				mdQueriesArray.forEach(mdQueriesItem => {
					mdQueriesItem.matchMedia.addEventListener("change", function () {
						initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
					});
					initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
			}

			// Инициализация
			function initSpollers(spollersArray, matchMedia = false) {
				spollersArray.forEach(spollersBlock => {
					spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;

					if (matchMedia.matches || !matchMedia) {
						spollersBlock.classList.add('_spoller-init');
						initSpollerBody(spollersBlock);
					} else {
						spollersBlock.classList.remove('_spoller-init');
						initSpollerBody(spollersBlock, false);
					}
				});
			}

			// Работа с контентом
			function initSpollerBody(spollersBlock, hideSpollerBody = true) {
				let spollerItems = spollersBlock.querySelectorAll('details');

				if (spollerItems.length) {
					spollerItems.forEach(spollerItem => {
						let spollerTitle = spollerItem.querySelector('summary');

						if (spollerTitle.nextElementSibling) {
							if (hideSpollerBody) {
								spollerTitle.removeAttribute('tabindex');

								if (!spollerItem.hasAttribute('data-open')) {
									spollerItem.open = false;

									if (spollerTitle.nextElementSibling) {
										spollerTitle.nextElementSibling.style.display = 'none';
									}
								} else {
									spollerTitle.classList.add('active');
									spollerItem.open = true;
								}

								spollerTitle.removeAttribute('disabled');

							} else {
								spollerTitle.setAttribute('disabled', '');
								spollerTitle.setAttribute('tabindex', '-1');
								spollerTitle.classList.remove('active');
								spollerItem.open = true;

								if (spollerTitle.nextElementSibling) {
									spollerTitle.nextElementSibling.style.display = 'block';
								}
							}
						}
					});
				}
			}

			function setSpollerAction(e) {
				const el = e.target;

				if (el.closest('summary') && el.closest('[data-spollers]')) {
					if (el.tagName != 'A') {
						e.preventDefault();
					} else {
						return false;
					}

					const spollersBlock = el.closest('[data-spollers]');
					if (spollersBlock.classList.contains('_disabled-click')) return

					spollersBlock.classList.add('_disabled-click');

					setTimeout(() => {
						spollersBlock.classList.remove('_disabled-click');
					}, 500);

					if (spollersBlock.classList.contains('_spoller-init')) {
						const spollerTitle = el.closest('summary');
						const spollerBlock = spollerTitle.closest('details');
						const oneSpoller = spollersBlock.hasAttribute('data-one-spoller');
						spollerBlock.hasAttribute('data-spoller-scroll');
						const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 300;

						if (!spollersBlock.querySelectorAll('._slide').length) {
							if (oneSpoller && !spollerBlock.open) {
								const prevOpen = spollersBlock.querySelector('details[open]');
								let shouldScroll = false;

								if (prevOpen) {
									const prevContent = prevOpen.querySelector('.tariff__item-content');
									const prevContentHeight = prevContent?.scrollHeight || 0;
									const windowHeight = window.innerHeight;

									// console.log('⚠️ Предыдущий спойлер открыт:', prevOpen)
									// console.log('📏 Высота контента предыдущего спойлера:', prevContentHeight)
									// console.log('📏 Высота окна:', windowHeight)

									if (prevContentHeight > windowHeight * 0.6) {
										shouldScroll = true;
										// console.log('✅ Контент больше 60% окна, включаем scroll')
									}
								}

								hideSpollersBody(spollersBlock);

								if (shouldScroll) {
									spollerBlock.querySelector('summary');
									headerTop.offsetHeight;

									// Скроллим через задержку после завершения slideUp
									spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;

									scrollToSmoothly(spollersBlock.closest('[data-spollers]').getBoundingClientRect().top + window.scrollY, 300);

									// setTimeout(() => {
									// 	const rect = summary.getBoundingClientRect()
									// 	const scrollTarget = rect.top + window.scrollY
									// 	const finalScrollTop = scrollTarget - headerHeight - 20

									// 	console.log('🕒 Через', spollerSpeed, 'мс, скроллим к summary')
									// 	console.log('📍 summary.getBoundingClientRect().top (после закрытия):', rect.top)
									// 	console.log('📍 scrollTarget:', scrollTarget)
									// 	console.log('🎯 Итоговая scroll-точка:', finalScrollTop)

									// 	scrollToSmoothly(finalScrollTop, 300)
									// }, spollerSpeed + 20) // чуть больше, чем slideUp
								}
							}

							!spollerBlock.open ? spollerBlock.open = true : setTimeout(() => { spollerBlock.open = false; }, spollerSpeed);

							spollerTitle.classList.toggle('active');
							_slideToggle(spollerTitle.nextElementSibling, spollerSpeed);

						}
					}
				}

				// Закрытие при клике вне спойлера
				if (!el.closest('[data-spollers]')) {
					const spollersClose = document.querySelectorAll('[data-spoller-close]');

					if (spollersClose.length) {
						spollersClose.forEach(spollerClose => {
							const spollersBlock = spollerClose.closest('[data-spollers]');
							const spollerCloseBlock = spollerClose.parentNode;

							if (spollersBlock.classList.contains('_spoller-init')) {
								const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
								spollerClose.classList.remove('active');
								_slideUp(spollerClose.nextElementSibling, spollerSpeed);
								setTimeout(() => { spollerCloseBlock.open = false; }, spollerSpeed);
							}
						});
					}
				}
			}

			function hideSpollersBody(spollersBlock) {
				const spollerActiveBlock = spollersBlock.querySelector('details[open]');

				if (spollerActiveBlock && !spollersBlock.querySelectorAll('._slide').length) {
					const spollerActiveTitle = spollerActiveBlock.querySelector('summary');
					const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
					spollerActiveTitle.classList.remove('active');
					_slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
					setTimeout(() => { spollerActiveBlock.open = false; }, spollerSpeed);
				}
			}
		}
	}

	burger();
	popup();
	scroll();
	spoller();
	fixedMenu();

})();
//# sourceMappingURL=script.js.map
