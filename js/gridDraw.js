const drawGridBase = function(ctx, empty, opacity) {
	if (opacity) {
		ctx.globalAlpha = opacity.value;
	}
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw empty tiles when empty = true, others when empty = false
			if (canvasGrid[i][j].type !== TILE_TYPE.Empty ^ empty) {
				if (!opacity || opacity.func(canvasGrid[i][j])) {
					ctx.rect(x, y, globals.tileSize, globals.tileSize);
				}
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	let targetColor = (empty) ? TILE_TYPE.Empty.color : TILE_TYPE.Basic.color;
	ctx.fillStyle = globals.tileColors[targetColor];
	ctx.fill();
	ctx.closePath();
	if (opacity) {
		ctx.globalAlpha = 1;
	}
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

const drawNotes = function(ctx) {
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw tiles that have notes
			if (canvasGrid[i][j].note) {
				let diff = (globals.tileSize) / 2;
				// Draw triangle on top right corner
				ctx.moveTo(x+globals.tileSize, y);
				ctx.lineTo(x+globals.tileSize, y+diff);
				ctx.lineTo(x+globals.tileSize-diff, y);
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	ctx.fillStyle = globals.tileColors.note;
	ctx.fill();
	ctx.closePath();
}

const drawMixedTiles = function(ctx, type, halfA, halfB, top=true) {
	ctx.beginPath();
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw tiles that match the given type
			if (canvasGrid[i][j].type === type) {
				let diff = (globals.tileSize - globals.innerTileSize) / 2;
				if (top) {
					// Draw rectangle as a normal tile would
					ctx.rect(x+diff, y+diff, globals.innerTileSize, globals.innerTileSize);
				} else {
					// Draw triangle over bottom right half of rectangle
					ctx.moveTo(x+diff, y+diff+globals.innerTileSize);
					ctx.lineTo(x+diff+globals.innerTileSize, y+diff);
					ctx.lineTo(x+diff+globals.innerTileSize, y+diff+globals.innerTileSize);
				}
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
	ctx.fillStyle = globals.tileColors[(top) ? halfA.color : halfB.color];
	ctx.fill();
	ctx.closePath();
	if (top) drawMixedTiles(ctx, type, halfA, halfB, false);
}

const drawStairsTiles = function(ctx, type, up) {
	ctx.lineWidth = 4;
	ctx.strokeStyle = '#000000';
	ctx.fillStyle = globals.tileColors[type.color];
	let x = y = 0;
	for (let i = 0; i < canvasGrid.length; i++) {
		x = 0;
		for (let j = 0; j < canvasGrid[i].length; j++) {
			// Only draw tiles that match the given type
			if (canvasGrid[i][j].type === type) {
				ctx.beginPath();
				if (!up) {
					ctx.translate(x+(globals.tileSize/2), y+(globals.tileSize/2));
					ctx.rotate(Math.PI);
					ctx.translate(-(x+(globals.tileSize/2)), -(y+(globals.tileSize/2)));
				}
				let outer = (globals.tileSize - globals.innerTileSize) / 2;
				let inner = (globals.innerTileSize/3);
				ctx.moveTo(x+outer+inner, y+outer+globals.innerTileSize);
				ctx.lineTo(x+outer+inner, y+outer+(globals.innerTileSize/2));
				ctx.lineTo(x+outer, y+outer+(globals.innerTileSize/2));
				ctx.lineTo(x+(globals.tileSize/2), y+outer);
				ctx.lineTo(x+globals.tileSize-outer, y+outer+(globals.innerTileSize/2));
				ctx.lineTo(x+globals.tileSize-outer-inner, y+outer+(globals.innerTileSize/2));
				ctx.lineTo(x+globals.tileSize-outer-inner, y+outer+globals.innerTileSize);
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
				if (!up) {
					ctx.translate(x+(globals.tileSize/2), y+(globals.tileSize/2));
					ctx.rotate(Math.PI);
					ctx.translate(-(x+(globals.tileSize/2)), -(y+(globals.tileSize/2)));
				}
			}
			x += globals.tileSize + globals.gapSize;
		}
		y += globals.tileSize + globals.gapSize;
	}
}

const textOpacityFunc = function(tile) {
	return (tile.type.tooltip === textTooltip || tile.note);
};

const warpOpacityFunc = function(tile) {
	return (
		tile.type.tooltip === warpOneSrcTooltip ||
		tile.type.tooltip === warpOneDstTooltip ||
		tile.type.tooltip === warpTwoTooltip
	);
};

const drawGrid = function(target='#mainGrid', forceScale=0) {
	let canvas = $(target)[0];
	// Change canvas width and height based on grid size
	let height = Math.min(canvasGrid.length, globals.maxSize.y);
	let width = Math.min(canvasGrid[0].length, globals.maxSize.x);
	if (forceScale > 0) {
		height = canvasGrid.length;
		width = canvasGrid[0].length;
	}
	canvas.height = height*(globals.tileSize + globals.gapSize) - globals.gapSize;
	canvas.width = width*(globals.tileSize + globals.gapSize) - globals.gapSize;
	if (forceScale > 0) {
		canvas.height = canvas.height * forceScale;
		canvas.width = canvas.width * forceScale;
	}
	let ctx = canvas.getContext('2d');
	let scale = (forceScale > 0) ? forceScale : globals.transform.scale;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Background fill
	ctx.beginPath();
	if (forceScale === 0 && scale < 1) {
		ctx.rect(0, 0, canvas.width/scale, canvas.height/scale);
	} else {
		ctx.rect(0, 0, canvas.width, canvas.height);
	}
	ctx.fillStyle = globals.backGroundColor;
	ctx.fill();
	ctx.closePath();
	if (forceScale === 0) {
		ctx.translate(globals.transform.translate.x, globals.transform.translate.y);
	}
	ctx.scale(scale, scale);
	if (forceScale === 0) {
		ctx.translate(-globals.transform.translate.x, -globals.transform.translate.y);
		pad = calcPadTransform();
		ctx.translate(-pad.x, -pad.y);
	}
	// Fill tiles based on whether they are empty or not
	drawGridBase(ctx, true);
	switch(opacityMode) {
		case OPACITY_TYPE.None:
			drawGridBase(ctx, false);
			break;
		case OPACITY_TYPE.TextTips:
			drawGridBase(ctx, false, {value: 1, func: textOpacityFunc});
			drawGridBase(ctx, false, {value: 0.35, func: (t)=>!textOpacityFunc(t)});
			break;
		case OPACITY_TYPE.Warps:
			drawGridBase(ctx, false, {value: 1, func: warpOpacityFunc});
			drawGridBase(ctx, false, {value: 0.35, func: (t)=>!warpOpacityFunc(t)});
			break;
	}
	drawGridTiles(ctx, TILE_TYPE.Treasure);
	drawGridTiles(ctx, TILE_TYPE.Event);
	drawGridTiles(ctx, TILE_TYPE.WarpOneSrc);
	drawGridTiles(ctx, TILE_TYPE.WarpTwo);
	drawGridTiles(ctx, TILE_TYPE.LockedTreasure);
	drawGridTiles(ctx, TILE_TYPE.RelayCircle);
	drawGridTiles(ctx, TILE_TYPE.Boss);
	drawGridHollowTiles(ctx, TILE_TYPE.WarpOneDst);
	drawMixedTiles(ctx, TILE_TYPE.EventBoss, TILE_TYPE.Event, TILE_TYPE.Boss);
	drawStairsTiles(ctx, TILE_TYPE.StairsUp, true);
	drawStairsTiles(ctx, TILE_TYPE.StairsDown, false);
	drawNotes(ctx);
};
