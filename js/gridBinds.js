$(document).ready(function(){
	// Freeze grid tile 'enums'
	Object.freeze(OPMODE_TYPE);
	Object.freeze(COLOR_TYPE);
	Object.freeze(TILE_TYPE);
	Object.freeze(OPACITY_TYPE);

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

	$('#downloadGrid').click((event)=>{
		drawGrid('#invisibleGrid', 5);
		let link = document.createElement('a');
		link.download = 'yourmap.png';
		link.href = $('#invisibleGrid')[0].toDataURL("image/png");
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
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

	$('#viewNav').click((event)=>{
		opMode=OPMODE_TYPE.View;
		opacityMode=OPACITY_TYPE.None;
		drawGrid();
	});
	$('#viewFloor').click((event)=>{
		opMode=OPMODE_TYPE.Floor;
		opacityMode=OPACITY_TYPE.None;
		drawGrid();
	});
	$('#viewTypes').click((event)=>{
		opMode=OPMODE_TYPE.Types;
		opacityMode=OPACITY_TYPE.None;
		drawGrid();
	});
	$('#viewTexts').click((event)=>{
		opMode=OPMODE_TYPE.Notes;
		opacityMode=OPACITY_TYPE.TextTips;
		drawGrid();
	});
	$('#viewWarps').click((event)=>{
		opMode=OPMODE_TYPE.Warps;
		opacityMode=OPACITY_TYPE.Warps;
		drawGrid();
	});

	// Draw template grid
	drawGrid();
});
