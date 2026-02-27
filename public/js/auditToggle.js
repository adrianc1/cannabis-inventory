document.addEventListener('click', (e) => {
	const btn = e.target.closest('.toggle-btn');
	if (!btn) return;

	const row = btn.closest('tr');
	const movementRow = row.nextElementSibling;

	if (!movementRow) return;

	const movementTable = movementRow.querySelector('.movement-table');

	movementTable.classList.toggle('hidden');

	btn.textContent = movementTable.classList.contains('hidden')
		? 'View Movements'
		: 'Hide Movements';
});
