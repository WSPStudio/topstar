/*
	================================================
	  
	Показать еще
		
	================================================
*/

export function showMore() {
	document.querySelectorAll('[data-more-wrapper]').forEach(wrapper => {
		const button = wrapper.querySelector('[data-more]')
		if (!button) return

		const [initialCount, stepCount, selector = '[data-more-item]'] = button.getAttribute('data-more').split(',')
		const items = Array.from(wrapper.querySelectorAll(selector))
		const moreOpenText = button.querySelector('[data-more-open]')
		const moreCloseText = button.querySelector('[data-more-close]')
		const [mediaBreakpointRaw, mediaBreakpointType = 'max'] = wrapper.dataset.media ? wrapper.dataset.media.split(',') : []
		const mediaBreakpoint = mediaBreakpointRaw ? parseInt(mediaBreakpointRaw) : null

		let visibleCount = parseInt(initialCount)
		let mediaQuery = null

		const isLinesMode = stepCount === 'lines'
		let isToggleActive = false
		const linesTarget = wrapper.querySelector('[data-lines]')

		const applyTransition = element => {
			element.style.transition = 'max-height 0.3s ease'
			element.style.overflow = 'hidden'
		}

		const toggleLinesMode = () => {
			if (!linesTarget) return
			linesTarget.classList.toggle('active')

			const isExpanded = linesTarget.classList.contains('active')
			linesTarget.style.webkitLineClamp = isExpanded ? 'unset' : initialCount

			if (moreOpenText) moreOpenText.style.display = isExpanded ? 'none' : ''
			if (moreCloseText) moreCloseText.style.display = isExpanded ? '' : 'none'

			if (isExpanded) {
				wrapper.classList.add('active')
				button.classList.add('active')
			} else {
				wrapper.classList.remove('active')
				button.classList.remove('active')
			}
		}

		const resetInitialState = () => {
			visibleCount = parseInt(initialCount)

			if (isLinesMode && linesTarget) {
				linesTarget.style.display = ''
				linesTarget.style.webkitLineClamp = initialCount
				linesTarget.classList.remove('active')
				wrapper.classList.remove('active')
				button.classList.remove('active')
			} else {
				items.forEach((item, index) => {
					applyTransition(item)
					if (index >= visibleCount) item.style.maxHeight = '0px'
					else item.style.maxHeight = `${item.scrollHeight}px`
				})

				button.style.display = visibleCount >= items.length ? 'none' : ''
			}

			if (moreOpenText) moreOpenText.style.display = ''
			if (moreCloseText) moreCloseText.style.display = 'none'
		}

		const showAllItems = () => {
			if (!isLinesMode) {
				items.forEach(item => item.style.maxHeight = `${item.scrollHeight}px`)
			}
			wrapper.classList.add('active')
			button.classList.add('active')
		}


		const buttonHandler = () => {
			if (isLinesMode) {
				toggleLinesMode()
				return
			}

			if (stepCount === 'all') {
				showAllItems()
				button.remove()
				return
			}

			if (stepCount === 'toggle') {
				if (!isToggleActive) {
					showAllItems()
					isToggleActive = true
					if (moreOpenText) moreOpenText.style.display = 'none'
					if (moreCloseText) moreCloseText.style.display = ''
				} else {
					isToggleActive = false

					items.forEach((item, index) => {
						if (index < visibleCount) {
							item.style.maxHeight = `${item.scrollHeight}px`
						} else {
							item.style.maxHeight = '0px'
						}
					})

					if (moreOpenText) moreOpenText.style.display = ''
					if (moreCloseText) moreCloseText.style.display = 'none'
					wrapper.classList.remove('active')
					button.classList.remove('active')
				}
				return
			}


			const step = parseInt(stepCount)
			visibleCount += step

			items.forEach((item, index) => {
				if (index < visibleCount) item.style.maxHeight = `${item.scrollHeight}px`
			})

			if (visibleCount >= items.length) {
				button.style.display = 'none'
				wrapper.classList.add('active')
				button.classList.add('active')
			}
		}


		const handleMediaQuery = e => {
			if (!e.matches) {
				showAllItems()
			} else {
				resetInitialState()
				button.addEventListener('click', buttonHandler)
			}
		}

		const initialize = () => {
			resetInitialState()
			button.addEventListener('click', buttonHandler)
		}

		if (mediaBreakpoint) {
			const queryType = mediaBreakpointType === 'min' ? 'min-width' : 'max-width'
			mediaQuery = window.matchMedia(`(${queryType}: ${mediaBreakpoint}px)`)
			mediaQuery.addEventListener('change', handleMediaQuery)
			handleMediaQuery(mediaQuery)
		} else {
			initialize()
		}

		if (isLinesMode && linesTarget) {
			const originalClamp = linesTarget.style.webkitLineClamp
			linesTarget.style.webkitLineClamp = 'unset'

			const fullHeight = linesTarget.scrollHeight
			linesTarget.style.webkitLineClamp = originalClamp
			const clampedHeight = linesTarget.clientHeight

			if (fullHeight == clampedHeight) {
				button.remove()
			}
		}
	})
}
