const formEl = document.getElementById('edit-form');

document.addEventListener('DOMContentLoaded', () => {
	const updateProductFunction = async () => {
		const productId = formEl.dataset.id;

		const formData = new FormData(formEl);
		const data = {
			name: formData.get('name'),
			description: formData.get('description'),
			unit: formData.get('unit'),
			brandId: formData.get('brandId'),
			strainId: formData.get('strainId'),
			categoryId: formData.get('categoryId'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/products/${productId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		console.log(res.body);

		if (res.ok) {
			window.location.href = `/products/${productId}`;
			return;
		} else {
			alert('failed to update product');
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		updateProductFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
