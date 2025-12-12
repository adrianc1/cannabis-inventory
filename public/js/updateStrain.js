const formEl = document.getElementById('edit-cat-form');

document.addEventListener('DOMContentLoaded', () => {
	const updateStrainFunction = async () => {
		const strainId = formEl.dataset.id;
		console.log('strain id ', strainId);

		const formData = new FormData(formEl);
		const data = {
			name: formData.get('name'),
			description: formData.get('description'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/strains/${strainId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		console.log(res.body);

		if (res.ok) {
			window.location.href = `/strains/${strainId}`;
			return;
		} else {
			alert('failed to update strain');
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		updateStrainFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
