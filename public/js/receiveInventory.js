document.addEventListener('DOMContentLoaded', () => {
	const formEl = document.getElementById('receive-form-pkg');
	const product_id = formEl.dataset.product_id;

	if (!formEl) return;
	if (!product_id) {
		throw new Error('Missing product_id dataset');
	}

	const receiveInventoryFunction = async () => {
		const formData = new FormData(formEl);

		const data = {
			package_tag: formData.get('packageTag'),
			quantity: formData.get('quantity'),
			unit: formData.get('unit'),
			unit_price: formData.get('unit_price'),
			reason: formData.get('reason'),
			vendor: formData.get('vendor'),
			batch: formData.get('batch'),
			notes: formData.get('notes'),
			product_id: product_id,
		};

		console.log('Data to send:', data);

		console.log(`PUT -> /packages/${product_id}/receive`);

		const res = await fetch(`/packages/${product_id}/receive`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		console.log(res.body);

		if (res.ok) {
			window.location.href = `/packages/${product_id}`;
			return;
		} else {
			alert('failed to update product');
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		receiveInventoryFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
