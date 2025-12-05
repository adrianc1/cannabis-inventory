document.addEventListener('DOMContentLoaded', () => {
	const editBtn = document.getElementById('delete-btn');

	if (!editBtn) return;

	editBtn.addEventListener('click', async () => {
		console.log('eh');
		const productId = editBtn.dataset.id;
		const res = await fetch(`/products/${productId}`, {
			method: 'PUT',
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
