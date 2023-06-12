const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
      <style>
            footer{
                  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                  font-size: large;
                  text-align: center;
            }
      </style>
      
      <footer>
           Legalize sounding nyanerisms~!!! XD
      </footer>
`

class Footer extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(footerTemplate.content);
    }
}

customElements.define('footer-component', Footer);