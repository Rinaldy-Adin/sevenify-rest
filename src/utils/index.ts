import * as blobUtil from 'blob-util';

export function createBlobFromBuffer(buffer: Buffer, mimeType: string) {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const blob = blobUtil.createBlob([arrayBuffer], { type: mimeType });
    return blob;
  }
  