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
        .then((res) => res.text())
        .then((html) => {
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
                'color: inherit;',
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

    items.forEach((item) => {
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

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            let currentItem = null;

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    if (currentItem === item) {
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

    dropdowns.forEach((dropdown) => {
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

function handleModeInterface() {
    const darkModeToggle = $('.js-dark-mode-toggle');

    darkModeToggle.onclick = () => {
        document.documentElement.classList.toggle('dark');
        const currentMode = JSON.parse(localStorage.getItem('dark-mode'));
        const newMode = !currentMode;
        console.log('Dark mode:', newMode);
        localStorage.setItem('dark-mode', newMode.toString());
    };
}

// Khởi tạo giao diện dark/light
initModeInterface();

// Thêm sự kiện chuyển đổi giao diện dark/light khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', handleModeInterface);

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener('template-loaded', initJsToggle);

function initJsToggle() {
    $$('.js-toggle').forEach((button) => {
        const target = button.getAttribute('toggle-target');
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = () => {
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains('hide');

            requestAnimationFrame(() => {
                $(target).classList.toggle('hide', !isHidden);
                $(target).classList.toggle('show', isHidden);
            });
        };
    });
}

window.addEventListener('template-loaded', () => {
    const links = $$('.js-dropdown-list > li > a');

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest('li');
            item.classList.toggle('navbar__item--active');
        };
    });
});
