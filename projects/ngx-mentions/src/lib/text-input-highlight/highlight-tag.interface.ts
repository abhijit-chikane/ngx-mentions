export interface HighlightTag {
  indices: {
    start: number;
    end: number;
    triggerCharacter: string;
  };
  cssClass?: string;
  data?: any;
}
