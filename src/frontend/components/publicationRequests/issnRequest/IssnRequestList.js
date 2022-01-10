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

import React, {useEffect, useState} from 'react';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {Grid, Typography} from '@material-ui/core';

import * as actions from '../../../store/actions';
import Spinner from '../../Spinner';
import TableComponent from '../../TableComponent';
import {commonStyles} from '../../../styles/app';
import SearchComponent from '../../SearchComponent';
import TabComponent from '../../TabComponent';

export default connect(mapStateToProps, actions)(props => {
	const {fetchIssnRequestsList, issnRequestList, loading, history} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const classes = commonStyles();
	const [inputVal, setSearchInputVal] = useState('');
	const [page, setPage] = React.useState(0);
	const [sortStateBy, setSortStateBy] = useState('new');
	const [rowSelectedId, setRowSelectedId] = useState(null);

	useEffect(() => {
		fetchIssnRequestsList({searchText: inputVal, token: cookie[COOKIE_NAME], sortStateBy: sortStateBy, sort: {'created.timestamp': -1}});
	}, [cookie, fetchIssnRequestsList, inputVal, sortStateBy]);

	const handleTableRowClick = id => {
		history.push(`/requests/publications/issn/${id}`);
		setRowSelectedId(id);
	};

	const handleChange = (event, newValue) => {
		setSortStateBy(newValue);
	};

	const headRows = [
		{id: 'state', label: <FormattedMessage id="publicationList.isbnismn.headRows.state"/>},
		{id: 'title', label: <FormattedMessage id="publicationList.isbnismn.headRows.title"/>},
		{id: 'language', label: <FormattedMessage id="publicationList.isbnismn.headRows.language"/>}
	];

	let issnRequestData;
	if ((issnRequestList === undefined) || (loading)) {
		issnRequestData = <Spinner/>;
	} else if (issnRequestList.length === 0) {
		issnRequestData = <p><FormattedMessage id="app.render.noData"/></p>;
	} else {
		issnRequestData = (
			<TableComponent
				pagination
				data={issnRequestList
					.map(item => issnRequestRender(item.id, item.state, item.title, item.language))}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				rowSelectedId={rowSelectedId}
				page={page}
				setPage={setPage}
			/>
		);
	}

	function issnRequestRender(id, state, title, language) {
		return {
			id: id,
			state: state,
			title: title,
			language: language
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="publicationRequestRender.heading.search.Issn"/>
			</Typography>
			<SearchComponent searchFunction={fetchIssnRequestsList} setSearchInputVal={setSearchInputVal}/>
			<TabComponent
				tabClass={classes.tab}
				tabsClass={classes.tabs}
				sortStateBy={sortStateBy}
				handleChange={handleChange}
			/>
			{issnRequestData}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.publication.listLoading,
		issnRequestList: state.publication.issnRequestsList,
		totalDoc: state.publication.totalDoc,
		role: state.login.userInfo.role
	});
}
