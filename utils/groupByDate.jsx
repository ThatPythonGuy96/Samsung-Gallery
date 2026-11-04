const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

// assets must already be sorted by date (yours are, newest first)
export function groupByDate(assets, columns, mode = 'day') {
	const rows = [];
	const thisYear = new Date().getFullYear();
	let currentKey = null;
	let buffer = [];

	const flush = () => {
		for (let i = 0; i < buffer.length; i += columns) {
			rows.push({
				type: 'row',
				key: `row-${buffer[i].id}`,
				items: buffer.slice(i, i + columns),
			});
		}
		buffer = [];
	};

	for (const asset of assets) {
		// some files report creationTime 0, so fall back to modificationTime
		const d = new Date(asset.creationTime || asset.modificationTime);
		const y = d.getFullYear();
		const m = d.getMonth();
		const day = d.getDate();

		const key = mode === 'month' ? `${y}-${m}` : `${y}-${m}-${day}`;
		if (key !== currentKey) {
			flush();
			currentKey = key;
			const year = y !== thisYear ? ` ${y}` : '';
			const title = mode === 'month'
				? `${MONTHS[m]}${year}`
				: `${day}, ${MONTHS[m]}${year}`;
			rows.push({ type: 'header', key: `header-${key}`, title });
		}
		buffer.push(asset);
	}
	flush();

	return rows;
}