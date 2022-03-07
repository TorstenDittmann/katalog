export const createPreviewElement = () => {
    customElements.define('katalog-preview',
        class extends HTMLElement {
            content = null;
            source = null;
            isolated = false;
            constructor() {
                super();
                this.content = this.innerHTML;
                this.innerHTML = '';
                this.isolated = this.hasAttribute('isolate');

                const shadowRoot = this.attachShadow({ mode: 'open' });

                const container = document.createElement('div');
                container.classList.add('katalog-container');

                const stylesheet = document.createElement('link');
                stylesheet.setAttribute('rel', 'stylesheet');
                stylesheet.setAttribute('href', '/_runtime/preview.css');

                const preview = document.createElement('div');
                const imports = window.STYLESHEETS.map(sheet => `@import '/_assets/${sheet}';`);
                preview.classList.add('katalog-preview');
                if (this.isolated) {
                    preview.classList.add('katalog-preview-isolated')
                }
                preview.innerHTML = `<style>${imports}</style>`;
                preview.innerHTML += this.content;

                const sourceCode = document.createElement('code')
                sourceCode.classList.add('katalog-source');
                sourceCode.textContent = this.content.trim();
                this.source = document.createElement('pre');
                this.source.classList.add('u-hide', 'u-no-margin');
                this.source.appendChild(sourceCode)

                const sourceButton = document.createElement('button');
                sourceButton.addEventListener('click', () => this.toggle());
                sourceButton.classList.add('p-button', 'is-small');
                sourceButton.innerHTML = 'source';

                container.appendChild(stylesheet);
                container.appendChild(preview);
                this.insertAdjacentElement('afterend', this.source);
                this.insertAdjacentElement('afterend', sourceButton);
                shadowRoot.appendChild(container);
            }

            toggle() {
                this.source.classList.toggle('u-hide');
            }
        }
    );
}

