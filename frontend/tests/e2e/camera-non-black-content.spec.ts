import { test, expect } from '@playwright/test';

test.describe('Camera Non-Black Content Test', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    // Mock a working video stream with actual video content (not black)
    await page.addInitScript(() => {
      // Create a fake canvas with colored content for testing
      const createFakeVideoStream = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d')!;
        
        // Draw colored pattern to simulate real video content
        ctx.fillStyle = '#FF5733'; // Orange-red background
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = '#33FF57'; // Green
        ctx.fillRect(320, 0, 320, 240);
        ctx.fillStyle = '#3357FF'; // Blue  
        ctx.fillRect(0, 240, 320, 240);
        ctx.fillStyle = '#F3FF33'; // Yellow
        ctx.fillRect(320, 240, 320, 240);
        
        // Add moving circle to simulate motion
        const drawFrame = () => {
          const time = Date.now() / 1000;
          const x = 320 + Math.sin(time) * 100;
          const y = 240 + Math.cos(time) * 100;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, 2 * Math.PI);
          ctx.fill();
        };
        
        drawFrame();
        setInterval(drawFrame, 100); // Update 10 FPS
        
        // Create MediaStream from canvas
        const stream = canvas.captureStream(30);
        return stream;
      };

      // Mock MediaDevices with colored video stream
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints) => {
            console.log('Mock getUserMedia called with:', constraints);
            const stream = createFakeVideoStream();
            console.log('Mock stream created with tracks:', stream.getTracks().length);
            return stream;
          },
          enumerateDevices: async () => [{
            deviceId: 'mock-camera-123',
            groupId: 'mock-group',
            kind: 'videoinput',
            label: 'Mock Test Camera'
          }],
          getSupportedConstraints: () => ({
            width: true,
            height: true,
            facingMode: true,
            frameRate: true
          })
        },
        configurable: true
      });

      // Mock HTMLVideoElement play method
      HTMLVideoElement.prototype.play = function() {
        this.readyState = 4; // HAVE_ENOUGH_DATA
        this.videoWidth = 640;
        this.videoHeight = 480;
        
        // Simulate video playing
        Object.defineProperty(this, 'paused', { value: false, configurable: true });
        
        // Trigger events
        setTimeout(() => {
          this.dispatchEvent(new Event('loadedmetadata'));
          this.dispatchEvent(new Event('loadeddata'));
          this.dispatchEvent(new Event('canplay'));
          this.dispatchEvent(new Event('playing'));
        }, 100);
        
        return Promise.resolve();
      };
    });

    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');
  });

  test('should display actual video content (not black screen)', async ({ page }) => {
    console.log('Starting camera video display test...');
    
    // Click camera button to start
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);

    // Wait for camera interface to appear
    const videoElement = page.locator('video');
    await expect(videoElement).toBeVisible({ timeout: 10000 });
    
    console.log('Video element is visible, checking properties...');
    
    // Check video element attributes
    const videoAttributes = await videoElement.evaluate((video: HTMLVideoElement) => ({
      autoplay: video.autoplay,
      muted: video.muted,
      playsInline: video.playsInline,
      controls: video.controls,
      srcObject: !!video.srcObject,
      paused: video.paused,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
      duration: video.duration,
      networkState: video.networkState,
      style: video.style.cssText
    }));
    
    console.log('Video attributes:', videoAttributes);
    
    // Verify video has proper attributes
    expect(videoAttributes.autoplay).toBe(true);
    expect(videoAttributes.muted).toBe(true);
    expect(videoAttributes.playsInline).toBe(true);
    expect(videoAttributes.srcObject).toBe(true);
    expect(videoAttributes.videoWidth).toBeGreaterThan(0);
    expect(videoAttributes.videoHeight).toBeGreaterThan(0);

    // Check if video is actually playing (not paused and has current time)
    expect(videoAttributes.paused).toBe(false);
    expect(videoAttributes.readyState).toBeGreaterThanOrEqual(2); // HAVE_CURRENT_DATA or higher

    // Wait a bit and check if currentTime is advancing (indicates video is playing)
    await page.waitForTimeout(1000);
    
    const newCurrentTime = await videoElement.evaluate((video: HTMLVideoElement) => video.currentTime);
    console.log('Video currentTime after 1 second:', newCurrentTime);
    
    // For live stream, currentTime should be > 0 or advancing
    expect(newCurrentTime).toBeGreaterThan(0);

    // Check if video element has actual pixel content (not black)
    const hasVideoContent = await videoElement.evaluate((video: HTMLVideoElement) => {
      // Create a small canvas to sample video pixels
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        return false;
      }
      
      try {
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, 20, 20);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, 20, 20);
        const pixels = imageData.data;
        
        // Check if we have non-black pixels
        let hasColor = false;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const alpha = pixels[i + 3];
          
          // If pixel is not black (0,0,0) or transparent, we have content
          // Using a threshold to account for potential compression artifacts
          if ((r > 15 || g > 15 || b > 15) && alpha > 15) {
            hasColor = true;
            break;
          }
        }
        
        console.log('Sampled pixels for color detection:', hasColor ? 'HAS COLOR' : 'BLACK/TRANSPARENT');
        return hasColor;
      } catch (error) {
        console.log('Error sampling video pixels:', error);
        return false;
      }
    });

    console.log('Video has actual content (not black):', hasVideoContent);
    
    // This is the key test - video should have actual content, not be black
    expect(hasVideoContent).toBe(true);

    // Additional debugging - log any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Check video element CSS that might hide content
    const computedStyle = await videoElement.evaluate((video: HTMLVideoElement) => {
      const styles = window.getComputedStyle(video);
      return {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        width: styles.width,
        height: styles.height,
        backgroundColor: styles.backgroundColor,
        objectFit: styles.objectFit,
        transform: styles.transform
      };
    });
    
    console.log('Video computed styles:', computedStyle);
    
    // Video should be visible and not hidden by CSS
    expect(computedStyle.display).not.toBe('none');
    expect(computedStyle.visibility).not.toBe('hidden');
    expect(parseFloat(computedStyle.opacity)).toBeGreaterThan(0);
  });

  test('should handle camera permission denial', async ({ page }) => {
    // Override with failing camera
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => {
            throw new DOMException('Permission denied', 'NotAllowedError');
          }
        },
        configurable: true
      });
    });

    await page.goto('/afval-melden');
    
    // Click camera button
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(2000);

    // Should show error message
    await expect(page.getByText(/Camera niet beschikbaar|niet ondersteund/)).toBeVisible({ timeout: 5000 });
  });
});