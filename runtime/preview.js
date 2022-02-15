export const createPreviewElement = () => {
    customElements.define('katalog-preview',
        class extends HTMLElement {
            content = null;
            source = null;
            constructor() {
                super();
                this.content = this.innerHTML;
                this.innerHTML = '';

                const shadowRoot = this.attachShadow({ mode: 'open' });

                const container = document.createElement('div');
                container.classList.add('katalog-container');

                const style = document.createElement('style');
                style.innerHTML = `
                    @import '/test.css';

                    .katalog-source {
                        display: none;
                    }
                    .katalog-source.show {
                        display: block;
                    }
                    .katalog-preview > * {
                        position: initial;
                    }
                `;

                const preview = document.createElement('div');
                preview.classList.add('katalog-preview');
                preview.innerHTML = this.content;

                this.source = document.createElement('div');
                this.source.classList.add('katalog-source');
                this.source.textContent = this.content;

                const sourceButton = document.createElement('button');
                sourceButton.addEventListener('click', () => this.toggle());
                sourceButton.innerHTML = '<>';

                container.appendChild(style);
                container.appendChild(sourceButton);
                container.appendChild(preview);
                container.appendChild(this.source);
                shadowRoot.appendChild(container);
            }

            toggle() {
                this.source.classList.toggle('show');
            }
        }
    );
}

