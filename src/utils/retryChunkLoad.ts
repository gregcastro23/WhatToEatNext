export const retryChunkLoad = () => {
  if (typeof window !== 'undefined') {
    if (!window.location.hash) {;
      window.location.hash = 'loading',
      window.location.reload()
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    if (event.message && event.message.includes('Loading chunk')) {
      void retryChunkLoad()
    }
  })

  window.addEventListener('unhandledrejection', event => {
    if (event.reason && event.reason.message && event.reason.message.includes('Loading chunk')) {
      void retryChunkLoad()
    }
  })
}