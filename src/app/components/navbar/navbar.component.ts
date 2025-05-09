import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm: string = '';

  onSearchInput() {
    // Remove any existing highlights
    this.removeHighlights();
    
    if (this.searchTerm.trim()) {
      this.highlightMatches(this.searchTerm);
    }
  }

  onSearch(event: Event) {
    event.preventDefault();
    if (this.searchTerm.trim()) {
      this.highlightMatches(this.searchTerm);
    }
  }

  private removeHighlights() {
    const highlights = document.querySelectorAll('mark');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });
  }

  private highlightMatches(searchTerm: string) {
    const searchRegex = new RegExp(searchTerm, 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return node.parentElement?.tagName !== 'SCRIPT' &&
                 node.parentElement?.tagName !== 'STYLE' &&
                 node.parentElement?.tagName !== 'MARK'
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node: Text | null;
    while (node = walker.nextNode() as Text) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const content = textNode.textContent || '';
      if (searchRegex.test(content)) {
        const replacementNode = document.createElement('span');
        replacementNode.innerHTML = content.replace(
          searchRegex,
          match => `<mark class="highlight">${match}</mark>`
        );
        textNode.replaceWith(replacementNode);
      }
    });
  }
}
