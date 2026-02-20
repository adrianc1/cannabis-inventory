const splitRows = document.getElementById('splitRows');
const initialQty = parseFloat(splitRows.dataset.initialQty);

function updateTotals() {
	let totalUsed = 0;
	const unit = splitRows.dataset.unit;
	if (!unit) return;
	splitRows.querySelectorAll('.split-row').forEach((row, i) => {
		const packageSizeInput = row.querySelector('.package-size');

		const packageSize = packageSizeInput
			? parseFloat(packageSizeInput.value) || 1
			: 1;

		const quantity = parseFloat(row.querySelector('.quantity').value) || 0;

		let totalWeight;

		if (unit === 'each') {
			totalWeight = quantity;
			row.querySelector('.total-weight').value = totalWeight;
		} else {
			totalWeight = packageSize * quantity;
			row.querySelector('.total-weight').value = totalWeight.toFixed(3);
		}

		totalUsed += totalWeight;
	});

	const remaining = initialQty - totalUsed;
	const submitBtn = document.getElementById('submitSplit');

	submitBtn.disabled = remaining < 0;

	document.getElementById('totalUsed').textContent =
		unit === 'each' ? totalUsed : totalUsed.toFixed(3);

	document.getElementById('remainingQty').textContent =
		unit === 'each'
			? initialQty - totalUsed
			: (initialQty - totalUsed).toFixed(3);

	// render UI colors based on remaining qty
	const summaryBox = document.getElementById('summaryBox');
	if (remaining < 0) {
		summaryBox.classList.remove('bg-emerald-50', 'border-green-300');
		summaryBox.classList.add('bg-red-100', 'border-red-500');
	} else {
		summaryBox.classList.remove('bg-red-100', 'border-red-500');
		summaryBox.classList.add('bg-emerald-50', 'border-green-300');
	}
}

splitRows.addEventListener('input', updateTotals);

// Add/Remove Row
document.getElementById('addRow').addEventListener('click', () => {
	const newRow = splitRows.querySelector('.split-row').cloneNode(true);
	newRow.querySelectorAll('input').forEach((input) => (input.value = ''));
	splitRows.appendChild(newRow);
	updateTotals();
});

splitRows.addEventListener('click', (e) => {
	if (e.target.classList.contains('remove-row')) {
		e.target.closest('.split-row').remove();
		updateTotals();
	}
});
