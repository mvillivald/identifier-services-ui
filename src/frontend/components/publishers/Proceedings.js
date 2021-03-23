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
import {useCookies} from 'react-cookie';
import {Grid, Typography} from '@material-ui/core';
import {FormattedMessage} from 'react-intl';
import moment from 'moment';

import {commonStyles} from '../../styles/app';
import TableComponent from '../TableComponent';
import Spinner from '../Spinner';
import * as actions from '../../store/actions';

export default connect(mapStateToProps, actions)(props => {
	const {
		fetchProceedingsList,
		isbnIsmnList,
		offset,
		queryDocCount,
		loading,
		match,
		history,
		totalpublication
	} = props;
	/* global COOKIE_NAME */
	const classes = commonStyles();
	const publisherId = match.params.id;
	const [cookie] = useCookies(COOKIE_NAME);
	const [cursors] = useState([]);
	const [lastCursor, setLastCursor] = useState(cursors.length === 0 ? null : cursors[cursors.length - 1]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		fetchProceedingsList({searchText: publisherId, token: cookie[COOKIE_NAME], offset: lastCursor, sort: {'lastUpdated.timestamp': -1}});
	}, [lastCursor, cursors, fetchProceedingsList, cookie, publisherId]);

	function handleTableRowClick({type, id}) {
		history.push(`/publications/${type}/${id}`);
	}

	const headRows = [
		{id: 'title', label: <FormattedMessage id="publicationList.isbnismn.headRows.title"/>},
		{id: 'identifier', label: <FormattedMessage id="publicationList.isbnismn.headRows.identifier"/>},
		{id: 'additionalDetails', label: <FormattedMessage id="publicationList.isbnismn.headRows.additionalDetails"/>},
		{id: 'publicationType', label: <FormattedMessage id="publicationList.isbnismn.headRows.publicationType"/>},
		{id: 'publicationTime', label: <FormattedMessage id="publicationList.isbnismn.headRows.publicationTime"/>},
		{id: 'lastUpdated', label: <FormattedMessage id="publicationList.isbnismn.headRows.lastUpdated"/>}
	];

	let usersData;
	if (loading) {
		usersData = <Spinner/>;
	} else if (isbnIsmnList === null || isbnIsmnList.length === 0) {
		usersData = <p><FormattedMessage id="publicationListRender.heading.noPublication"/></p>;
	} else {
		usersData = (
			<TableComponent
				proceedings
				data={isbnIsmnList.map(item => usersDataRender(item))}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				offset={offset}
				page={page}
				setPage={setPage}
				cursors={cursors}
				setLastCursor={setLastCursor}
				totalDoc={totalpublication}
				queryDocCount={queryDocCount}
			/>
		);
	}

	function usersDataRender(item) {
		const {id, publicationType} = item;
		const keys = headRows.map(k => k.id);
		const result = keys.reduce((acc, key) => {
			if (key === 'identifier' && item[key] !== undefined) {
				return {...acc, [key]: item[key][0].id};
			}

			if (key === 'publicationType') {
				if (item[key] === 'isbn-ismn') {
					if (item.type === 'music') {
						return {...acc, [key]: 'ISMN'};
					}

					return {...acc, [key]: 'ISBN'};
				}

				return {...acc, [key]: 'ISSN'};
			}

			if (key === 'publicationTime') {
				return {...acc, [key]: moment(item[key]).format('L')};
			}

			if (key === 'lastUpdated') {
				return {...acc, [key]: moment(item[key].timestamp).format('L')};
			}

			return {...acc, [key]: item[key]};
		}, {});
		return {
			id: id,
			type: publicationType,
			...result
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="publicationListRender.heading.list"/>
			</Typography>
			{usersData}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.publication.listLoading,
		isbnIsmnList: state.publication.isbnIsmnList,
		totalpublication: state.publication.totalDoc,
		offset: state.publication.offset,
		queryDocCount: state.publication.queryDocCount,
		role: state.login.userInfo.role
	});
}
