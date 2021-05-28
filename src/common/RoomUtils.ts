
function getXName(x: number) {
	if (x > 0) {
		return x + 'E';
	} else if (x < 0) {
		return x + "W";
	} else {
		return '';
	}
}

function getYName(y: number) {
	if (y > 0) {
		return y + 'S';
	} else if (y < 0) {
		return y + "N";
	} else {
		return '';
	}
}

export const RoomUtils = {
	getCoordinateName(x: number, y: number) {
		return (getYName(y) + getXName(x)) || "Entrance";
	}
}
