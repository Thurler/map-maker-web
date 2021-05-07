const invertTileType = function(pos, truecoord=false, dropdraw=false) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (truecoord) {
		tileX = pos.x;
		tileY = pos.y;
	}
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
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

const dropdownCallback = function(key) {
	$('#dropBtn').html(TILE_TYPE[key].name);
};

const changeTileType = function(pos) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	if (tile.type === TILE_TYPE.Empty) return;
	let current = tile.type.name;
	let currentTooltip = tile.type.tooltip;
	let dropdownOpts = '';
	Object.keys(TILE_TYPE).forEach((key)=>{
		if (key === 'Empty') return;
		let name = TILE_TYPE[key].name;
		if (name === current) return;
		dropdownOpts += '<a class="dropdown-item" onClick="dropdownCallback(\''+
										key+'\'); return false;" href="#">'+name+'</a>';
	});
	swalWithBootstrapButtons.fire({
		title: 'Change tile type',
		html: '<strong class="mt-3">This tile is currently a '+current+'.</strong>'+
					'<p class="mt-1">Please select the new tile type below:</p>'+
					'<div class="btn-group dropright">'+
						'<button id="dropBtn" class="btn btn-info dropdown-toggle" '+
							'type="button" data-toggle="dropdown" aria-haspopup="true" '+
							'aria-expanded="false">'+current+
						'</button>'+
						'<div class="dropdown-menu">'+
							dropdownOpts+
						'</div>'+
					'</div>',
		reverseButtons: true,
		showCancelButton: true,
		confirmButtonText: 'Change it!',
		cancelButtonText: 'Cancel it!',
	}).then((result)=>{
		if (!result.value) return;
		let value = $('#dropBtn').html();
		let chosenKey = Object.keys(TILE_TYPE).find((k)=>TILE_TYPE[k].name===value);
		tile.type = TILE_TYPE[chosenKey];
		if (tile.note && tile.type.tooltip === textTooltip) {
			tile.tooltipArgs = {text: tile.note};
			tile.note = undefined;
		} else if (currentTooltip !== tile.type.tooltip) {
			tile.tooltipArgs = undefined;
		}
		drawGrid();
	});
};

const addTileNote = function(pos) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	if (tile.type === TILE_TYPE.Empty) return;
	let title = '';
	let placeholder = '';
	let value = '';
	let isNote = false;
	switch(tile.type) {
		case TILE_TYPE.Treasure:
		case TILE_TYPE.LockedTreasure:
			title = 'Name the treasures in this tile';
			placeholder = 'Treasure A\nTreasure B'
			break;
		case TILE_TYPE.Event:
			title = 'Describe the event in this tile';
			placeholder = 'A character joins your party'
			break;
		case TILE_TYPE.Boss:
			title = 'Name the boss in this tile';
			placeholder = 'Very Tough Boss (Lv99)'
			break;
		case TILE_TYPE.EventBoss:
			title = 'Describe the event and name the boss in this tile';
			placeholder = 'Cutscene with a character\nVery Tough Boss (Lv99)'
			break;
		default:
			isNote = true;
			placeholder = 'This tile is important!'
			title = 'Add a note to this tile';
			break;
	}
	if (isNote && tile.note) {
		value = tile.note;
	} else if (!isNote && tile.tooltipArgs && tile.tooltipArgs.text) {
		value = tile.tooltipArgs.text;
	}
	swalWithBootstrapButtons.fire({
		title: title,
		inputPlaceholder: placeholder,
		inputValue: value,
		input: 'textarea',
		reverseButtons: true,
		showCancelButton: true,
		confirmButtonText: 'OK',
		cancelButtonText: 'Cancel',
	}).then((result)=>{
		if (!result.isConfirmed) return;
		if (isNote) {
			tile.note = result.value;
		} else {
			tile.tooltipArgs = {text: result.value};
		}
		drawGrid();
	});
}

const addWarpSource = function(pos) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	if (tile.type !== TILE_TYPE.WarpOneSrc && tile.type !== TILE_TYPE.WarpTwo) {
		return;
	}
	warpOrigin = {tile: tile, pos: [tileX, tileY]};
}

