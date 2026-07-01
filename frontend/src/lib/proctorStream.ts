let stream: MediaStream | null = null;

export function setProctorStream(mediaStream: MediaStream) {
  stream = mediaStream;
}

export function getProctorStream() {
  return stream;
}

export function stopProctorStream() {
  if (!stream) return;

  stream.getTracks().forEach(track => track.stop());

  stream = null;
}