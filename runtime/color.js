export const createPreviewElement = () => {
    customElements.define('katalog-preview',
        class extends HTMLElement {
            name = null;
            value = null;
            constructor() {
                super();
                this.innerHTML = '';
                this.name = this.getAttribute('name');
                this.value = this.getAttribute('value');

                const shadowRoot = this.attachShadow({ mode: 'open' });

                const container = document.createElement('div');
                container.classList.add('katalog-container');

                const stylesheet = document.createElement('link');
                stylesheet.setAttribute('rel', 'stylesheet');
                stylesheet.setAttribute('href', '/_runtime/color.css');

                const preview = document.createElement('div');
                preview.classList.add('katalog-color');

                const description = document.createElement('div')
                description.classList.add('katalog-description');
                description.innerHTML = `
                <p>${this.name}</p>
                <p>${this.color}</p>
                `;

                container.appendChild(stylesheet);
                container.appendChild(preview);
                container.appendChild(description);

                shadowRoot.appendChild(container);
            }
        }
    );
}

