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

const modules = () => ({
	toolbar: [
		['bold', 'italic', 'underline', 'strike'],
		[{align: []}],

		[{list: 'ordered'}, {list: 'bullet'}],
		[{indent: '-1'}, {indent: '+1'}],

		[{size: ['small', false, 'large', 'huge']}],
		[{header: [1, 2, 3, 4, 5, 6, false]}],
		['link'],
		[{color: []}, {background: []}],

		['clean']
	],
	clipboard: {
		matchVisual: false
	}
});

const formats = () => ([
	'bold',
	'italic',
	'underline',
	'strike',
	'align',
	'list',
	'indent',
	'size',
	'header',
	'link',
	'color',
	'background',
	'clean'
]);

const theme = 'snow';

module.exports.modules = modules;
module.exports.theme = theme;
module.exports.formats = formats;
