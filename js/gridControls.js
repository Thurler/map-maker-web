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

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
})

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
	if (!force && (!canvasGrid[tileY] || !canvasGrid[tileY][tileX])) return;
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
			drawGrid();
			break;
		case OPMODE_TYPE.Notes:
			updateTooltip(pos, tileX, tileY, tile, force);
			break;
		case OPMODE_TYPE.Warps:
			break;
	}
};

const updateTooltip = function(pos, tileX, tileY, tile, force) {
	let newTooltip = null;
	if (tile && (tile.type.tooltip || tile.note)) {
		newTooltip = '' + tileX + ',' + tileY;
	}
	if (force || newTooltip !== prevTooltip) {
		prevTooltip = newTooltip;
		drawGrid();
		if (tile && tile.type.tooltip) {
			tile.type.tooltip(pos, tileX, tileY, tile.tooltipArgs);
		}
		if (tile && tile.note) {
			textTooltip(pos, tileX, tileY, {text: tile.note});
		}
	}
};

const processMouseDown = function(pos) {
	switch(opMode) {
		case OPMODE_TYPE.Floor:
			invertTileType(pos);
			break;
		case OPMODE_TYPE.Types:
			changeTileType(pos);
			break;
		case OPMODE_TYPE.Notes:
			addTileNote(pos);
			break;
		case OPMODE_TYPE.Warps:
			break;
		case OPMODE_TYPE.View:
		default:
			break;
	}
};

const processMouseUp = function(pos) {
	switch(opMode) {
		case OPMODE_TYPE.Floor:
			subOpMode = null;
			break;
		case OPMODE_TYPE.View:
		case OPMODE_TYPE.Types:
		case OPMODE_TYPE.Notes:
		case OPMODE_TYPE.Warps:
		default:
			break;
	}
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
