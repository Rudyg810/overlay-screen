declare module 'screenshot-desktop' {
    export interface ScreenshotOptions {
      format?: 'png' | 'jpg';
      screen?: string;
      filename?: string;
    }
  
    export default function screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  }
  