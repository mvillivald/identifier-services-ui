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

import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {Grid, Typography, FormControlLabel, Checkbox} from '@material-ui/core';
import {FormattedMessage} from 'react-intl';
import {useCookies} from 'react-cookie';

import SearchComponent from '../SearchComponent';
import {commonStyles} from '../../styles/app';
import Spinner from '../Spinner';
import TableComponent from '../TableComponent';
import IsbnIsmn from './isbnIsmn/IsbnIsmn';
import Issn from './issn/Issn';

export default connect(mapStateToProps)(props => {
	const classes = commonStyles();

	const {
		loading,
		publicationList,
		totalpublication,
		headRows,
		isbnIsmn,
		issn,
		handleTableRowClick,
		setSearchInputVal,
		fetchIsbnIsmnList,
		fetchAllPublishers,
		publishersList,
		activeCheck,
		setActiveCheck,
		rowSelectedId
	} = props;

	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [page, setPage] = useState(0);
	const [publications, setPublications] = useState(null);
	useEffect(() => {
		fetchAllPublishers({token: cookie[COOKIE_NAME]});
	}, [cookie, fetchAllPublishers]);

	useEffect(() => {
		if (publicationList !== undefined || publicationList !== null || publicationList.length !== 0) {
			const newPublication = publicationList.map(item => {
				const publisher = publishersList.find(i => i._id === item.publisher);
				return {...item, publisher: publisher === undefined ? '' : publisher.name};
			});
			setPublications(newPublication);
		}
	}, [cookie, publicationList, publishersList]);

	const handleChange = name => event => {
		setActiveCheck({...activeCheck, [name]: event.target.checked});
	};

	let usersData;
	if (loading) {
		usersData = <Spinner/>;
	} else if (publications === null || publications.length === 0) {
		usersData = <p><FormattedMessage id="publicationListRender.heading.noPublication"/></p>;
	} else {
		usersData = (
			<TableComponent
				pagination
				data={publications.map(item => usersDataRender(item))}
				handleTableRowClick={handleTableRowClick}
				rowSelectedId={rowSelectedId}
				headRows={headRows}
				page={page}
				setPage={setPage}
				totalDoc={totalpublication}
			/>
		);
	}

	function usersDataRender(item) {
		const {id} = item;
		const keys = headRows.map(k => k.id);
		const result = keys.reduce((acc, key) => {
			if (key === 'identifier' && item[key] !== undefined && item[key].length > 0) {
				return {...acc, [key]: item[key][0].id};
			}

			return {...acc, [key]: item[key]};
		}, {});
		return {
			id: id,
			...result
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="publicationListRender.heading.list"/>
			</Typography>
			<Grid item xs={12}>
				<SearchComponent searchFunction={fetchIsbnIsmnList} activeCheck={activeCheck} setSearchInputVal={setSearchInputVal}/>
			</Grid>
			<Grid item xs={12}>
				<FormControlLabel
					control={
						<Checkbox
							checked={activeCheck.identifier}
							value="checked"
							color="primary"
							onChange={handleChange('identifier')}
						/>
					}
					label={<FormattedMessage id="isbnismn.search.filter.filterByIdentifier"/>}
				/>
			</Grid>
			{usersData}
			{issn ?	<Issn {...props}/> : (
				isbnIsmn ?	<IsbnIsmn {...props}/> : null
			)}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.publication.listLoading,
		publishersList: state.publisher.publishersList
	});
}