const addWarpDest = function(pos) {
	if (!warpOrigin) return;
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	let warpDest = {tile: tile, pos: [tileX, tileY]};
	if (warpOrigin.tile === warpDest.tile) {
		if (tile.tooltipArgs && tile.tooltipArgs.dest) {
			let destX = tileX + tile.tooltipArgs.dest.x;
			let destY = tileY + tile.tooltipArgs.dest.y;
			let destination = canvasGrid[destY][destX];
			if (destination.tooltipArgs && destination.tooltipArgs.dest) {
				destination.tooltipArgs = null;
			} else if (destination.tooltipArgs && destination.tooltipArgs.src) {
				destination.tooltipArgs.src = destination.tooltipArgs.src.filter((s)=>{
					return (
						s.x !== -tile.tooltipArgs.dest.x || s.y !== -tile.tooltipArgs.dest.y
					);
				});
			}
			tile.tooltipArgs = null;
		}
		warpOrigin = null;
		return;
	}
	if (tile.type !== TILE_TYPE.WarpOneDst && tile.type !== TILE_TYPE.WarpTwo) {
		warpOrigin = null;
		return;
	}
	let offsetX = warpDest.pos[0] - warpOrigin.pos[0];
	let offsetY = warpDest.pos[1] - warpOrigin.pos[1];
	warpOrigin.tile.tooltipArgs = {dest: {x: offsetX, y: offsetY}};
	if (warpDest.tile.type === TILE_TYPE.WarpTwo) {
		warpDest.tile.tooltipArgs = {dest: {x: -offsetX, y: -offsetY}};
		warpOrigin = null;
		return;
	}
	if (warpDest.tile.tooltipArgs && warpDest.tile.tooltipArgs.src) {
		warpDest.tile.tooltipArgs.src.push({x: -offsetX, y: -offsetY});
	} else {
		warpDest.tile.tooltipArgs = {src: [{x: -offsetX, y: -offsetY}]};
	}
	warpOrigin = null;
}

const addWallSource = function(pos) {
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	if (tile.type === TILE_TYPE.Empty) {
		return;
	}
	wallOrigin = {tile: tile, pos: [tileX, tileY]};
}

const addWallDest = function(pos) {
	if (!wallOrigin) return;
	let tileX = Math.floor(pos.x / (globals.tileSize + globals.gapSize));
	let tileY = Math.floor(pos.y / (globals.tileSize + globals.gapSize));
	if (!canvasGrid[tileY] || !canvasGrid[tileY][tileX]) return;
	let tile = canvasGrid[tileY][tileX];
	if (tile.type === TILE_TYPE.Empty) {
		wallOrigin = null;
		return;
	}
	let wallDest = {tile: tile, pos: [tileX, tileY]};
	if (wallOrigin.tile === wallDest.tile && tile.walls) {
		tile.walls.forEach((wall)=>{
			let targetTile;
			let twall;
			if (wall === 'left') {
				targetTile = canvasGrid[tileY][tileX-1];
				twall = 'right';
			} else if (wall === 'right') {
				targetTile = canvasGrid[tileY][tileX+1];
				twall = 'left';
			} else if (wall === 'up') {
				targetTile = canvasGrid[tileY-1][tileX];
				twall = 'down';
			} else {
				targetTile = canvasGrid[tileY+1][tileX];
				twall = 'up';
			}
			if (targetTile && targetTile.walls) {
				targetTile.walls.splice(targetTile.walls.indexOf(twall), 1);
			}
		});
		tile.walls = null;
		wallOrigin = null;
		return;
	}
	if (wallOrigin.pos[0] === (wallDest.pos[0] + 1) &&
		  wallOrigin.pos[1] === wallDest.pos[1]) {
		if (wallOrigin.tile.walls) wallOrigin.tile.walls.push('left');
		else wallOrigin.tile.walls = ['left'];
		if (wallDest.tile.walls) wallDest.tile.walls.push('right');
		else wallDest.tile.walls = ['right'];
	} else if (wallOrigin.pos[0] === (wallDest.pos[0] - 1) &&
		         wallOrigin.pos[1] === wallDest.pos[1]) {
		if (wallOrigin.tile.walls) wallOrigin.tile.walls.push('right');
		else wallOrigin.tile.walls = ['right'];
		if (wallDest.tile.walls) wallDest.tile.walls.push('left');
		else wallDest.tile.walls = ['left'];
	} else if (wallOrigin.pos[0] === wallDest.pos[0] &&
		         wallOrigin.pos[1] === (wallDest.pos[1] + 1)) {
		if (wallOrigin.tile.walls) wallOrigin.tile.walls.push('up');
		else wallOrigin.tile.walls = ['up'];
		if (wallDest.tile.walls) wallDest.tile.walls.push('down');
		else wallDest.tile.walls = ['down'];
	} else if (wallOrigin.pos[0] === wallDest.pos[0] &&
		         wallOrigin.pos[1] === (wallDest.pos[1] - 1)) {
		if (wallOrigin.tile.walls) wallOrigin.tile.walls.push('down');
		else wallOrigin.tile.walls = ['down'];
		if (wallDest.tile.walls) wallDest.tile.walls.push('up');
		else wallDest.tile.walls = ['up'];
	}
	wallOrigin = null;
}
