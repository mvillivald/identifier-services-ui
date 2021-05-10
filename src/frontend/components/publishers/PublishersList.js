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
import {Grid, Typography, Checkbox, FormControlLabel} from '@material-ui/core';
import {FormattedMessage, useIntl} from 'react-intl';

import SearchComponent from '../SearchComponent';
import {commonStyles} from '../../styles/app';
import TableComponent from '../TableComponent';
import * as actions from '../../store/actions';
import Spinner from '../Spinner';

export default connect(mapStateToProps, actions)(props => {
	const classes = commonStyles();
	const {loading, searchedPublishers, location, searchPublisher, totalDoc, history} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const intl = useIntl();
	const [inputVal, setSearchInputVal] = (location.state === undefined || location.state === null) ? useState('') : useState(location.state.searchText);
	const [page, setPage] = React.useState(0);
	const [activeCheck, setActiveCheck] = useState({
		checked: false,
		filterByIdentifier: false
	});
	const [rowSelectedId, setRowSelectedId] = useState(null);

	useEffect(() => {
		searchPublisher({searchText: inputVal, token: cookie[COOKIE_NAME], activeCheck: activeCheck, sort: {'lastUpdated.timestamp': -1}});
	}, [activeCheck, inputVal, searchPublisher, cookie]);

	const handleChange = name => event => {
		setActiveCheck({...activeCheck, [name]: event.target.checked});
	};

	const handleTableRowClick = id => {
		history.push(`/publishers/${id}`);
		setRowSelectedId(id);
	};

	const headRows = [
		{id: 'empty', label: ''},
		{id: 'name', label: intl.formatMessage({id: 'publisherList.headRows.name'})},
		{id: 'aliases', label: intl.formatMessage({id: 'publisherList.headRows.aliases'})},
		{id: 'email', label: intl.formatMessage({id: 'publisherList.headRows.email'})},
		{id: 'phone', label: intl.formatMessage({id: 'publisherList.headRows.phone'})},
		{id: 'active', label: intl.formatMessage({id: 'publisherList.headRows.active'})}
	];
	let publishersData;
	if (loading) {
		publishersData = <Spinner/>;
	} else if (searchedPublishers === null || searchedPublishers.length === 0) {
		publishersData = <p><FormattedMessage id="publisherList.emptySearch"/></p>;
	} else {
		publishersData = (
			<TableComponent
				pagination
				data={searchedPublishers.map(item => searchResultRender(item))}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				rowSelectedId={rowSelectedId}
				page={page}
				setPage={setPage}
				totalDoc={totalDoc}
			/>
		);
	}

	function searchResultRender(item) {
		const {id, name, phone, aliases, email, activity} = item;
		return {
			id: id,
			empty: '',
			name: name,
			aliases: aliases ? aliases : '',
			email: email,
			phone: phone,
			active: activity.active
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5"><FormattedMessage id="publisher.search.title"/></Typography>
			<SearchComponent searchFunction={searchPublisher} setSearchInputVal={setSearchInputVal}/>
			<FormControlLabel
				control={
					<Checkbox
						checked={activeCheck.checked}
						value="checked"
						color="primary"
						onChange={handleChange('checked')}
					/>
				}
				label={<FormattedMessage id="publisher.search.filter.active"/>}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={activeCheck.filterByIdentifier}
						value="checked"
						color="primary"
						onChange={handleChange('filterByIdentifier')}
					/>
				}
				label={<FormattedMessage id="publisher.search.filter.filterByIdentifier"/>}
			/>
			{publishersData}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.publisher.searchListLoading,
		searchedPublishers: state.publisher.searchedPublisher,
		publishersList: state.publisher.publishersList,
		totalDoc: state.publisher.totalDoc
	});
}
