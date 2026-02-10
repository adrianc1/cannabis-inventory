document.addEventListener('DOMContentLoaded', () => {
	const strainSelect = document.getElementById('strainId');
	const brandSelect = document.getElementById('brandId');
	const categorySelect = document.getElementById('categoryId');
	const strainWrapper = document.getElementById('strain-wrapper');
	const brandWrapper = document.getElementById('brand-wrapper');
	const categoryWrapper = document.getElementById('category-wrapper');

	if (!strainSelect || !strainWrapper) return;
	if (!brandSelect || !brandWrapper) return;
	if (!categorySelect || !categoryWrapper) return;

	strainSelect.addEventListener('change', () => {
		const createOption = document.getElementById('create-strain');

		if (strainSelect.selectedIndex === createOption.index) {
			showNewStrainInput();
		}
	});

	brandSelect.addEventListener('change', () => {
		const createOption = document.getElementById('create-brand');

		if (brandSelect.selectedIndex === createOption.index) {
			showNewBrandInput();
		}
	});

	categorySelect.addEventListener('change', () => {
		const createOption = document.getElementById('create-category');

		if (categorySelect.selectedIndex === createOption.index) {
			showNewCategoryInput();
		}
	});

	function showNewBrandInput() {
		if (document.getElementById('newBrandName')) return;

		brandSelect.disabled = true;

		const container = document.createElement('div');
		container.id = 'new-brand-container';
		container.className = 'mt-2 space-y-2';

		container.innerHTML = `
      <input
        type="text"
        name="newBrandName"
        id="newBrandName"
        placeholder="Enter new brand name"
        class="w-full px-4 py-2 border rounded"
      />
      <button type="button" id="cancel-new-brand" class="text-sm text-red-600 underline">
        Cancel
      </button>
    `;

		brandWrapper.appendChild(container);

		document
			.getElementById('cancel-new-brand')
			.addEventListener('click', () => {
				container.remove();
				brandSelect.disabled = false;
				brandSelect.value = '';
			});
	}

	function showNewCategoryInput() {
		if (document.getElementById('newCategoryName')) return;

		brandSelect.disabled = true;

		const container = document.createElement('div');
		container.id = 'new-category-container';
		container.className = 'mt-2 space-y-2';

		container.innerHTML = `
      <input
        type="text"
        name="newCategoryName"
        id="newCategoryName"
        placeholder="Enter new category name"
        class="w-full px-4 py-2 border rounded"
      />
      <button type="button" id="cancel-new-category" class="text-sm text-red-600 underline">
        Cancel
      </button>
    `;

		categoryWrapper.appendChild(container);

		document
			.getElementById('cancel-new-category')
			.addEventListener('click', () => {
				container.remove();
				categorySelect.disabled = false;
				categorySelect.value = '';
			});
	}

	function showNewStrainInput() {
		if (document.getElementById('newStrainName')) return;

		strainSelect.disabled = true;

		const container = document.createElement('div');
		container.id = 'new-strain-container';
		container.className = 'mt-2 space-y-2';

		container.innerHTML = `
      <input
        type="text"
        name="newStrainName"
        id="newStrainName"
        placeholder="Enter new strain name"
        class="w-full px-4 py-2 border rounded"
      />
      <button type="button" id="cancel-new-strain" class="text-sm text-red-600 underline">
        Cancel
      </button>
    `;

		strainWrapper.appendChild(container);

		document
			.getElementById('cancel-new-strain')
			.addEventListener('click', () => {
				container.remove();
				strainSelect.disabled = false;
				strainSelect.value = '';
			});
	}
});
