

export interface HistoryRecord {
  id: string;
  name: string;
  refImages: string[];
  generatedImage: string;
  applicationImage: string;
  time: string;
  type: 'pattern' | 'element' | 'application';
}

export interface HistoryDetailData {
  name: string;
  time: string;
  type: string;
  ref1: string;
  ref2: string;
  generated: string;
  application: string;
}

