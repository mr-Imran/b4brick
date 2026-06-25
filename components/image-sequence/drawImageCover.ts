/**
 * Draws an image on canvas using "cover" fit — fills the viewport while
 * preserving aspect ratio (cropping overflow).
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  backgroundColor = "#0a0a0a",
  options?: { skipBackground?: boolean },
): void {
  if (!options?.skipBackground) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  if (!image.complete || image.naturalWidth === 0) return;

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = drawHeight * imageRatio;
    offsetX = (width - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / imageRatio;
    offsetX = 0;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}
