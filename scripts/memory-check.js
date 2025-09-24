#!/usr/bin/env node

const used = process.memoryUsage();
const formatBytes = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

console.log('Memory Usage:');
console.log('RSS:', formatBytes(used.rss));
console.log('Heap Used:', formatBytes(used.heapUsed));
console.log('Heap Total:', formatBytes(used.heapTotal));
console.log('External:', formatBytes(used.external));
console.log('Array Buffers:', formatBytes(used.arrayBuffers));

// Force garbage collection if available
if (global.gc) {
  global.gc();
  console.log('Garbage collection triggered');
}
