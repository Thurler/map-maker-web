const vectorMagnitude = function(v) {
	return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
}

const makeUnitVector = function(a, b) {
	let diff = {x: b.x-a.x, y: b.y-a.y};
	let dist = vectorMagnitude(diff);
	return {x: diff.x/dist, y: diff.y/dist, dist: dist};
};

const angleToZero = function(v) {
	return Math.acos(v.x/vectorMagnitude(v));
};

const getTextHeight = function(family, size) {
	let body = document.getElementsByTagName('body')[0];
	let dummyElement = document.createElement('div');
	let dummyText = document.createTextNode('M');
	dummyElement.appendChild(dummyText);
	let style = 'font-family:"'+family+'";font-size:'+size;
	dummyElement.setAttribute('style', style+';position:absolute;top:0;left:0');
	body.appendChild(dummyElement);
	result = dummyElement.offsetHeight;
	body.removeChild(dummyElement);
	return result;
};

const calcPadTransform = function() {
	// Padding to compensate original zoom out
	let minScale = globals.transform.minScale;
	let scale = globals.transform.scale;
	if (minScale >= 1 || scale === minScale) return {x: 0, y: 0};
	let blockSize = globals.tileSize + globals.gapSize;
	let totalWidth = canvasGrid[0].length * blockSize;
	let extraWidth = (canvasGrid[0].length - globals.maxSize.x) * blockSize;
	if (extraWidth < 0) extraWidth = 0;
	let totalHeight = canvasGrid.length * blockSize;
	let extraHeight = (canvasGrid.length - globals.maxSize.y) * blockSize;
	if (extraHeight < 0) extraHeight = 0;
	if (extraWidth === 0 && extraHeight === 0) return {x: 0, y: 0};
	let offscreenRatioX = globals.transform.translate.x/totalWidth;
	let offscreenRatioY = globals.transform.translate.y/totalHeight;
	return {
		x: offscreenRatioX*extraWidth/scale,
		y: offscreenRatioY*extraHeight/scale
	};
};

const getMousePos = function(event, edgeSnap=false) {
	let rect = event.target.getBoundingClientRect();
	let scale = globals.transform.scale;
	let translate = globals.transform.translate;
	let xPos = ((event.clientX - rect.left - translate.x) / scale) + translate.x;
	let yPos = ((event.clientY - rect.top - translate.y) / scale) + translate.y;
	let pad = calcPadTransform();
	xPos += pad.x;
	yPos += pad.y;
	if (edgeSnap) {
		let blockSize = globals.tileSize + globals.gapSize;
		let tileX = Math.floor(xPos / (globals.tileSize + globals.gapSize));
		let tileY = Math.floor(yPos / (globals.tileSize + globals.gapSize));
		if (tileX === 0) {
			xPos = 0;
		} else if (tileX === canvasGrid[0].length-1) {
			xPos = blockSize * canvasGrid[0].length;
		} else if (scale <= 1) {
			xPos = blockSize * (tileX - 0.5);
		}
		if (tileY === 0) {
			yPos = 0;
		} else if (tileY === canvasGrid.length-1) {
			yPos = blockSize * canvasGrid.length;
		} else if (scale <= 1) {
			yPos = blockSize * (tileY - 0.5);
		}
	}
	return {x: xPos, y: yPos};
};

const processMousePosition = function(pos, force) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	switch(opMode) {
		case OPMODE_TYPE.View:
			updateTooltip(pos, tileX, tileY, tile, force);
			break;
		case OPMODE_TYPE.Floor:
			switch(subOpMode) {
				case SUBOPMODE_TYPE.FloorAdd:
				case SUBOPMODE_TYPE.FloorRemove:
					invertTileType(pos);
					break;
				default:
					updateTooltip(pos, tileX, tileY, tile, force);
					break;
			}
			break;
		case OPMODE_TYPE.Types:
			break;
		case OPMODE_TYPE.Notes:
			break;
		case OPMODE_TYPE.Warps:
			break;
	}
};

