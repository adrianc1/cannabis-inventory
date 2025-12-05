// document.addEventListener('DOMContentLoaded', () => {
// 	const editBtn = document.getElementById('edit-btn');

// 	if (!editBtn) return;

// 	editBtn.addEventListener('click', async () => {
// 		const productId = editBtn.dataset.id;
// 		const res = await fetch(`/products/${productId}`, {
// 			method: 'PUT',
// 		});

// 		console.log(res.ok);

// 		if (res.ok) {
// 			window.location.href = `/products/${productId}`;
// 			return;
// 		} else {
// 			alert('failed to delete product');
// 		}
// 	});
// });
