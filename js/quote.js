class LeftQuote extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      const quote = this.getAttribute('quote');
      const author = this.getAttribute('author');
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #ccc;
            font-style: italic;
          }
          .author {
            display: block;
            margin-top: 0.5em;
            font-style: normal;
            font-weight: bold;
          }
        </style>
        <blockquote>
          <slot>${quote}</slot>
          ${author ? `<span class="author">— ${author}</span>` : ''}
        </blockquote>
      `;
    }
  }
  
  customElements.define('left-quote', LeftQuote);