export interface FileData {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }
  
  export interface Folder {
    id: string;
    name: string;
    icon: string;
    tag: string;
    files: FileData[];
  }
  