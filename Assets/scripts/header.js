const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
      <style>
            header{
                  font-size: 75px;
                  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
            }
      </style>
      
      <header>
           <img src="Assets/icons/onlynyans.svg" alt="OnlyNyans" width="75"/>
           <span style="color:purple">Only</span><span style="color:plum">Nyans</span>
      </header>
`

class Header extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(headerTemplate.content);
    }
}

customElements.define('header-component', Header);