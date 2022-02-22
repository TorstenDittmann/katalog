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

                const script = document.createElement('script');
                script.innerHTML = `
                    function getDocHeight(doc) {
                        doc = doc || document;
                        const body = doc.body, html = doc.documentElement;
                        const height = Math.max( body.scrollHeight, body.offsetHeight, 
                            html.clientHeight, html.scrollHeight, html.offsetHeight );
                        return height;
                    }

                    function setIframeHeight(ifrm) {
                        const doc = ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
                        ifrm.style.visibility = 'hidden';
                        ifrm.style.height = "10px";
                        ifrm.style.height = getDocHeight( doc ) + 4 + "px";
                        ifrm.style.visibility = 'visible';
                    }
                `;

                const style = document.createElement('style');
                style.innerHTML = `
                    .katalog-source {
                        display: none;
                        white-space: pre;
                    }
                    .katalog-source.show {
                        display: block;
                    }
                    .katalog-preview {
                        border: none;
                        display: block;
                        width: 100%;
                    }
                `;

                const preview = document.createElement('iframe');
                preview.classList.add('katalog-preview');
                preview.src = "about:blank";
                preview.height = "0px";
                preview.setAttribute('onload', "setIframeHeight(this)");

                preview.srcdoc = `
                    <style>${window.STYLESHEETS.map(s => `@import '/_assets/${s}';`).join(' ')}</style>
                    ${this.content}
                `;

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

                container.appendChild(script);
                container.appendChild(style);
                container.appendChild(preview);
                this.insertAdjacentElement('afterend', sourceButton);
                this.insertAdjacentElement('afterend', this.source);
                shadowRoot.appendChild(container);
            }

            toggle() {
                this.source.classList.toggle('u-hide');
            }
        }
    );
}

