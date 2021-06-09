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
import {Grid, Typography, Checkbox, FormControlLabel, Select, MenuItem, FormHelperText} from '@material-ui/core';
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
		filterByIdentifier: false,
		selfPublishers: false
	});
	const [rowSelectedId, setRowSelectedId] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState('0');

	useEffect(() => {
		searchPublisher({searchText: inputVal, token: cookie[COOKIE_NAME], activeCheck: activeCheck, sort: {'created.timestamp': -1}});
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
	} else if (searchedPublishers === null || searchedPublishers === undefined || searchedPublishers.length === 0) {
		publishersData = <p><FormattedMessage id="publisherList.emptySearch"/></p>;
	} else {
		publishersData = selectedCategory === null ? (
			<TableComponent
				pagination
				data={activeCheck.filterByIdentifier ? (searchedPublishers.filter(i => i.selfPublisher === false)).map(item => searchResultRender(item)) : searchedPublishers.map(item => searchResultRender(item))}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				rowSelectedId={rowSelectedId}
				page={page}
				setPage={setPage}
				totalDoc={totalDoc}
			/>
		) : (
			<TableComponent
				pagination
				data={dataFilteredByCatagory(searchedPublishers, selectedCategory)}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				rowSelectedId={rowSelectedId}
				page={page}
				setPage={setPage}
				totalDoc={dataFilteredByCatagory(searchedPublishers, selectedCategory).length}
			/>
		);
	}

	function searchResultRender(item) {
		const {id, name, phone, aliases, email, activity, publisherIdentifier} = item;
		return {
			id: id,
			empty: '',
			name: name,
			aliases: aliases ? aliases : '',
			email: email,
			phone: phone,
			active: activity.active,
			publisherIdentifier: publisherIdentifier
		};
	}

	function dataFilteredByCatagory(searchedPublishers, selectedCategory) {
		const newData = activeCheck.filterByIdentifier ?
			(searchedPublishers.filter(i => i.selfPublisher === false)).map(item => searchResultRender(item)) :
			searchedPublishers.map(item => searchResultRender(item));
		const result = newData.filter(item => {
			if (selectedCategory === '0') {
				return item;
			}

			return item.publisherIdentifier && item.publisherIdentifier.some(ident => ident.slice(8).length === Number(selectedCategory)) && item;
		});
		return result;
	}

	function onChange(event) {
		setSelectedCategory(event.target.value);
	}

	const categoryOptions = ['0', '1', '2', '3', '4', '5'];

	const component = (
		<Grid container item xs={12} className={classes.listSearch}>
			<Grid item xs={12}>
				<Typography variant="h5"><FormattedMessage id="publisher.search.title"/></Typography>
			</Grid>
			<Grid item xs={12}>
				<SearchComponent searchFunction={searchPublisher} activeCheck={activeCheck} setSearchInputVal={setSearchInputVal}/>
			</Grid>
			<Grid container item xs={12}>
				<FormControlLabel
					control={
						<Checkbox
							checked={activeCheck.checked}
							disabled={activeCheck.filterByIdentifier}
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
				<FormControlLabel
					control={
						<Checkbox
							checked={activeCheck.selfPublishers}
							value="checked"
							color="primary"
							onChange={handleChange('selfPublishers')}
						/>
					}
					label={<FormattedMessage id="publisher.search.filter.selfPublishers"/>}
				/>
				<Grid item>
					<Select
						labelId="select-type-label"
						id="type"
						value={selectedCategory}
						className={classes.selectCategory}
						onChange={onChange}
					>
						{categoryOptions.map(item => (
							<MenuItem key={item} value={item}>{item}</MenuItem>
						))}
					</Select>
					<FormHelperText>
						<FormattedMessage id="publisher.search.filter.filterByRangeCategory"/>
					</FormHelperText>
				</Grid>
			</Grid>
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
