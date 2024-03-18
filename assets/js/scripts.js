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
        .catch(() => {
            console.error(
                'Could not load ' + `%c${selector}` + '%c component.',
                'color: red;',
                'color: inherit;',
            );
        });
};
