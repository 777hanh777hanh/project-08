const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
const loadComponent = (selector, path) => {
	const content = localStorage.getItem(path);

	if (content) {
		document.querySelector(selector).innerHTML = content;
	}

	fetch(path)
		.then(res => res.text())
		.then(html => {
			if (html !== content) {
				document.querySelector(selector).innerHTML = html;
				localStorage.setItem(path, html);
			}
		})
		.finally(() => {
			window.dispatchEvent(new Event('template-loaded'));
		})
		.catch(() => {
			console.error(
				'Could not load ' + `%c${selector}` + '%c component.',
				'color: red;',
				'color: inherit;'
			);
		});
};

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
	if (!element) return true;

	if (window.getComputedStyle(element).display === 'none') {
		return true;
	}

	let parent = element.parentElement;
	while (parent) {
		if (window.getComputedStyle(parent).display === 'none') {
			return true;
		}
		parent = parent.parentElement;
	}

	return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
	if (isHidden($('.js-dropdown-list'))) return;

	const items = $$('.js-dropdown-list > li');

	items.forEach(item => {
		const arrowPos = item.offsetLeft + item.offsetWidth / 2;
		item.style.setProperty('--arrow-left-pos', `${arrowPos}px`);
	});
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener('resize', calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener('template-loaded', calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener('template-loaded', handleActiveMenu);
window.addEventListener('resize', handleActiveMenu);

function handleActiveMenu() {
	const dropdowns = $$('.js-dropdown');
	const menus = $$('.js-menu-list');
	const activeClass = 'menu-column__item--active';

	const removeActive = menu => {
		menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
	};

	const init = () => {
		menus.forEach(menu => {
			const items = menu.children;
			if (!items.length) return;

			removeActive(menu);
			if (window.innerWidth > 991) items[0].classList.add(activeClass);

			let currentItem = null;

			Array.from(items).forEach(item => {
				item.onmouseenter = () => {
					if (window.innerWidth <= 991) return;
					removeActive(menu);
					item.classList.add(activeClass);
				};
				item.onclick = e => {
					if (window.innerWidth > 991) return;
					removeActive(menu);
					if (!e.target.closest('.sub-menu') && currentItem === item) {
						currentItem.classList.remove(activeClass);
						currentItem = null;
					} else {
						item.classList.add(activeClass);
						item.scrollIntoView({ behavior: 'smooth' });
						currentItem = item;
					}
				};
			});
		});
	};

	init();

	dropdowns.forEach(dropdown => {
		dropdown.onmouseleave = () => init();
	});
}

/**
 * Chuyển đổi giao diện dark/light
 *
 * Thêm class '.js-dark-mode-toggle' vào button chuyển đổi mode
 */

function initModeInterface() {
	const darkMode = JSON.parse(localStorage.getItem('dark-mode'));

	if (darkMode) {
		document.documentElement.classList.add('dark');
	}
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener('template-loaded', initJsToggle);

function initJsToggle() {
	$$('.js-toggle').forEach(button => {
		const target = button.getAttribute('toggle-target');
		if (!target) {
			document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
		}
		button.onclick = e => {
			e.preventDefault();

			if (!$(target)) {
				return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
			}
			const isHidden = $(target).classList.contains('hide');

			requestAnimationFrame(() => {
				$(target).classList.toggle('hide', !isHidden);
				$(target).classList.toggle('show', isHidden);
			});
		};
		// Ẩn box khi click ra ngoài
		document.onclick = function (e) {
			// Nếu click vào phần tử không thuộc target
			if (!e.target.closest(target)) {
				// Kiểm tra xem target có đang hiển thị không
				const isHidden = $(target).classList.contains('hide');
				// Nếu đang hiển thị thì ẩn đi
				if (!isHidden) {
					button.click();
				}
			}
		};
	});
}

window.addEventListener('template-loaded', () => {
	const links = $$('.js-dropdown-list > li > a');

	links.forEach(link => {
		link.onclick = () => {
			if (window.innerWidth > 1199.98) return;
			const item = link.closest('li');
			item.classList.toggle('navbar__item--active');
		};
	});
});

window.addEventListener('template-loaded', () => {
	const tabsSelector = 'product-tab__item';
	const contentsSelector = 'product-tab__content';

	const tabActive = `${tabsSelector}--current`;
	const contentActive = `${contentsSelector}--current`;

	const tabContainers = $$('.js-tabs');
	tabContainers.forEach(tabContainer => {
		const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
		const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
		tabs.forEach((tab, index) => {
			tab.onclick = () => {
				tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
				tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
				tab.classList.add(tabActive);
				contents[index].classList.add(contentActive);
			};
		});
	});
});

window.addEventListener('template-loaded', () => {
	const switchBtns = document.querySelectorAll('.switch-theme-btn');
	if (switchBtns) {
		switchBtns.forEach(switchBtn => {
			switchBtn.onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();

				const isDark = localStorage.dark === 'true';
				document.querySelector('html').classList.toggle('dark', !isDark);
				localStorage.setItem('dark', !isDark);
				if (switchBtn.querySelector('span')) {
					switchBtn.querySelector('span').textContent = isDark
						? 'Dark mode'
						: 'Light mode';
				}

				switchBtn.querySelectorAll('img').forEach(img => {
					img.classList.toggle('hide');
				});
			};
			const isDark = localStorage.dark === 'true';
			switchBtn.querySelector('span').textContent = isDark ? 'Light mode' : 'Dark mode';
		});
	}
});

const isDark = localStorage.dark === 'true';
document.querySelector('html').classList.toggle('dark', isDark);
