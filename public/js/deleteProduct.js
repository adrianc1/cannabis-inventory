document.addEventListener('DOMContentLoaded', () => {
	const deleteBtn = document.getElementById('delete-btn');

	if (!deleteBtn) return;

	deleteBtn.addEventListener('click', async () => {
		const confirmed = confirm(
			'Are you sure you want to delete this product? This action cannot be undone.'
		);

		if (!confirmed) return;

		const productId = deleteBtn.dataset.id;

		deleteBtn.disabled = true;
		deleteBtn.textContent = 'Deleting...';
		const res = await fetch(`/products/${productId}`, {
			method: 'DELETE',
		});

		console.log(res.ok);

		if (res.ok) {
			window.location.href = '/products';
			return;
		} else {
			alert('failed to delete product');
		}
	});
});
