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
import React from 'react';
import {Button, Typography} from '@material-ui/core';
import {FormattedMessage} from 'react-intl';

import useStyles from '../../styles/form';

export default function (props) {
	const {history, handleClose} = props;
	const classes = useStyles();

	const handleIsbnIsmnClick = () => {
		handleClose();
		history.push('/isbnIsmnRegistrationForm');
	};

	const handleIssnClick = () => {
		handleClose();
		history.push('/issnRegistrationForm');
	};

	/* Disabled until refactored
	<Button variant="contained" color="primary" onClick={handleIssnClick}>
		<FormattedMessage id="app.modal.publicationRegistration.btnLabel.ISSN"/>
	</Button>
	*/

	const component = (
		<>
			<div className={classes.pubFormSelect}>
				<Typography variant="h6">
					<FormattedMessage id="app.modal.publicationRegistration.selectType"/>
				</Typography>
				<Button variant="contained" color="primary" onClick={handleIsbnIsmnClick}>
					<FormattedMessage id="app.modal.publicationRegistration.btnLabel.ISBN-ISMN"/>
				</Button>
			</div>
		</>
	);

	return {
		...component
	};
}
