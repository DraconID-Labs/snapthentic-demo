# @snapthentic/stenography

A comprehensive TypeScript library for LSB (Least Significant Bit) steganography - the art of hiding data within images. Built with pure JavaScript using JIMP - no native dependencies required!

## Features

- 🔐 **LSB Steganography**: Hide text messages in images with minimal visual impact
- 🎛️ **Configurable**: Adjust bits per channel, color channels, and encoding options
- 📊 **Quality Analysis**: Built-in tools to measure image quality degradation
- 🎯 **Capacity Calculation**: Determine how much data can be hidden in an image
- 📈 **Performance Optimized**: Fast encoding and decoding with JIMP
- 🛡️ **Type Safe**: Full TypeScript support with comprehensive types
- 🧪 **Well Tested**: Includes examples and demo scripts
- ⚡ **Zero Native Dependencies**: Pure JavaScript implementation using JIMP

## Installation

```bash
npm install @snapthentic/stenography
```

## Quick Start

```typescript
import {
  encodeMessage,
  decodeMessage,
  createSampleImage,
  calculateCapacity,
  imageToBuffer,
} from '@snapthentic/stenography';

// Create a sample image or load your own
const image = await createSampleImage(400, 300);
const imageBuffer = await imageToBuffer(image);

// Hide a secret message
const secret = 'This is a hidden message!';
const result = await encodeMessage(imageBuffer, secret);

// Extract the hidden message
const modifiedBuffer = await imageToBuffer(result.image);
const decoded = await decodeMessage(modifiedBuffer);
console.log(decoded.message); // "This is a hidden message!"
```

## How LSB Steganography Works

LSB steganography works by replacing the least significant bits of pixel color values with bits from your secret message. Since the LSB contributes minimally to the overall color, changes are virtually imperceptible to the human eye.

### Example:

- Original pixel RGB: `(255, 128, 64)` → Binary: `(11111111, 10000000, 01000000)`
- After hiding '1', '0', '1': `(11111111, 10000000, 01000001)` → RGB: `(255, 128, 65)`
- Visual difference: Negligible!

## API Reference

### Core Functions

#### `encodeMessage(imagePath, message, options?)`

Hides a message within an image using LSB steganography.

```typescript
const result = await encodeMessage(imageBuffer, 'Secret message', {
  bitsPerChannel: 1, // 1-8 bits per color channel
  channels: 'rgb', // 'rgb' or 'rgba'
  includeHeader: true, // Include message length header
});
```

**Returns:** `EncodingResult`

- `image`: Jimp image object with hidden message
- `capacity`: Maximum bytes that can be hidden
- `bytesUsed`: Actual bytes used
- `efficiency`: Usage ratio (bytesUsed / capacity)

#### `decodeMessage(imagePath, options?)`

Extracts a hidden message from an image.

```typescript
const result = await decodeMessage(imageBuffer, {
  bitsPerChannel: 1,
  channels: 'rgb',
  includeHeader: true,
});
```

**Returns:** `DecodingResult`

- `message`: The extracted message
- `bytesRead`: Number of bytes read

#### `calculateCapacity(width, height, options?)`

Calculates the maximum data capacity for an image.

```typescript
const capacity = calculateCapacity(800, 600, {
  bitsPerChannel: 2,
  channels: 'rgba',
});
console.log(`Can hide up to ${capacity} bytes`);
```

### Utility Functions

#### `createSampleImage(width?, height?)`

Creates a test image with a colorful checkerboard pattern.

```typescript
const image = await createSampleImage(400, 300);
const buffer = await imageToBuffer(image);
```

#### `imageToBuffer(image, format?)`

Converts a Jimp image to a buffer.

```typescript
const buffer = await imageToBuffer(image, 'image/png');
```

#### `compareImages(original, modified)`

Analyzes the quality difference between two images.

```typescript
const metrics = await compareImages(originalBuffer, modifiedBuffer);
console.log(`PSNR: ${metrics.psnr} dB`); // Higher is better
```

#### `prefixSignature(message)` / `stripPrefix(signature)`

Add/remove version prefixes to messages for compatibility.

```typescript
const signed = prefixSignature('Hello'); // "snapthentic:v1:Hello"
const original = stripPrefix(signed); // "Hello"
```

## Configuration Options

### `SteganographyOptions`

