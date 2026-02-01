const formEl = document.getElementById('adjust-form');

document.addEventListener('DOMContentLoaded', () => {
	const receiveInventoryFunction = async () => {
		const productId = formEl.dataset.id;

		const formData = new FormData(formEl);
		const data = {
			quantity: formData.get('quantity'),
			unit: formData.get('unit'),
			unit_price: formData('unit_price'),
			reason: formData.get('movement_type'),
			notes: formData.get('notes'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/products/${productId}/receive`, {
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
		receiveInventoryFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
