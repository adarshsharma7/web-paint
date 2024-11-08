// drawShapes.js

export const drawShape = (ctx, startX, startY, endX, endY, mode,color,brushSize) => {
    ctx.beginPath(); // Start a new path for each shape
    ctx.strokeStyle = color; // Set color
    ctx.lineWidth = brushSize; // Set brush size
    if (mode === "circle") {
        const radius = Math.hypot(endX - startX, endY - startY);
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    } else if (mode === "rectangle") {
        ctx.rect(startX, startY, endX - startX, endY - startY);
    } else if (mode === "line") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
    } else if (mode === "arrow") {
        drawArrow(ctx, startX, startY, endX, endY);
    } else if (mode === "ellipse") {
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        ctx.ellipse(startX + radiusX, startY + radiusY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    } else if (mode === "triangle") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(startX - (endX - startX), endY);
        ctx.closePath();
    } else if (mode === "star") {
        drawStar(ctx, startX, startY, 5, Math.hypot(endX - startX, endY - startY) / 2, 0.5);
    }
    ctx.stroke(); // Render the shape's outline
};

const drawArrow = (ctx, startX, startY, endX, endY) => {
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowHeadLength = 10;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
        endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
        endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
};

const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadiusFactor) => {
    const innerRadius = outerRadius * innerRadiusFactor;
    const step = Math.PI / spikes;
    ctx.moveTo(cx + outerRadius, cy);
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = step * i;
        ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    ctx.closePath();
};
