document.addEventListener('DOMContentLoaded', () => {
	const deleteBtn = document.getElementById('delete-cat-btn');
	const tableRow = document.querySelectorAll('.category-row');

	if (!deleteBtn) return;

	deleteBtn.addEventListener('click', async (e) => {
		e.preventDefault();
		console.log('hey clicked!');
		const confirmed = confirm(
			'Are you sure you want to delete this category? This action cannot be undone.'
		);

		if (!confirmed) return;

		if (!deleteBtn.dataset.id) return;

		const categoryId = deleteBtn.dataset.id;

		deleteBtn.disabled = true;
		deleteBtn.textContent = 'Deleting...';
		const res = await fetch(`/categories/${categoryId}`, {
			method: 'DELETE',
		});

		console.log(res.ok);

		if (res.ok) {
			window.location.href = '/categories';
			return;
		} else {
			alert('failed to delete category');
		}
	});
});
