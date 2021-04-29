// Global stuff
const OPMODE_TYPE = {
	View: 10,
	Floor: 11,
	Types: 12,
	Notes: 13,
	Warps: 14,
	Walls: 15,
};
const SUBOPMODE_TYPE = {
	FloorAdd: 10,
	FloorRemove: 11,
};
const OPACITY_TYPE = {
	None: 10,
	TextTips: 11,
	Warps: 12,
};
const COLOR_TYPE = {
	Empty: 10,
	Basic: 11,
	Treasure: 12,
	Event: 13,
	WarpOneSrc: 14,
	WarpOneDst: 15,
	WarpTwo: 16,
	LockedTreasure: 17,
	RelayCircle: 18,
	StairsUp: 19,
	StairsDown: 20,
	EventBoss: 21,
	Boss: 22,
}
const TILE_TYPE = {
	Empty: {
		color: COLOR_TYPE.Empty,
		name: 'Empty Tile',
	},
	Basic: {
		color: COLOR_TYPE.Basic,
		name: 'Basic Floor Tile',
	},
	Treasure: {
		color: COLOR_TYPE.Treasure,
		name: 'Treasure Tile',
		tooltip: textTooltip,
	},
	LockedTreasure: {
		color: COLOR_TYPE.LockedTreasure,
		name: 'Locked Treasure Tile',
		tooltip: textTooltip,
	},
	Event: {
		color: COLOR_TYPE.Event,
		name: 'Event Tile',
		tooltip: textTooltip,
	},
	EventBoss: {
		color: COLOR_TYPE.EventBoss,
		name: 'Event/Boss Tile',
		tooltip: textTooltip,
	},
	Boss: {
		color: COLOR_TYPE.Boss,
		name: 'Boss Tile',
		tooltip: textTooltip,
	},
	WarpOneSrc: {
		color: COLOR_TYPE.WarpOneSrc,
		name: 'One-way Warp Tile (Source)',
		tooltip: warpOneSrcTooltip,
	},
	WarpOneDst: {
		color: COLOR_TYPE.WarpOneDst,
		name: 'One-way Warp Tile (Destination)',
		tooltip: warpOneDstTooltip,
	},
	WarpTwo: {
		color: COLOR_TYPE.WarpTwo,
		name: 'Two-way Warp Tile',
		tooltip: warpTwoTooltip,
	},
	RelayCircle: {
		color: COLOR_TYPE.RelayCircle,
		name: 'Relay Circle Tile',
	},
	StairsUp: {
		color: COLOR_TYPE.StairsUp,
		name: 'Stairs (Up) Tile',
	},
	StairsDown: {
		color: COLOR_TYPE.StairsDown,
		name: 'Stairs (Down) Tile',
	},
};
let globals = {
	maxSize: {x: 16, y: 16},
	tileSize: 40,
	innerTileSize: 30,
	innerTileHollowSize: 4,
	wallSize: 3,
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
		12: '#00CC00',
		13: '#FF0000',
		14: '#2288DD',
		15: '#2288DD',
		16: '#0000FF',
		17: '#006600',
		18: '#3BD5FE',
		19: '#FFFF00',
		20: '#FFFF00',
		21: '#000000',
		22: '#7559C8',
		note: '#FF7B12',
	},
	transform: {
		minScale: 1,
		scale: 1,
		translate: {x: 0, y: 0},
	},
};
let canvasGrid = [];
let prevTooltip = null;
let warpOrigin = null;
let wallOrigin = null;
let opMode = OPMODE_TYPE.View;
let opacityMode = OPACITY_TYPE.None;
let subOpMode = null;
