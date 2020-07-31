const textTooltip = function(pos, x, y, args) {
	if (!args || !args.text) return;
	// Undo canvas transform, text bubble does not need scaling
	let ctx = $('#mainGrid')[0].getContext('2d');
	let scale = globals.transform.scale;
	let translate = globals.transform.translate;
	// Determine text width / height and font size to use
	ctx.font = 'bold 16px Arial';
	// Split into lines and get max width, combine heights
	let splitText = args.text.split('\n');
	let combinedHeight = 0;
	let textWidth = 0;
	let maxHeight = 0;
	let textHeights = [];
	splitText.forEach((line)=>{
		let width = ctx.measureText(line).width;
		if (width > textWidth) {
			textWidth = width;
		}
		let height = getTextHeight('Arial', '16px');
		combinedHeight += height;
		textHeights.push(height);
		if (height > maxHeight) {
			maxHeight = height;
		}
	});
	// Add extra space between lines, proportional to max height
	combinedHeight += (splitText.length-1)*(maxHeight*0.05);
	// Draw textbox, fill and stroke it
	let sourceX = (globals.tileSize + globals.gapSize) * x;
	let sourceY = (globals.tileSize + globals.gapSize) * y;
	let centerX = sourceX + (globals.tileSize/2);
	let bottomY = sourceY + (globals.tileSize/6);
	ctx.beginPath();
	ctx.lineWidth = globals.stroke.width;
	ctx.moveTo(centerX, sourceY + (globals.tileSize/3));
	ctx.lineTo(centerX - globals.tileSize/6, bottomY);
	ctx.lineTo(centerX - (0.55*textWidth), bottomY);
	ctx.lineTo(centerX - (0.55*textWidth), bottomY - combinedHeight - 0.5*maxHeight);
	ctx.lineTo(centerX + (0.55*textWidth), bottomY - combinedHeight - 0.5*maxHeight);
	ctx.lineTo(centerX + (0.55*textWidth), bottomY);
	ctx.lineTo(centerX + globals.tileSize/6, bottomY);
	ctx.closePath();
	ctx.fillStyle = globals.stroke.fill;
	ctx.strokeStyle = globals.stroke.color;
	ctx.stroke();
	ctx.fill();
	// Compute text top-left corner and draw
	let targetY = bottomY - combinedHeight;
	for (let i = 0; i < splitText.length; i++) {
		let textX = centerX - (textWidth/2);
		let textY = targetY + (textHeights[i]/2);
		targetY += (textHeights[i] + (maxHeight*0.05));
		ctx.fillStyle = globals.stroke.textColor;
		ctx.fillText(splitText[i], textX, textY);
	}
};

const warpOneSrcTooltip = function(pos, x, y, args) {
	if (!args || !args.dest) return;
	// Compute tile coordinates
	let sourceX = (globals.tileSize + globals.gapSize) * x;
	let sourceY = (globals.tileSize + globals.gapSize) * y;
	// Compute target tile coordinates
	let destX = (globals.tileSize + globals.gapSize) * (x + args.dest.x);
	let destY = (globals.tileSize + globals.gapSize) * (y + args.dest.y);
	// Draw arrow, fill amd stoke it
	let centerSX = sourceX + (globals.tileSize/2);
	let centerSY = sourceY + (globals.tileSize/2);
	let centerDX = destX + (globals.tileSize/2);
	let centerDY = destY + (globals.tileSize/2);
	let width = globals.arrow.width;
	let ctx = $('#mainGrid')[0].getContext('2d');
	ctx.beginPath();
	let vector = {x: centerDX-centerSX, y: centerDY-centerSY};
	let angle = angleToZero(vector);
	if (centerSY > centerDY) {
		angle = -angle;
	}
	let dist = vectorMagnitude(vector) - (globals.tileSize/8);
	ctx.translate(centerSX, centerSY);
	ctx.rotate(angle);
	ctx.translate(-centerSX, -centerSY);
	ctx.lineWidth = globals.arrow.strokeWidth;
	ctx.moveTo(centerSX, centerSY - (width/2));
	ctx.lineTo(centerSX, centerSY + (width/2));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY + (width/2));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY + (2*width));
	ctx.lineTo(centerSX + dist, centerSY);
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY - (2*width));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY - (width/2));
	ctx.closePath();
	ctx.fillStyle = globals.tileColors[COLOR_TYPE.WarpOneSrc];
	ctx.strokeStyle = globals.arrow.strokeColor;
	ctx.stroke();
	ctx.fill();
	ctx.translate(centerSX, centerSY);
	ctx.rotate(-angle);
	ctx.translate(-centerSX, -centerSY);
};

const warpOneDstTooltip = function(pos, x, y, args) {
	if (!args || !args.src) return;
	// Compute reverse direction
	args.src.forEach((s)=>warpOneSrcTooltip(
		pos, x+s.x, y+s.y, {dest: {x: -s.x, y: -s.y}}
	));
};

const warpTwoTooltip = function(pos, x, y, args) {
	if (!args || !args.dest) return;
	// Compute tile coordinates
	let sourceX = (globals.tileSize + globals.gapSize) * x;
	let sourceY = (globals.tileSize + globals.gapSize) * y;
	// Compute target tile coordinates
	let destX = (globals.tileSize + globals.gapSize) * (x + args.dest.x);
	let destY = (globals.tileSize + globals.gapSize) * (y + args.dest.y);
	// Draw arrow, fill amd stoke it
	let centerSX = sourceX + (globals.tileSize/2);
	let centerSY = sourceY + (globals.tileSize/2);
	let centerDX = destX + (globals.tileSize/2);
	let centerDY = destY + (globals.tileSize/2);
	let width = globals.arrow.width;
	let ctx = $('#mainGrid')[0].getContext('2d');
	ctx.beginPath();
	let vector = {x: centerDX-centerSX, y: centerDY-centerSY};
	let angle = angleToZero(vector);
	if (centerSY > centerDY) {
		angle = -angle;
	}
	let dist = vectorMagnitude(vector);
	ctx.translate(centerSX, centerSY);
	ctx.rotate(angle);
	ctx.translate(-centerSX, -centerSY);
	ctx.lineWidth = globals.arrow.strokeWidth;
	ctx.moveTo(centerSX, centerSY);
	ctx.lineTo(centerSX + (globals.tileSize/8), centerSY + (2*width));
	ctx.lineTo(centerSX + (globals.tileSize/8), centerSY + (width/2));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY + (width/2));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY + (2*width));
	ctx.lineTo(centerSX + dist, centerSY);
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY - (2*width));
	ctx.lineTo(centerSX + dist - (globals.tileSize/8), centerSY - (width/2));
	ctx.lineTo(centerSX + (globals.tileSize/8), centerSY - (width/2));
	ctx.lineTo(centerSX + (globals.tileSize/8), centerSY - (2*width));
	ctx.closePath();
	ctx.fillStyle = globals.tileColors[COLOR_TYPE.WarpTwo];
	ctx.strokeStyle = globals.arrow.strokeColor;
	ctx.stroke();
	ctx.fill();
	ctx.translate(centerSX, centerSY);
	ctx.rotate(-angle);
	ctx.translate(-centerSX, -centerSY);
};
