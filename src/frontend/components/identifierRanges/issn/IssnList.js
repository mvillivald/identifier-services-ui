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
import {Grid, Typography, FormControlLabel, Checkbox} from '@material-ui/core';
import {useIntl, FormattedMessage} from 'react-intl';
import moment from 'moment';

import * as actions from '../../../store/actions';
import Spinner from '../../Spinner';
import TableComponent from '../../TableComponent';
import {commonStyles} from '../../../styles/app';
import SearchComponent from '../../SearchComponent';
import Issn from './Issn';
import ModalLayout from '../../ModalLayout';
import RangeCreationForm from '../../form/RangeCreationForm';

export default connect(mapStateToProps, actions)(props => {
	const {fetchIDRIssnList, issnList, loading, userInfo} = props;
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const classes = commonStyles();
	const [inputVal, setSearchInputVal] = useState('');
	const [page, setPage] = React.useState(0);
	const [modal, setModal] = useState(false);
	const [issnId, setIssnId] = useState(null);
	const [updateComponent, setUpdateComponent] = useState(false);
	const [activeCheck, setActiveCheck] = useState({
		checked: false,
		canceled: false
	});
	const [rowSelectedId, setRowSelectedId] = useState(null);

	useEffect(() => {
		fetchIDRIssnList({searchText: inputVal, token: cookie[COOKIE_NAME], activeCheck: activeCheck});
		setUpdateComponent(false);
	}, [activeCheck, cookie, fetchIDRIssnList, inputVal, updateComponent]);
	const handleTableRowClick = id => {
		setIssnId(id);
		setModal(true);
		setRowSelectedId(id);
	};

	const handleChange = name => event => {
		setActiveCheck({...activeCheck, [name]: event.target.checked});
	};

	const headRows = [
		{id: 'prefix', label: intl.formatMessage({id: 'ranges.prefix'})},
		{id: 'rangeStart', label: intl.formatMessage({id: 'ranges.rangeStart'})},
		{id: 'rangeEnd', label: intl.formatMessage({id: 'ranges.rangeEnd'})},
		{id: 'free', label: intl.formatMessage({id: 'ranges.free'})},
		{id: 'taken', label: intl.formatMessage({id: 'ranges.taken'})},
		{id: 'canceled', label: intl.formatMessage({id: 'ranges.canceled'})},
		{id: 'next', label: intl.formatMessage({id: 'ranges.next'})},
		{id: 'isClosed', label: intl.formatMessage({id: 'ranges.isClosed'})},
		{id: 'created', label: intl.formatMessage({id: 'ranges.created'})},
		{id: 'createdby', label: intl.formatMessage({id: 'ranges.createdBy'})}

	];

	let issnData;
	if ((issnList === undefined) || (loading)) {
		issnData = <Spinner/>;
	} else if (issnList.length === 0) {
		issnData = <p>No Data</p>;
	} else {
		issnData = (
			<TableComponent
				pagination
				data={issnList
					.map(item => issnListRender(item))}
				handleTableRowClick={handleTableRowClick}
				rowSelectedId={rowSelectedId}
				headRows={headRows}
				page={page}
				setPage={setPage}
			/>
		);
	}

	function issnListRender(item) {
		const {id, prefix, rangeStart, rangeEnd, free, taken, canceled, next, isClosed, created} = item;
		return {
			id: id,
			prefix: prefix,
			rangeStart: rangeStart,
			rangeEnd: rangeEnd,
			free: free,
			taken: taken,
			canceled: canceled,
			next: next,
			isClosed: isClosed,
			created: moment(Number(created.timestamp)).format('L'),
			createdBy: created.user
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="issnList.title.search"/>
			</Typography>
			<SearchComponent searchFunction={fetchIDRIssnList} setSearchInputVal={setSearchInputVal}/>
			<FormControlLabel
				control={
					<Checkbox
						checked={activeCheck.checked}
						value="checked"
						color="primary"
						onChange={handleChange('checked')}
					/>
				}
				label={intl.formatMessage({id: 'rangesList.label.checkbox.active'})}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={activeCheck.canceled}
						value="checked"
						color="primary"
						onChange={handleChange('canceled')}
					/>
				}
				label={intl.formatMessage({id: 'rangesList.label.checkbox.canceled'})}
			/>
			<Grid>
				{
					userInfo.role === 'admin' &&
						<ModalLayout
							form
							label={intl.formatMessage({id: 'issnList.label.button.create'})}
							title={intl.formatMessage({id: 'issnList.label.button.create'})}
							name="issnCreationRange"
							variant="outlined"
							color="primary"
						>
							<RangeCreationForm setUpdateComponent={setUpdateComponent} {...props}/>
						</ModalLayout>
				}
			</Grid>
			{issnData}
			<Issn id={issnId} modal={modal} setModal={setModal}/>
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		userInfo: state.login.userInfo,
		loading: state.identifierRanges.rangeListLoading,
		issnList: state.identifierRanges.issnList,
		totalDoc: state.identifierRanges.totalDoc
	});
}
