const formEl = document.getElementById('adjust-form');

document.addEventListener('DOMContentLoaded', () => {
	const adjustInventoryFunction = async () => {
		const productId = formEl.dataset.id;
		const lotNumber = formEl.dataset.lot;

		const formData = new FormData(formEl);
		const data = {
			quantity: formData.get('quantity'),
			unit: formData.get('unit'),
			movement_type: formData.get('movement_type'),
			notes: formData.get('notes'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/products/${productId}/adjust/${lotNumber}`, {
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
		adjustInventoryFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
