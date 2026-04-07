/** Minimal typings for Web NFC (NDEFReader.write). */

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

  class NDEFReader extends EventTarget {
    constructor();
    write(
      message: NDEFMessageInit,
      options?: { overwrite?: boolean },
    ): Promise<void>;
  }
}
