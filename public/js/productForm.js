document.addEventListener('DOMContentLoaded', () => {
	const strainSelect = document.getElementById('strainId');
	const wrapper = document.getElementById('strain-wrapper');

	if (!strainSelect || !wrapper) return;

	strainSelect.addEventListener('change', () => {
		const createOption = document.getElementById('create-strain');

		if (strainSelect.selectedIndex === createOption.index) {
			showNewStrainInput();
		}
	});

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

		wrapper.appendChild(container);

		document
			.getElementById('cancel-new-strain')
			.addEventListener('click', () => {
				container.remove();
				strainSelect.disabled = false;
				strainSelect.value = '';
			});
	}
});