const updateTooltip = function(pos, tileX, tileY, tile, force) {
	let newTooltip = null;
	if (tile.type.tooltip) {
		if (tile.type.tooltip === textTooltip) {
			force = true;
		}
		newTooltip = '' + tileX + ',' + tileY;
	}
	if (force || newTooltip !== prevTooltip) {
		prevTooltip = newTooltip;
		drawGrid();
		if (tile.type.tooltip) {
			tile.type.tooltip(pos, tileX, tileY, tile.tooltipArgs);
		}
	}
};

const processMouseDown = function(pos) {
	switch(opMode) {
		case OPMODE_TYPE.View:
			break;
		case OPMODE_TYPE.Floor:
			invertTileType(pos);
			break;
		case OPMODE_TYPE.Types:
			break;
		case OPMODE_TYPE.Notes:
			break;
		case OPMODE_TYPE.Warps:
			break;
	}
};

const processMouseUp = function(pos) {
	switch(opMode) {
		case OPMODE_TYPE.View:
			break;
		case OPMODE_TYPE.Floor:
			subOpMode = null;
			break;
		case OPMODE_TYPE.Types:
			break;
		case OPMODE_TYPE.Notes:
			break;
		case OPMODE_TYPE.Warps:
			break;
	}
};

const invertTileType = function(pos, truecoord=false, dropdraw=false) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (truecoord) {
		tileX = pos.x;
		tileY = pos.y;
	}
	let tile = canvasGrid[tileY][tileX];
	// Revert tile type
	if (tile.type === TILE_TYPE.Empty &&
			(subOpMode === null || subOpMode === SUBOPMODE_TYPE.FloorAdd)) {
		canvasGrid[tileY][tileX] = {type: TILE_TYPE.Basic};
		if (!dropdraw) {
			subOpMode = SUBOPMODE_TYPE.FloorAdd;
		}
	} else if (subOpMode === null || subOpMode === SUBOPMODE_TYPE.FloorRemove) {
		canvasGrid[tileY][tileX] = {type: TILE_TYPE.Empty};
		if (!dropdraw) {
			subOpMode = SUBOPMODE_TYPE.FloorRemove;
		}
	} else {
		return;
	}
	// Clean other tiles that point to this
	if (tile.type === TILE_TYPE.WarpOneSrc && tile.tooltipArgs) {
		let target = tile.tooltipArgs.dest;
		let targetTile = canvasGrid[tileY+target.y][tileX+target.x];
		if (targetTile.tooltipArgs.src.length === 1) {
			delete targetTile.tooltipArgs;
		} else {
			targetTile.tooltipArgs.src = targetTile.tooltipArgs.src.filter((s)=>{
				return s.x !== -target.x || s.y !== -target.y;
			})
		}
	} else if (tile.type === TILE_TYPE.WarpOneDst && tile.tooltipArgs) {
		let targets = tile.tooltipArgs.src;
		targets.forEach((target)=>{
			let targetTile = canvasGrid[tileY+target.y][tileX+target.x];
			delete targetTile.tooltipArgs;
		});
	} else if (tile.type === TILE_TYPE.WarpTwo && tile.tooltipArgs) {
		let target = tile.tooltipArgs.dest;
		let targetTile = canvasGrid[tileY+target.y][tileX+target.x];
		delete targetTile.tooltipArgs;
	}
	if (dropdraw) return;
	drawGrid();
};

const processMouseScroll = function(event) {
	// Compute new transform
	let mousePos = getMousePos(event);
	if (event.deltaY < 0) {
		globals.transform.scale += 0.5;
		if (globals.transform.scale >= 10) {
			globals.transform.scale = 10;
		} else if (globals.transform.scale > 1 && globals.transform.scale < 2) {
			globals.transform.scale = 2;
		} else if (globals.transform.scale < 1) {
			globals.transform.scale = 1;
		}
	} else {
		globals.transform.scale -= 0.5;
		if (globals.transform.scale <= globals.transform.minScale) {
			globals.transform.scale = globals.transform.minScale;
		}
		if (globals.transform.scale > 1 && globals.transform.scale < 2) {
			globals.transform.scale = 1;
		}
	}
	if (globals.transform.scale === globals.transform.minScale) {
		globals.transform.translate = {x: 0, y: 0};
	} else {
		globals.transform.translate = {x: mousePos.x, y: mousePos.y};
	}
	mousePos = getMousePos(event);
	processMousePosition(mousePos, true);
};

