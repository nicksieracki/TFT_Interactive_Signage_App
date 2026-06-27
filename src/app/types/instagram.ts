export type SlideType = 'image' | 'video' | 'carousel';

export interface CarouselChild {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  caption?: string;
  permalink: string;
  username: string;
  timestamp: string;
  url?: string;
  thumbnail?: string;
  children?: CarouselChild[];
}

export type LayoutMode = 'vertical' | 'horizontal';
