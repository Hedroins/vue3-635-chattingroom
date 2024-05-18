export function base64ToStr(base64) {
    let base64str = atob(base64)
    let buffer = new ArrayBuffer(base64str.length);
    const view = new Uint8Array(buffer)

    for (let i = 0; i < base64str.length; i++) {
        view[i] = base64str[i].charCodeAt()
    }
    let uintArray = new Uint8Array(view)
    const decoder = new TextDecoder()
    const result = decoder.decode(uintArray)
    return result
}

export function formatTime(seconds) {
    const hours = Math.floor(seconds / (60 * 60));
    const remainingSeconds = seconds % (60 * 60);
    const minutes = Math.floor(remainingSeconds / 60);
    const remainingSeconds2 = remainingSeconds % 60;
    return `${hours<10?'0'+hours:hours}:${minutes<10?'0'+minutes:minutes}:${remainingSeconds2<10?'0'+remainingSeconds2:remainingSeconds2}`;
  }