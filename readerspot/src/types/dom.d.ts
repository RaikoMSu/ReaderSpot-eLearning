// Type declarations for DOM APIs
interface Window {
  requestAnimationFrame(callback: (time: number) => void): number;
}

// Basic CSS style declaration
interface CSSStyleDeclaration {
  cssText: string;
  width: string;
  transition: string;
  [key: string]: string | number | CSSRule | undefined;
}

interface HTMLElement {
  style: CSSStyleDeclaration;
  setAttribute(name: string, value: string): void;
}

// Make sure HTMLDivElement includes HTMLElement properties
interface HTMLDivElement extends HTMLElement {}

// Add missing properties for input elements
interface HTMLInputElement extends HTMLElement {
  files: FileList | null;
  value: string;
}

// Add missing properties for textarea elements
interface HTMLTextAreaElement extends HTMLElement {
  value: string;
}

// Add FileList type
interface FileList {
  readonly length: number;
  item(index: number): File | null;
  [index: number]: File;
} 