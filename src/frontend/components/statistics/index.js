/* eslint-disable react-hooks/exhaustive-deps */
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
import {
	Grid,
	Typography,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Button,
	MenuItem,
	Radio,
	TextField,
	Select
} from '@material-ui/core';
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import {FormattedMessage} from 'react-intl';
import XLSX from 'xlsx';
import useStyles from '../../styles/statistic';
import * as actions from '../../store/actions';
import {
	getMonthlyIssnStatistics
} from './calculations';

export default connect(mapStateToProps, actions)(props => {
	const {fetchIssnRangeStatistics, fetchIsbnIsmnStatistics, fetchIsbnIsmnMonthlyStatistics, fetchIssnStatistics, rangeStatistics, issnStatistics, exportXLS} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [publicationType, setPublicationType] = useState(null);
	const [selectedIsbnIsmnType, setSelectedIsbnIsmnType] = useState(null);
	const [selectedIssnType, setSelectedIssnType] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [fetchedRangeStatistics, setFetchedRangeStatistics] = useState(null);
	const [identifierType, setIdentifierType] = useState(null);

	useEffect(() => {
		if (rangeStatistics !== null) {
			rangeStatistics.reduce((acc, item) => {
				acc.push({prefix: item.prefix});
				return acc;
			}, []);
			setFetchedRangeStatistics(rangeStatistics);
		}
	}, [rangeStatistics]);

	useEffect(() => {
		if (selectedIsbnIsmnType === 'isbnIdentificationFields') {
			setIdentifierType('ISBN');
		}

		if (selectedIsbnIsmnType === 'ismnIdentificationFields') {
			setIdentifierType('ISMN');
		}
	}, [selectedIsbnIsmnType]);

	useEffect(() => {
		if (publicationType === 'issn') {
			if (selectedIssnType === 'issn' && startDate !== null && endDate !== null) {
				fetchIssnRangeStatistics({startDate, endDate, token: cookie[COOKIE_NAME]});
				fetchIssnStatistics({startDate, endDate, token: cookie[COOKIE_NAME]});
			}
		}

		if (publicationType === 'isbn-ismn') {
			if (selectedIsbnIsmnType === 'monthlyStatistics') {
				fetchIsbnIsmnMonthlyStatistics({startDate, endDate, token: cookie[COOKIE_NAME]});
			}

			if ((selectedIsbnIsmnType === 'isbnIdentificationFields' ||
			selectedIsbnIsmnType === 'ismnIdentificationFields') &&
			identifierType !== null) {
				fetchIsbnIsmnStatistics({identifierType: identifierType, token: cookie[COOKIE_NAME]});
			}
		}
	}, [startDate, endDate, identifierType]);

	function handleStatistics() {
		if (publicationType === 'issn') {
			const wbout = XLSX.utils.book_new();
			if (fetchedRangeStatistics !== null) {
				const totalStatistics = fetchedRangeStatistics.map(item => filterDoc(item));
				if (issnStatistics !== null) {
					const monthlyStatistics = getMonthlyIssnStatistics({startDate, endDate, value: issnStatistics});
					const ws = XLSX.utils.json_to_sheet(totalStatistics);
					XLSX.utils.sheet_add_json(ws, monthlyStatistics, {origin: {r: totalStatistics.length + 2, c: 1}});
					exportXLS(wbout, ws);
				}
			}
		}

		if (publicationType === 'isbn-ismn') {
			const wbout = XLSX.utils.book_new();
			if (selectedIsbnIsmnType === 'isbnIdentificationFields') {
				const newJsonSheet = fetchedRangeStatistics.map(item => {
					const newDoc = {
						Etuliite: item.prefix,
						Kieliryhmä: item.langGroup,
						Alku: item.rangeStart,
						Loppu: item.rangeEnd,
						Vapaana: item.free,
						Käytetty: item.taken
					};
					return newDoc;
				});

				const headers = ['Etuliite', 'Kieliryhmä', 'Alku',	'Loppu', 'Vapaana',	'Käytetty'];
				const ws = XLSX.utils.json_to_sheet(newJsonSheet, {header: headers});
				exportXLS(wbout, ws);
			}

			if (selectedIsbnIsmnType === 'ismnIdentificationFields') {
				const newJsonSheet = fetchedRangeStatistics.map(item => {
					const newDoc = {
						Etuliite: item.prefix,
						Alku: item.rangeStart,
						Loppu: item.rangeEnd,
						Vapaana: item.free,
						Käytetty: item.taken
					};
					return newDoc;
				});

				const headers = ['Etuliite', 'Alku', 'Loppu', 'Vapaana', 'Käytetty'];
				const ws = XLSX.utils.json_to_sheet(newJsonSheet, {header: headers});
				exportXLS(wbout, ws);
			}

			// Const colLable = getcolLabel({startDate, endDate});
			// const titles = getTableTitles();
			// const ws = XLSX.utils.json_to_sheet(titles, {skipHeader: true});
			// XLSX.utils.sheet_add_json(ws, [colLable], {skipHeader: true, origin: 'A1'});
			// exportXLS(wbout, ws);
		}

		setSelectedIssnType(null);
		setStartDate(null);
		setEndDate(null);
	}

	const classes = useStyles();

	const publicationTypeOptions = [
		{label: 'Isbn-Ismn', value: 'isbn-ismn'},
		{label: 'Issn', value: 'issn'}
	];

	function handlePublicationTypeChange(event) {
		setPublicationType(event.target.value);
	}

	function handleSelectedIsbnIsmnTypeChange(event) {
		setSelectedIsbnIsmnType(event.target.value);
	}

	function handleSelectedIssnTypeChange(event) {
		setSelectedIssnType(event.target.value);
	}

	function filterDoc(doc) {
		return Object.entries(doc)
			.filter(([key]) => key === '_id' === false)
			.filter(([key]) => key === 'rangeStart' === false)
			.filter(([key]) => key === 'rangeEnd' === false)
			.filter(([key]) => key === 'active' === false)
			.filter(([key]) => key === 'canceled' === false)
			.filter(([key]) => key === 'lastUpdated' === false)
			.filter(([key]) => key === 'isClosed' === false)
			.filter(([key]) => key === 'created' === false)
			.filter(([key]) => key === 'next' === false)
			.reduce((acc, [
				key,
				value
			]) => ({...acc, [key]: value}), {total: `${Number(doc.rangeEnd) - Number(doc.rangeStart)}`});
	}

	const elements = (
		<Grid container>
			<Grid item xs={6}>
				<FormControl component="fieldset">
					<FormLabel component="legend">Select Publication Type</FormLabel>
					<RadioGroup aria-label="publicationType" name="publicationType1" value={publicationType} onChange={handlePublicationTypeChange}>
						{publicationTypeOptions.map(item => (
							<FormControlLabel key={item.value} value={item.value} control={<Radio color="primary"/>} label={item.label}/>
						))}
					</RadioGroup>
				</FormControl>
			</Grid>
			{publicationType === 'isbn-ismn' && getIsbnIsmnElements()}
			{publicationType === 'issn' && getIssnElements()}
			{
				(publicationType === 'isbn-ismn' || publicationType === 'issn') &&
					<Grid item xs={6}>
						<Button variant="contained" color="primary" onClick={handleStatistics}>
							<FormattedMessage id="app.menu.statistics"/>
						</Button>
					</Grid>
			}
		</Grid>
	);

	function getIsbnIsmnElements() {
		const selectedIsbnIsmnTypeOptions = [
			{label: 'Monthly Statistics', value: 'monthlyStatistics'},
			{label: 'ISBN Identification Fields', value: 'isbnIdentificationFields'},
			{label: 'ISMN Identification Fields', value: 'ismnIdentificationFields'},
			{label: 'All ISBN Publishers', value: 'allIsbnPublishers'},
			{label: 'International Registry ISBN Publishers', value: 'internationalRegistryIsbnPublishers'},
			{label: 'Self-published ISBN', value: 'selfPublishedIsbn'},
			{label: 'International Registry ISBN Publishers', value: 'internationalRegistryIsbnPublishers'},
			{label: 'Self-published ISMN', value: 'selfPublishedIsmn'}
		];
		return (
			<Grid container item xs={12}>
				{typeElements(selectedIsbnIsmnType, selectedIsbnIsmnTypeOptions, handleSelectedIsbnIsmnTypeChange)}
				{dateElements()}
			</Grid>
		);
	}

	function getIssnElements() {
		const selectedIssnTypeOptions = [
			{label: 'ISSN', value: 'issn'}
			// {label: 'Publishers', value: 'publishers'},
			// {label: 'Proceedings', value: 'proceedings'},
			// {label: 'Pleading', value: 'pleading'}
		];
		return (
			<Grid container item xs={12}>
				{typeElements(selectedIssnType, selectedIssnTypeOptions, handleSelectedIssnTypeChange)}
				{dateElements()}
			</Grid>
		);
	}

	function dateElements() {
		return (
			<>
				<Grid container item xs={12}>
					<Grid item xs={2}>
						<Typography variant="subtitle1">StartTime :</Typography>
					</Grid>
					<Grid item xs={4}>
						<form noValidate className={classes.dateContainer}>
							<TextField
								id="startDate"
								type="date"
								className={classes.textField}
								InputLabelProps={{
									shrink: true
								}}
								onChange={event => setStartDate(event.target.value)}
							/>
						</form>
					</Grid>
				</Grid>
				<Grid container item xs={12}>
					<Grid item xs={2}>
						<Typography variant="subtitle1">EndTime :</Typography>
					</Grid>
					<Grid item xs={4}>
						<form noValidate className={classes.dateContainer}>
							<TextField
								id="endDate"
								type="date"
								className={classes.textField}
								InputLabelProps={{
									shrink: true
								}}
								onChange={event => setEndDate(event.target.value)}
							/>
						</form>
					</Grid>
				</Grid>
			</>
		);
	}

	function typeElements(value, options, onChange) {
		return (
			<Grid container item xs={12}>
				<Grid item xs={2}>
					<Typography variant="subtitle1">Type :</Typography>
				</Grid>
				<Grid item xs={4}>
					<Select
						labelId="select-type-label"
						id="type"
						value={value}
						onChange={onChange}
					>
						{options.map(item => (
							<MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
						))}
					</Select>
				</Grid>
			</Grid>
		);
	}

	const component = (
		<Grid item className={classes.mainContainer} xs={12}>
			<div style={{marginBottom: 20}}>
				<Typography variant="h5">
					<FormattedMessage id="statistics.label.heading"/>
				</Typography>
			</div>
			{console.log(rangeStatistics)}
			{elements}
		</Grid>
	);

	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		listLoading: state.identifierRanges.rangeListLoading,
		issnStatistics: state.publication.issnStatistics,
		rangeStatistics: state.identifierRanges.statistics
	});
}
