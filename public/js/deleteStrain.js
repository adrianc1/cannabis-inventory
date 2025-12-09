document.addEventListener('DOMContentLoaded', () => {
	const deleteBtn = document.getElementById('delete-btn');

	if (!deleteBtn) return;

	deleteBtn.addEventListener('click', async (e) => {
		e.preventDefault();
		const confirmed = confirm(
			'Are you sure you want to delete this strain? This action cannot be undone.'
		);

		console.log('confirmed', confirmed);

		if (!confirmed) return;

		if (!deleteBtn.dataset.id) return;

		const strainId = deleteBtn.dataset.id;

		deleteBtn.disabled = true;
		deleteBtn.textContent = 'Deleting...';
		const res = await fetch(`/strains/${strainId}`, {
			method: 'DELETE',
		});

		console.log(res.ok);

		if (res.ok) {
			window.location.href = '/strains';
			return;
		} else {
			alert('failed to delete strain');
		}
	});
});
