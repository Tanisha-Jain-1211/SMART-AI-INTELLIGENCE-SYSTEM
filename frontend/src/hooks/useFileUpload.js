// Helpers for multipart uploads with Axios upload progress events.
export function createUploadProgressHandler(setPct) {
  return (event) => {
    if (!event.total) return;
    const pct = Math.round((event.loaded / event.total) * 100);
    setPct(pct);
  };
}