```typescript
interface SteganographyOptions {
  bitsPerChannel?: number; // 1-8, default: 1
  channels?: 'rgb' | 'rgba'; // default: 'rgb'
  includeHeader?: boolean; // default: true
}
```

### Bits Per Channel

- **1 bit**: Maximum stealth, minimal capacity
- **2-3 bits**: Good balance of stealth and capacity
- **4+ bits**: High capacity, visible artifacts possible

### Channels

- **RGB**: 3 channels, better compatibility
- **RGBA**: 4 channels, 33% more capacity

### Header Mode

- **With header** (recommended): Stores message length for reliable extraction
- **Without header**: Slightly more capacity, less reliable

## Examples

### Basic Usage

```typescript
import {
  encodeMessage,
  decodeMessage,
  imageToBuffer,
} from '@snapthentic/stenography';
import Jimp from 'jimp';

const message = 'Top secret information!';
const image = await Jimp.read('photo.png');
const imageBuffer = await imageToBuffer(image);

// Hide the message
const encoded = await encodeMessage(imageBuffer, message);
await encoded.image.writeAsync('photo_with_secret.png');

// Extract the message
const decoded = await decodeMessage('./photo_with_secret.png');
console.log(decoded.message); // "Top secret information!"
```

### High Capacity Mode

```typescript
// Use 2 bits per channel and RGBA for maximum capacity
const options = {
  bitsPerChannel: 2,
  channels: 'rgba' as const,
  includeHeader: true,
};

const capacity = calculateCapacity(1920, 1080, options);
console.log(`HD image can hide ${capacity} bytes`); // ~2MB+

const result = await encodeMessage(imageBuffer, largeMessage, options);
```

### Structured Data

```typescript
// Hide JSON data
const userData = {
  id: '12345',
  name: 'John Doe',
  timestamp: new Date().toISOString(),
  signature: 'abc123...',
};

const jsonString = JSON.stringify(userData);
const encoded = await encodeMessage(imageBuffer, jsonString);

// Later...
const modifiedBuffer = await imageToBuffer(encoded.image);
const decoded = await decodeMessage(modifiedBuffer);
const extractedData = JSON.parse(decoded.message);
```

### Quality Analysis

```typescript
const original = await imageToBuffer(originalImage);
const modified = await imageToBuffer(encodedResult.image);

const quality = await compareImages(original, modified);

if (quality.psnr > 50) {
  console.log('Excellent quality - changes invisible');
} else if (quality.psnr > 40) {
  console.log('Very good quality - minimal artifacts');
} else {
  console.log('Quality degraded - consider fewer bits per channel');
}
```

## Running Examples

The package includes comprehensive examples and a demo:

```bash
# Run the interactive demo
npm run demo

# Run all examples
npm run examples
```

## Capacity Reference

Typical capacities for common image sizes (1-bit LSB, RGB):

| Image Size | Pixels | Capacity |
| ---------- | ------ | -------- |
| 400×300    | 120K   | ~45KB    |
| 800×600    | 480K   | ~180KB   |
| 1920×1080  | 2M     | ~777KB   |
| 4000×3000  | 12M    | ~4.5MB   |

## Performance

Encoding/decoding performance on modern hardware (using JIMP):

- **Small images** (400×300): ~100ms
- **Medium images** (800×600): ~300ms
- **Large images** (1920×1080): ~800ms

_Note: JIMP is pure JavaScript, so it's slower than native canvas implementations but much more portable._

## Security Considerations

⚠️ **Important**: LSB steganography provides **data hiding**, not encryption. For sensitive data:

1. **Encrypt first**: Use AES or similar before hiding
2. **Use strong images**: Photos with lots of detail work best
3. **Avoid compression**: JPEG compression can destroy hidden data
4. **Test extraction**: Always verify your hidden data survives

## Browser Support

Works everywhere JavaScript runs:

- ✅ Node.js (no native dependencies!)
- ✅ Modern browsers
- ✅ Electron apps
- ✅ React Native (with react-native-fs for file operations)
- ✅ Web Workers
- ✅ Edge computing platforms

## Why JIMP instead of Canvas?

- **Zero native dependencies** - no compilation required
- **Cross-platform** - works in browsers and Node.js
- **Lightweight** - smaller bundle size
- **Reliable** - no platform-specific build issues
- **Pure JavaScript** - easier to debug and deploy

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

**Note**: This library is for educational and legitimate use cases. Please respect privacy laws and obtain proper authorization before hiding data in images you don't own.
