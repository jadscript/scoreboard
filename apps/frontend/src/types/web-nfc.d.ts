/** Minimal typings for Web NFC (read / write). */

export {};

declare global {
  interface NDEFMessageInit {
    records: NDEFRecordInit[];
  }

  interface NDEFRecordInit {
    recordType: string;
    data?: string | BufferSource;
    encoding?: string;
    lang?: string;
    id?: string;
    mediaType?: string;
  }

  interface NDEFScanOptions {
    signal?: AbortSignal;
  }

  interface NDEFRecord {
    recordType: string;
    data?: DataView;
    encoding?: string;
    id?: string;
    mediaType?: string;
    toString?: () => string;
  }

  interface NDEFMessage {
    records: NDEFRecord[];
  }

  interface NDEFReadingEvent extends Event {
    message: NDEFMessage;
  }

  class NDEFReader extends EventTarget {
    constructor();
    write(
      message: NDEFMessageInit,
      options?: { overwrite?: boolean },
    ): Promise<void>;
    scan(options?: NDEFScanOptions): Promise<void>;
    addEventListener(
      type: "reading",
      listener: (ev: NDEFReadingEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener(
      type: "reading",
      listener: (ev: NDEFReadingEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void;
  }
}
