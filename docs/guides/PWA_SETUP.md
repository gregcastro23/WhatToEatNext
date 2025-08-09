# PWA Setup Documentation

## Overview

What to Eat Next is now a Progressive Web App (PWA) that provides:

- Offline functionality
- Installable app experience
- Push notifications
- Fast loading and caching
- Native app-like experience

## Files Created

### Core PWA Files

- `public/manifest.json` - App manifest with metadata and icons
- `public/sw.js` - Service worker for offline functionality
- `public/offline.html` - Offline page shown when no cached content
- `src/utils/pwaUtils.ts` - PWA utility functions
- `src/components/PWAInstallPrompt.tsx` - Install prompt component

### Test Files

- `src/app/pwa-test/page.tsx` - PWA testing page
- `public/icon-generator.html` - Icon generation tool
- `public/screenshot-generator.html` - Screenshot generation tool

## Features

### 1. Offline Functionality

- Service worker caches static assets (icons, manifest, offline page)
- Network-first strategy for dynamic content
- Graceful offline experience with custom offline page

### 2. App Installation

- Install prompt appears when criteria are met
- Works on desktop (Chrome/Edge) and mobile devices
- Adds app to home screen with custom icon

### 3. Push Notifications

- Request notification permissions
- Send test notifications
- Background notification handling

### 4. Caching Strategy

- **Static Cache**: Icons, manifest, offline page
- **Dynamic Cache**: API responses and dynamic content
- **Network First**: Always try network, fallback to cache

## Testing

### PWA Test Page

Visit `/pwa-test` to test all PWA features:

- PWA support detection
- Installation prompts
- Offline functionality
- Notification permissions
- Service worker status

### Manual Testing

1. **Installation**: Look for install icon in browser address bar
2. **Offline**: Disconnect internet and refresh page
3. **Notifications**: Grant permission and test notifications
4. **Caching**: Check browser dev tools → Application → Service Workers

## Browser Support

### Desktop

- ✅ Chrome 67+
- ✅ Edge 79+
- ✅ Firefox 60+
- ✅ Safari 11.1+

### Mobile

- ✅ Chrome for Android
- ✅ Safari for iOS 11.3+
- ✅ Samsung Internet
- ✅ Firefox for Android

## Installation Instructions

### Desktop (Chrome/Edge)

1. Visit the app in Chrome or Edge
2. Look for the install icon (📱) in the address bar
3. Click "Install" to add to desktop

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (⋮) button
3. Select "Add to Home screen"
4. Confirm installation

### iOS (Safari)

1. Open the app in Safari
2. Tap the share button (📤)
3. Select "Add to Home Screen"
4. Confirm installation

## Service Worker Lifecycle

1. **Install**: Caches static files
2. **Activate**: Cleans up old caches
3. **Fetch**: Intercepts network requests
4. **Update**: Checks for new versions

## Cache Management

The service worker manages three caches:

- `static-v1.0.0`: Static assets
- `dynamic-v1.0.0`: Dynamic content
- `what-to-eat-next-v1.0.0`: Main app cache

## Troubleshooting

### Common Issues

1. **Install prompt not showing**
   - Ensure HTTPS is enabled
   - Check manifest.json is valid
   - Verify service worker is registered

2. **Offline not working**
   - Check service worker is active
   - Verify files are cached
   - Test with browser dev tools

3. **Notifications not working**
   - Check notification permissions
   - Ensure HTTPS (required for notifications)
   - Test with browser dev tools

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations()

// Clear all caches
caches.keys().then(names => names.forEach(name => caches.delete(name)))

// Check PWA status
getPWAStatus()
```

## Future Enhancements

1. **Background Sync**: Sync data when connection is restored
2. **App Shortcuts**: Quick actions from app icon
3. **Share Target**: Receive shared content
4. **Periodic Sync**: Background data updates
5. **Web Share API**: Native sharing functionality

## Security Considerations

- HTTPS is required for PWA features
- Service worker runs in secure context
- Notifications require user permission
- Cache is isolated per origin

## Performance Impact

- Service worker adds ~2KB to initial load
- Caching improves subsequent page loads
- Offline functionality reduces data usage
- Install prompt only shows when beneficial

## Maintenance

### Updating the PWA

1. Update version in manifest.json
2. Update cache names in service worker
3. Test offline functionality
4. Verify installation still works

### Monitoring

- Check service worker registration
- Monitor cache usage
- Track installation rates
- Monitor notification engagement

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
