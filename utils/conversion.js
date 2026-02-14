const weightToGrams = {
	mg: 0.001,
	g: 1,
	kg: 1000,
	oz: 28.3495,
	lb: 453.592,
};

const volumeToMl = {
	ml: 1,
	l: 1000,
};

function convertQuantity(amount, fromUnit, toUnit) {
	if (fromUnit === toUnit) return amount;

	if (weightToGrams[fromUnit] && weightToGrams[toUnit]) {
		const grams = amount * weightToGrams[fromUnit];
		return grams / weightToGrams[toUnit];
	}
	//volume conversion
	if (volumeToMl[fromUnit] && volumeToMl[toUnit]) {
		const ml = amount * volumeToMl[fromUnit];
		return ml / volumeToMl[toUnit];
	}

	throw new Error(`Cannot convert ${fromUnit} to ${toUnit}`);
}

module.exports = { convertQuantity };