const textTooltip = function(pos, x, y, args) {
	if (!args || !args.text) return;
	// Undo canvas transform, text bubble does not need scaling
	let ctx = $('#mainGrid')[0].getContext('2d');
	let scale = globals.transform.scale;
	let translate = globals.transform.translate;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	if (scale <= 1) {
		ctx.translate(pos.x*scale, pos.y*scale);
	} else {
		let diff = {x: translate.x - pos.x, y: translate.y - pos.y};
		ctx.translate(pos.x - (scale*diff.x), pos.y - (scale*diff.y)); // TODO FIX
	}
	// Determine text width / height and font size to use
	ctx.font = 'bold 16px Courier New';
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
		let height = getTextHeight('Courier New', '16px');
		combinedHeight += height;
		textHeights.push(height);
		if (height > maxHeight) {
			maxHeight = height;
		}
	});
	// Add extra space between lines, proportional to max height
	combinedHeight += (splitText.length-1)*(maxHeight*0.05);
	// Draw textbox, fill and stroke it
	let bottomY = -globals.tileSize/6;
	ctx.beginPath();
	ctx.lineWidth = globals.stroke.width;
	ctx.moveTo(0, 0);
	ctx.lineTo(-globals.tileSize/6, bottomY);
	ctx.lineTo(-0.55*textWidth, bottomY);
	ctx.lineTo(-0.55*textWidth, bottomY - combinedHeight - 0.5*maxHeight);
	ctx.lineTo(0.55*textWidth, bottomY - combinedHeight - 0.5*maxHeight);
	ctx.lineTo(0.55*textWidth, bottomY);
	ctx.lineTo(globals.tileSize/6, bottomY);
	ctx.closePath();
	ctx.fillStyle = globals.stroke.fill;
	ctx.strokeStyle = globals.stroke.color;
	ctx.stroke();
	ctx.fill();
	// Compute text top-left corner and draw
	let targetY = bottomY - combinedHeight;
	for (let i = 0; i < splitText.length; i++) {
		let textX = -(textWidth/2);
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
	let dist = vectorMagnitude(vector) - (globals.tileSize/8);
	ctx.translate(centerSX, centerSY);
	if (centerSY < centerDY) {
		ctx.rotate(angle);
	} else {
		ctx.rotate(-angle);
	}
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
	ctx.fillStyle = globals.tileColors[COLOR_TYPE.WarpOne];
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
	args.src.forEach((s)=>warpOneSrcTooltip(x+s.x, y+s.y, {dest: {x: -s.x, y: -s.y}}));
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
	let dist = vectorMagnitude(vector);
	ctx.translate(centerSX, centerSY);
	if (centerSY < centerDY) {
		ctx.rotate(angle);
	} else {
		ctx.rotate(-angle);
	}
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
};

