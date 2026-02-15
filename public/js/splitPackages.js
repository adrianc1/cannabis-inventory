const splitRows = document.getElementById('splitRows');
const initialQty = parseFloat(splitRows.dataset.initialQty);

function updateTotals() {
	let totalUsed = 0;
	splitRows.querySelectorAll('.split-row').forEach((row) => {
		const packageSize =
			parseFloat(row.querySelector('.package-size').value) || 0;
		const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
		const totalWeight = packageSize * quantity;
		row.querySelector('.total-weight').value = totalWeight.toFixed(3);
		totalUsed += totalWeight;
	});

	const remaining = initialQty - totalUsed;

	document.getElementById('totalUsed').textContent = totalUsed.toFixed(3);
	document.getElementById('remainingQty').textContent = (
		initialQty - totalUsed
	).toFixed(3);

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
