function decodeNdefTextPayload(data: DataView | ArrayBuffer): string {
  const view = data instanceof ArrayBuffer ? new DataView(data) : data;
  if (view.byteLength === 0) return "";
  const status = view.getUint8(0);
  const langLen = status & 0x3f;
  const textOffset = 1 + langLen;
  if (textOffset > view.byteLength) {
    return new TextDecoder("utf-8").decode(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
    );
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
