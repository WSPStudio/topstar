import { dataMediaQueries } from "../scripts/other/checks";
import { _slideToggle, _slideUp } from "../scripts/other/animation";

/* 
	================================================
	  
	Спойлеры
	
	================================================
*/

export function spoller() {
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

				const spollersBlock = el.closest('[data-spollers]')
				if (spollersBlock.classList.contains('_disabled-click')) return

				spollersBlock.classList.add('_disabled-click')

				setTimeout(() => {
					spollersBlock.classList.remove('_disabled-click')
				}, 500)

				if (spollersBlock.classList.contains('_spoller-init')) {
					const spollerTitle = el.closest('summary')
					const spollerBlock = spollerTitle.closest('details')
					const oneSpoller = spollersBlock.hasAttribute('data-one-spoller')
					const scrollSpoller = spollerBlock.hasAttribute('data-spoller-scroll')
					const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500

					if (!spollersBlock.querySelectorAll('._slide').length) {
						if (oneSpoller && !spollerBlock.open) {
							hideSpollersBody(spollersBlock)
						}

						!spollerBlock.open ? spollerBlock.open = true : setTimeout(() => { spollerBlock.open = false }, spollerSpeed)

						spollerTitle.classList.toggle('active')
						_slideToggle(spollerTitle.nextElementSibling, spollerSpeed)

						if (scrollSpoller && spollerTitle.classList.contains('active')) {
							const scrollSpollerValue = spollerBlock.dataset.spollerScroll
							const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0
							const scrollSpollerNoHeader = spollerBlock.hasAttribute('data-spoller-scroll-noheader') ? document.querySelector('.header').offsetHeight : 0

							window.scrollTo({
								top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
								behavior: 'smooth'
							})
						}
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
							setTimeout(() => { spollerCloseBlock.open = false }, spollerSpeed);
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
				setTimeout(() => { spollerActiveBlock.open = false }, spollerSpeed);
			}
		}
	}
}
