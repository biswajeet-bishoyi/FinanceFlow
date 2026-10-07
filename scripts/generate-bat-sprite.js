const fs = require('fs');
const path = require('path');

// 32x32 pixel grid per frame, 6 frames total = 192x32
// 1 = filled pixel, 0 = transparent

function createGrid() {
  return Array.from({ length: 32 }, () => Array(32).fill(0));
}

function setPixel(grid, x, y) {
  if (x >= 0 && x < 32 && y >= 0 && y < 32) {
    grid[y][x] = 1;
  }
}

function setSymmetric(grid, x, y) {
  setPixel(grid, x, y);
  setPixel(grid, 31 - x, y);
}

function setRect(grid, x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      grid[y][x] = 1;
    }
  }
}

function setSymmetricRect(grid, x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setSymmetric(grid, x, y);
    }
  }
}

// Common body
function drawBody(grid, yOffset = 0) {
  // Ears
  setSymmetric(grid, 13, 10 + yOffset);
  setSymmetric(grid, 13, 11 + yOffset);
  setSymmetric(grid, 14, 11 + yOffset);

  // Head
  setSymmetricRect(grid, 14, 12 + yOffset, 15, 14 + yOffset);
  
  // Torso
  setSymmetricRect(grid, 14, 15 + yOffset, 15, 19 + yOffset);
  setSymmetricRect(grid, 13, 16 + yOffset, 13, 18 + yOffset);
  
  // Lower body / tail
  setSymmetric(grid, 14, 20 + yOffset);
  setSymmetric(grid, 15, 20 + yOffset);
  setSymmetric(grid, 15, 21 + yOffset);
}

// Frame 0: Wings High Up (as in screenshot)
function frame0() {
  const g = createGrid();
  drawBody(g, 0);

  // Floating accent pixels (motion dots)
  setSymmetric(g, 13, 7);
  setSymmetric(g, 10, 8);
  setSymmetric(g, 6, 11);
  setSymmetric(g, 4, 13);

  // Main wings curved up high
  setSymmetric(g, 12, 12);
  setSymmetric(g, 12, 13);
  setSymmetricRect(g, 10, 13, 11, 15);
  setSymmetricRect(g, 9, 14, 9, 17);
  setSymmetricRect(g, 8, 13, 8, 18);
  setSymmetricRect(g, 7, 12, 7, 19);
  setSymmetricRect(g, 6, 14, 6, 18);
  
  // High wing tip
  setSymmetric(g, 11, 10);
  setSymmetric(g, 10, 11);
  setSymmetric(g, 9, 11);
  setSymmetric(g, 9, 12);
  setSymmetric(g, 8, 10);
  setSymmetric(g, 8, 11);
  setSymmetric(g, 7, 11);
  
  // Wing bottom scallops
  setSymmetric(g, 8, 19);
  setSymmetric(g, 9, 18);
  setSymmetric(g, 11, 17);
  setSymmetric(g, 12, 16);
  return g;
}

// Frame 1: Wings reaching up & outward
function frame1() {
  const g = createGrid();
  drawBody(g, 0);

  // Floating dots
  setSymmetric(g, 7, 9);
  setSymmetric(g, 4, 12);

  // Wing upper arch
  setSymmetricRect(g, 11, 12, 12, 13);
  setSymmetricRect(g, 9, 11, 10, 12);
  setSymmetricRect(g, 7, 10, 8, 11);
  setSymmetric(g, 6, 10);
  setSymmetric(g, 5, 11);

  // Wing body / webbing
  setSymmetricRect(g, 5, 12, 6, 16);
  setSymmetricRect(g, 7, 12, 8, 17);
  setSymmetricRect(g, 9, 13, 10, 16);
  setSymmetricRect(g, 11, 14, 12, 16);

  // Lower scallop tips
  setSymmetric(g, 5, 17);
  setSymmetric(g, 7, 18);
  setSymmetric(g, 10, 17);
  return g;
}

// Frame 2: Wings horizontal / full spread
function frame2() {
  const g = createGrid();
  drawBody(g, 0);

  // Floating dots
  setSymmetric(g, 2, 13);

  // Horizontal wingspan
  setSymmetricRect(g, 3, 13, 5, 14);
  setSymmetricRect(g, 6, 12, 9, 14);
  setSymmetricRect(g, 10, 13, 12, 15);
  
  // Webbing depth
  setSymmetricRect(g, 4, 15, 6, 16);
  setSymmetricRect(g, 7, 15, 9, 17);
  setSymmetricRect(g, 10, 16, 12, 17);

  // Scallops bottom
  setSymmetric(g, 3, 15);
  setSymmetric(g, 6, 17);
  setSymmetric(g, 9, 18);
  setSymmetric(g, 11, 17);
  return g;
}

// Frame 3: Wings angled down
function frame3() {
  const g = createGrid();
  drawBody(g, -1); // body bobs slightly up

  // Shoulder
  setSymmetricRect(g, 11, 12, 12, 14);
  setSymmetricRect(g, 9, 13, 10, 15);
  setSymmetricRect(g, 7, 14, 8, 17);

  // Wing downward slope
  setSymmetricRect(g, 5, 16, 6, 19);
  setSymmetricRect(g, 4, 18, 5, 21);
  setSymmetric(g, 4, 22);

  // Webbing inner
  setSymmetricRect(g, 8, 18, 10, 18);
  setSymmetricRect(g, 6, 20, 7, 21);
  return g;
}

// Frame 4: Wings fully down (scooped)
function frame4() {
  const g = createGrid();
  drawBody(g, -1);

  // Inner wings
  setSymmetricRect(g, 11, 13, 12, 15);
  setSymmetricRect(g, 10, 15, 11, 17);
  setSymmetricRect(g, 9, 17, 10, 19);

  // Downward wingtips
  setSymmetricRect(g, 7, 18, 8, 22);
  setSymmetricRect(g, 6, 20, 7, 23);
  setSymmetric(g, 6, 24);
  setSymmetric(g, 7, 24);
  return g;
}

// Frame 5: Wings rising back up
function frame5() {
  const g = createGrid();
  drawBody(g, 0);

  // Wings mid-rise
  setSymmetricRect(g, 11, 13, 12, 15);
  setSymmetricRect(g, 9, 14, 10, 16);
  setSymmetricRect(g, 7, 14, 8, 17);
  setSymmetricRect(g, 6, 15, 6, 18);
  setSymmetricRect(g, 5, 14, 5, 17);
  
  // Scallops
  setSymmetric(g, 6, 19);
  setSymmetric(g, 8, 18);
  setSymmetric(g, 10, 17);
  return g;
}

const frames = [frame0(), frame1(), frame2(), frame3(), frame4(), frame5()];

// Generate 192x32 SVG sprite sheet
let svgPaths = '';
frames.forEach((grid, frameIdx) => {
  const offsetX = frameIdx * 32;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (grid[y][x]) {
        svgPaths += `<rect x="${offsetX + x}" y="${y}" width="1" height="1"/>`;
      }
    }
  }
});

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 32" width="192" height="32" shape-rendering="crispEdges" fill="currentColor">
${svgPaths}
</svg>`;

const outputPath = path.join(__dirname, '..', 'public', 'bat-sprite.svg');
fs.writeFileSync(outputPath, svgContent);
console.log('Successfully wrote', outputPath);
