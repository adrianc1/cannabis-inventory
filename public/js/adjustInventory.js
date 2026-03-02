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
			cost_price_unit: formData.get('cost_price_unit'),
			status: formData.get('status'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/packages/${productId}/adjust/${lotNumber}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (res.ok) {
			window.location.href = `/packages`;
			return;
		} else {
			alert('failed to update package');
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		adjustInventoryFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
