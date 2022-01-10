/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file.
 *
 * UI microservice of Identifier Services
 *
 * Copyright (C) 2019 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of identifier-services-ui
 *
 * identifier-services-ui program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * identifier-services-ui is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 *
 */

export function getMonthlyIssnStatistics({startDate, endDate, value}) {
	let yearStart = Number(startDate.slice(0, 4));
	let monthStart = Number(startDate.slice(5, 7));

	let yearEnd = Number(endDate.slice(0, 4));
	let monthEnd = Number(endDate.slice(5, 7));
	let result = [];

	for (yearStart; yearStart <= yearEnd; yearStart++) {
		result.push(yearStart);
	}

	const newResult = result.reduce((acc, item, index) => {
		const length = result.length;
		if (index === 0 && length > 1) {
			for (let month = monthStart; month <= 12; month++) {
				const m = `${month}`.length === 1 ? `${item}-0${month}` : `${item}-${month}`;
				const monthlyIssn = fetchMonthlyIssn(m);
				if (monthlyIssn.length > 0) {
					acc.push(...monthlyIssn);
				}
			}
		} else if (index === result.length - 1) {
			for (let month = 1; month <= monthEnd; month++) {
				const m = `${month}`.length === 1 ? `${item}-0${month}` : `${item}-${month}`;
				const monthlyIssn = fetchMonthlyIssn(m);
				if (monthlyIssn.length > 0) {
					acc.push(...monthlyIssn);
				}
			}
		} else {
			for (let month = 1; month <= 12; month++) {
				const m = `${month}`.length === 1 ? `${item}-0${month}` : `${item}-${month}`;
				const monthlyIssn = fetchMonthlyIssn(m);

				if (monthlyIssn.length > 0) {
					acc.push(...monthlyIssn);
				}
			}
		}

		return acc;
	}, []);

	function fetchMonthlyIssn(month) {
		const res = value.reduce((acc, item) => {
			const timestamp = item.created.timestamp.slice(0, 7);
			if (timestamp === month) {
				item.identifier.forEach(k => {
					if (!acc.includes({month: month})) {
						if (acc.some(item => item.prefix === k.id.slice(0, 4))) {
							acc = acc.map(a => {
								if (a.prefix === k.id.slice(0, 4)) {
									return {...a, frequency: a.frequency + 1};
								}

								return a;
							});
						} else {
							acc.push({month, prefix: k.id.slice(0, 4), frequency: 1});
							return acc;
						}
					}

					return acc;
				});
			}

			return acc;
		}, []);
		return res;
	}

	return newResult;
}

export function getcolLabel({startDate, endDate}) {
	let yearStart = Number(startDate.slice(0, 4));
	let monthStart = Number(startDate.slice(5, 7));

	let yearEnd = Number(endDate.slice(0, 4));
	let monthEnd = Number(endDate.slice(5, 7));
	let result = [];
	for (yearStart; yearStart <= yearEnd; yearStart++) {
		result.push(yearStart);
	}

	return result.reduce((acc, item, index) => {
		const length = result.length;
		if (index === 0 && length > 1) {
			for (let month = monthStart; month <= 12; month++) {
				const m = `${month}`.length === 1 ? `0${month}/${item}` : `${month}/${item}`;
				acc = {...acc, [`${convertToNumberingCharacter(Object.keys(acc).length + 1)}`]: m};
			}
		} else if (index === result.length - 1) {
			for (let month = 1; month <= monthEnd; month++) {
				const m = `${month}`.length === 1 ? `0${month}/${item}` : `${month}/${item}`;
				acc = {...acc, [`${convertToNumberingCharacter(Object.keys(acc).length + 1)}`]: m};
			}
		} else {
			for (let month = 1; month <= 12; month++) {
				const m = `${month}`.length === 1 ? `0${month}/${item}` : `${month}/${item}`;
				acc = {...acc, [`${convertToNumberingCharacter(Object.keys(acc).length + 1)}`]: m};
			}
		}

		return acc;
	}, {A: '', B: ''});
}

export function convertToNumberingCharacter(number) {
	let baseChar = ('A').charCodeAt(0);
	let letters = '';

	do {
		number -= 1;
		letters = String.fromCharCode(baseChar + (number % 26)) + letters;
		number = (number / 26) >> 0; // Quick `floor`
	} while (number > 0);

	return letters;
}

export function getTableTitles() {
	return [
		{A: ''},
		{A: 'Kirjeenvaihto', B: ''},
		{A: '', B: 'lähteneet'},
		{A: '', B: ''},
		{A: 'Liittyneet kustantajat ISBN', B: ''},
		{A: 'Liittyneet kustantajat ISMN', B: ''},
		{A: 'Vastaanotetut liittymislomakkeet', B: ''},
		{A: '', B: ''},
		{A: 'Vastaanotetut ISBN-hakulomakkeet', B: ''},
		{A: 'Vastaanotetut ISMN-hakulomakkeet', B: ''},
		{A: '', B: ''},
		{A: 'Annetut tunnukset ISBN', B: ''},
		{A: '', B: 'yliopisto'},
		{A: '', B: 'valtio'},
		{A: '', B: '5-numeroiset'},
		{A: '', B: 'yksittäiset'},
		{A: '', B: ''},
		{A: 'Annetut tunnukset ISMN', B: ''},
		{A: '', B: 'yksittäiset'},
		{A: '', B: '7-numeroiset'},
		{A: '', B: ''},
		{A: 'Muutokset kust.rek. ', B: ''}
	];
}

