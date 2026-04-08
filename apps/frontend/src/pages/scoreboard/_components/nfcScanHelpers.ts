function decodeNdefTextPayload(data: DataView | ArrayBuffer): string {
  const view = data instanceof ArrayBuffer ? new DataView(data) : data;
  if (view.byteLength === 0) return "";

  const decodeWhole = () =>
    new TextDecoder("utf-8").decode(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
    );

  const status = view.getUint8(0);
  const langLen = status & 0x3f;
  const textOffset = 1 + langLen;

  // Web NFC often exposes `record.data` as raw UTF-8 for "text" records, without the NDEF
  // status byte + language code. The first UUID byte (e.g. "b" = 0x62) is then mis-read as
  // lang length 34, leaving only the last character (e.g. "9" from ...ddb9).
  const maxReasonableLangLen = 8;
  if (langLen > maxReasonableLangLen || textOffset > view.byteLength) {
    return decodeWhole();
  }
  if (textOffset === view.byteLength) {
    return "";
  }

  return new TextDecoder("utf-8").decode(
    new Uint8Array(view.buffer, view.byteOffset + textOffset, view.byteLength - textOffset),
  );
}

export function extractUserIdFromNfcReading(event: NDEFReadingEvent): string | undefined {
  const { message } = event;
  for (const record of message.records) {
    if (record.recordType === "text") {
      if (record.data) {
        const text = decodeNdefTextPayload(record.data).trim();
        if (text) return text;
      }
    }
    if (record.recordType === "empty") continue;
  }
  return undefined;
}
