const formEl = document.getElementById('edit-cat-form');

document.addEventListener('DOMContentLoaded', () => {
	const updateCategoryFunction = async () => {
		const categoryId = formEl.dataset.id;
		console.log('category id ', categoryId);

		const formData = new FormData(formEl);
		const data = {
			name: formData.get('name'),
			description: formData.get('description'),
		};

		console.log('Data to send:', data);

		const res = await fetch(`/categories/${categoryId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		console.log(res.body);

		if (res.ok) {
			window.location.href = `/categories/${categoryId}`;
			return;
		} else {
			alert('failed to update product');
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		updateCategoryFunction();
	};

	formEl.addEventListener('submit', handleSubmit);
});
