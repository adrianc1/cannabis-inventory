document.addEventListener('DOMContentLoaded', () => {
	const deleteBtn = document.getElementById('delete-btn');

	if (!deleteBtn) return;

	deleteBtn.addEventListener('click', async () => {
		console.log('eh');
		const productId = deleteBtn.dataset.id;
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
