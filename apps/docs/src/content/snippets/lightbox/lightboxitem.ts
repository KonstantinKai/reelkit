interface LightboxItem {
  src: string;
  type?: 'image' | 'video';  // defaults to 'image'
  poster?: string;            // thumbnail for video items
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}