const drawGridBase = function(ctx, empty) {
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw empty tiles when empty = true, others when empty = false
			if (canvasGrid[i][j].type !== TILE_TYPE.Empty ^ empty) {
				ctx.rect(x, y, globals.tileSize, globals.tileSize);
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	let targetColor = (empty) ? TILE_TYPE.Empty.color : TILE_TYPE.Basic.color;
	ctx.fillStyle = globals.tileColors[targetColor];
	ctx.fill();
	ctx.closePath();
};

const drawGridTiles = function(ctx, type) {
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw tiles that match the given type
			if (canvasGrid[i][j].type === type) {
				let diff = (globals.tileSize - globals.innerTileSize) / 2;
				ctx.rect(x+diff, y+diff, globals.innerTileSize, globals.innerTileSize);
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	ctx.fillStyle = globals.tileColors[type.color];
	ctx.fill();
	ctx.closePath();
};

const drawGridHollowTiles = function(ctx, type) {
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw tiles that match the given type
			if (canvasGrid[i][j].type === type) {
				let diff = (globals.tileSize - globals.innerTileSize) / 2;
				let large = globals.innerTileSize;
				let small = globals.innerTileHollowSize;
				ctx.rect(x+diff, y+diff, large, small); // top
				ctx.rect(x+diff, y+diff, small, large); // left
				ctx.rect(x+diff, y+diff+large-small, large, small); // bottom
				ctx.rect(x+diff+large-small, y+diff, small, large); // right
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	ctx.fillStyle = globals.tileColors[type.color];
	ctx.fill();
	ctx.closePath();
};

const drawGrid = function() {
	let canvas = $('#mainGrid')[0];
	// Change canvas width and height based on grid size
	let height = Math.min(canvasGrid.length, globals.maxSize.y);
	let width = Math.min(canvasGrid[0].length, globals.maxSize.x);
	canvas.height = height*(globals.tileSize + globals.gapSize) - globals.gapSize;
	canvas.width = width*(globals.tileSize + globals.gapSize) - globals.gapSize;
	let ctx = canvas.getContext('2d');
	let scale = globals.transform.scale;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Background fill
	ctx.beginPath();
	if (scale < 1) {
		ctx.rect(0, 0, canvas.width/scale, canvas.height/scale);
	} else {
		ctx.rect(0, 0, canvas.width, canvas.height);
	}
	ctx.fillStyle = globals.backGroundColor;
	ctx.fill();
	ctx.closePath();
	ctx.translate(globals.transform.translate.x, globals.transform.translate.y);
	ctx.scale(scale, scale);
	ctx.translate(-globals.transform.translate.x, -globals.transform.translate.y);
	pad = calcPadTransform();
	ctx.translate(-pad.x, -pad.y);
	// Fill tiles based on whether they are empty or not
	drawGridBase(ctx, true);
	drawGridBase(ctx, false);
	drawGridTiles(ctx, TILE_TYPE.Treasure);
	drawGridTiles(ctx, TILE_TYPE.Event);
	drawGridTiles(ctx, TILE_TYPE.WarpOneSrc);
	drawGridHollowTiles(ctx, TILE_TYPE.WarpOneDst);
	drawGridTiles(ctx, TILE_TYPE.WarpTwo);
};

const updateScale = function(width, height) {
	let scaleX = Math.min(globals.maxSize.x/(width), 1);
	let scaleY = Math.min(globals.maxSize.x/(height), 1);
	globals.transform.minScale = Math.min(scaleX, scaleY);
	if (globals.transform.scale <= 1) {
		globals.transform.scale = Math.min(scaleX, scaleY);
	}
};

const convertGrid = function() {
	for (let i = 0; i < canvasGrid.length; i++) {
		for (let j = 0; j < canvasGrid[i].length; j++) {
			let color = canvasGrid[i][j].type.color;
			let key = Object.keys(COLOR_TYPE).find(k=>COLOR_TYPE[k]===color);
			canvasGrid[i][j].type = TILE_TYPE[key];
		}
	}
};

// Global stuff
const OPMODE_TYPE = {
	View: 10,
	Floor: 11,
	Types: 12,
	Notes: 13,
	Warps: 14,
};
const SUBOPMODE_TYPE = {
	FloorAdd: 10,
	FloorRemove: 11,
};
const COLOR_TYPE = {
	Empty: 10,
	Basic: 11,
	Treasure: 12,
	Event: 13,
	WarpOneSrc: 14,
	WarpOneDst: 15,
	WarpTwo: 16,
}
const TILE_TYPE = {
	Empty: {
		color: COLOR_TYPE.Empty,
	},
	Basic: {
		color: COLOR_TYPE.Basic,
	},
	Treasure: {
		color: COLOR_TYPE.Treasure,
		tooltip: textTooltip,
	},
	Event: {
		color: COLOR_TYPE.Event,
		tooltip: textTooltip,
	},
	WarpOneSrc: {
		color: COLOR_TYPE.WarpOneSrc,
		tooltip: warpOneSrcTooltip,
	},
	WarpOneDst: {
		color: COLOR_TYPE.WarpOneDst,
		tooltip: warpOneDstTooltip,
	},
	WarpTwo: {
		color: COLOR_TYPE.WarpTwo,
		tooltip: warpTwoTooltip,
	},
};
let globals = {
	maxSize: {x: 16, y: 16},
	tileSize: 40,
	innerTileSize: 30,
	innerTileHollowSize: 4,
	gapSize: 1,
	stroke: {
		width: 6,
		color: '#444444',
		textColor: '#000000',
		fill: '#EEEEEE',
	},
	arrow: {
		width: 3,
		strokeColor: '#FFFFFF',
		strokeWidth: 2,
	},
	backGroundColor: '#333333',
	tileColors: {
		10: '#000000',
		11: '#FFFFFF',
		12: '#00FF00',
		13: '#FF0000',
		14: '#4488FF',
		15: '#0044FF',
	},
	transform: {
		minScale: 1,
		scale: 1,
		translate: {x: 0, y: 0},
	},
};
let canvasGrid = [];
let prevTooltip = null;
let opMode = OPMODE_TYPE.View;
let subOpMode = null;

$(document).ready(function(){
	// Freeze grid tile 'enums'
	Object.freeze(OPMODE_TYPE);
	Object.freeze(COLOR_TYPE);
	Object.freeze(TILE_TYPE);

	// Load template grid
	canvasGrid = [[
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.WarpOneDst},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.WarpTwo},
		{type: TILE_TYPE.WarpOneSrc},
		{type: TILE_TYPE.WarpOneSrc},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Basic},
		{type: TILE_TYPE.Treasure},
		{type: TILE_TYPE.Basic},
		{type: TILE_TYPE.Event},
		{type: TILE_TYPE.WarpOneSrc},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Basic},
		{type: TILE_TYPE.WarpOneDst},
		{type: TILE_TYPE.WarpTwo},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.WarpOneSrc},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	], [
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
		{type: TILE_TYPE.Empty},
	]];

	// Load event arguments for template grid
	canvasGrid[3][2].tooltipArgs = {text: 'Sample treasure\nOther treasure'};
	canvasGrid[3][4].tooltipArgs = {text: 'Sample event'};
	canvasGrid[2][2].tooltipArgs = {dest: {x: 2, y: 2}};
	canvasGrid[4][4].tooltipArgs = {dest: {x: -2, y: -2}};
	canvasGrid[2][3].tooltipArgs = {dest: {x: 0, y: 2}};
	canvasGrid[2][4].tooltipArgs = {dest: {x: -1, y: 2}};
	canvasGrid[5][3].tooltipArgs = {dest: {x: 0, y: -1}};
	canvasGrid[3][5].tooltipArgs = {dest: {x: -2, y: -2}};
	canvasGrid[4][3].tooltipArgs = {src: [{x: 0, y: -2}, {x: 1, y: -2}, {x: 0, y: 1}]};
	canvasGrid[1][3].tooltipArgs = {src: [{x: 2, y: 2}]};

	// Bind mouse events to grid
	$('#mainGrid').mousemove((event)=>{
		processMousePosition(getMousePos(event));
	});

	$('#mainGrid').mousedown((event)=>{
		switch(event.which) {
			case 1:
				processMouseDown(getMousePos(event));
				break;
			case 3:
				if (globals.transform.scale !== globals.transform.minScale) {
					globals.transform.translate = getMousePos(event, true);
					drawGrid();
				}
				break;
		}
	});

	$('#mainGrid').mouseout((event)=>{
		if (event.which !== 1) return false;
		processMouseUp(getMousePos(event));
	});

	$('#mainGrid').mouseup((event)=>{
		if (event.which !== 1) return false;
		processMouseUp(getMousePos(event));
	});

	$('#mainGrid')[0].addEventListener('wheel', (event)=>{
		processMouseScroll(event);
		return false;
	});

	$('#mainGrid').contextmenu((e)=>false);

	// Bind functions to buttons
	$('#newTop').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		let newRow = [];
		for (let i = 0; i < width; i++) {
			newRow.push({type: TILE_TYPE.Empty});
		}
		canvasGrid.unshift(newRow);
		updateScale(width, height+1);
		drawGrid();
	});

	$('#rmTop').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		if (height === 1) return;
		for (let i = 0; i < width; i++) {
			invertTileType({x: i, y: 0}, true, true);
		}
		canvasGrid.shift();
		updateScale(width, height-1);
		drawGrid();
	});

	$('#newBottom').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		let newRow = [];
		for (let i = 0; i < width; i++) {
			newRow.push({type: TILE_TYPE.Empty});
		}
		canvasGrid.push(newRow);
		if (height >= globals.maxSize.y) {
			updateScale(width, height+1);
		}
		drawGrid();
	});

	$('#rmBottom').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		if (height === 1) return;
		for (let i = 0; i < width; i++) {
			invertTileType({x: i, y: height-1}, true, true);
		}
		canvasGrid.pop();
		updateScale(width, height-1);
		drawGrid();
	});

	$('#newLeft').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		for (let i = 0; i < height; i++) {
			canvasGrid[i].unshift({type: TILE_TYPE.Empty});
		}
		if (width >= globals.maxSize.x) {
			updateScale(width+1, height);
		}
		drawGrid();
	});

	$('#rmLeft').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		if (width === 1) return;
		for (let i = 0; i < height; i++) {
			invertTileType({x: 0, y: i}, true, true);
		}
		for (let i = 0; i < height; i++) {
			canvasGrid[i].shift();
		}
		updateScale(width-1, height);
		drawGrid();
	});

	$('#newRight').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		for (let i = 0; i < height; i++) {
			canvasGrid[i].push({type: TILE_TYPE.Empty});
		}
		if (width >= globals.maxSize.x) {
			updateScale(width+1, height);
		}
		drawGrid();
	});

	$('#rmRight').click((event)=>{
		let width = canvasGrid[0].length;
		let height = canvasGrid.length;
		if (width === 1) return;
		for (let i = 0; i < height; i++) {
			invertTileType({x: width-1, y: i}, true, true);
		}
		for (let i = 0; i < height; i++) {
			canvasGrid[i].pop();
		}
		updateScale(width-1, height);
		drawGrid();
	});

	$('#saveGrid').click((event)=>{
		let link = document.createElement('a');
		link.download = 'yourgrid.map';
		link.href = 'data:text/plain;charset=utf-8,' + JSON.stringify(canvasGrid);
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
	});

	$('#loadGrid').click((event)=>{
		$('#loadInput').trigger('click');
	});

	$('#loadInput').change((event)=>{
		let file = (event.target).files[0];
		if (!file) return;
		let reader = new FileReader();
		reader.readAsText(file, 'UTF-8');
		reader.onload = (evt)=>{
			canvasGrid = JSON.parse(evt.target.result);
			convertGrid();
			updateScale(canvasGrid[0].length, canvasGrid.length);
			drawGrid();
		};
	});

	$('#viewNav').click((event)=>opMode=OPMODE_TYPE.View);
	$('#viewFloor').click((event)=>opMode=OPMODE_TYPE.Floor);
	$('#viewTypes').click((event)=>opMode=OPMODE_TYPE.Types);
	$('#viewTexts').click((event)=>opMode=OPMODE_TYPE.Notes);
	$('#viewWarps').click((event)=>opMode=OPMODE_TYPE.Warps);

	// Draw template grid
	drawGrid();
});
