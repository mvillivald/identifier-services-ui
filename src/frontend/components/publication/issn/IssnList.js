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
import {FormattedMessage} from 'react-intl';

import * as actions from '../../../store/actions';
import PublicationListRenderComponent from '../PublicationListRenderComponent';

export default connect(mapStateToProps, actions)(props => {
	const {fetchIssnList, issnList, loading, history} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [rowSelectedId, setRowSelectedId] = useState(null);
	const [inputVal, setSearchInputVal] = (location.state === undefined || location.state === null) ? useState('') : useState(location.state.searchText);
	const [isCreating, setIsCreating] = useState(false);
	const [activeCheck, setActiveCheck] = useState({
		identifier: false
	});
	useEffect(() => {
		fetchIssnList({searchText: inputVal, token: cookie[COOKIE_NAME], activeCheck: activeCheck, sort: {'lastUpdated.timestamp': -1}});
		setIsCreating(false);
	}, [fetchIssnList, cookie, isCreating, activeCheck, inputVal]);

	const handleTableRowClick = id => {
		history.push(`/publications/issn/${id}`);
		setRowSelectedId(id);
	};

	const headRows = [
		{id: 'empty', label: ''},
		{id: 'title', label: <FormattedMessage id="publicationList.issn.headRows.title"/>},
		{id: 'publicationType', label: <FormattedMessage id="publicationList.issn.headRows.publicationType"/>},
		{id: 'type', label: <FormattedMessage id="publicationList.issn.headRows.type"/>},
		{id: 'email', label: <FormattedMessage id="publicationList.issn.headRows.email"/>}
	];

	return (
		<PublicationListRenderComponent
			loading={loading}
			headRows={headRows}
			handleTableRowClick={handleTableRowClick}
			rowSelectedId={rowSelectedId}
			publicationList={issnList.map(item => dataRender(item))}
			setSearchInputVal={setSearchInputVal}
			setIsCreating={setIsCreating}
			activeCheck={activeCheck}
			setActiveCheck={setActiveCheck}
			{...props}
		/>
	);
});

function dataRender(item) {
	return {
		empty: '',
		...item
	};
}

function mapStateToProps(state) {
	return ({
		loading: state.publication.listLoading,
		issnList: state.publication.issnList,
		totalpublication: state.publication.totalDoc,
		role: state.login.userInfo.role
	});
}
