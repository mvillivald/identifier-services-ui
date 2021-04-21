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

import React, {useState} from 'react';
import {makeStyles, lighten} from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Toolbar, Tooltip, Paper, IconButton, Checkbox, TablePagination, TableContainer} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

function desc(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}

	if (b[orderBy] > a[orderBy]) {
		return 1;
	}

	return 0;
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0]);
		if (order !== 0) {
			return order;
		}

		return a[1] - b[1];
	});
	return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
	return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

function EnhancedTableHead(props) {
	const {order, orderBy, onRequestSort, headRows} = props;
	const createSortHandler = property => event => {
		onRequestSort(event, property);
	};

	const component = (
		<TableHead>
			<TableRow>
				{headRows.map(row => (
					<TableCell
						key={row.id}
						align="left"
						padding="default"
						sortDirection={orderBy === row.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === row.id}
							direction={order}
							onClick={createSortHandler(row.id)}
						>
							<strong>{row.label}</strong>
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);

	return {...component};
}

const useToolbarStyles = makeStyles(theme => ({
	root: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(1)
	},
	highlight:
		theme.palette.type === 'light' ?
			{
				color: theme.palette.secondary.main,
				backgroundColor: lighten(theme.palette.secondary.light, 0.85)
			} :
			{
				color: theme.palette.text.primary,
				backgroundColor: theme.palette.secondary.dark
			},
	toolbar: {
		justifyContent: 'flex-end',
		minHeight: 'unset'
	}
}));

const EnhancedTableToolbar = props => {
	const {numSelected, handleDelete, selected} = props;
	const classes = useToolbarStyles();
	const component = (
		<Toolbar title="Delete" className={classes.toolbar}>
			{numSelected > 0 && (
				<Tooltip title="Delete">
					<IconButton aria-label="delete" onClick={() => handleDelete(selected)}>
						<DeleteIcon/>
					</IconButton>
				</Tooltip>
			)}
		</Toolbar>
	);

	return {...component};
};

const useStyles = makeStyles(theme => ({
	root: {
		width: '100% !important',
		marginTop: theme.spacing(3)
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2),
		boxShadow: 'none',
		background: 'inherit',
		cursor: 'pointer'
	},
	table: {
		minWidth: 500
	},
	tableRow: {
		'&:hover': {
			background: '#00224f29'
		}
	},

	tableWrapper: {
		overflowX: 'auto'
	},
	selected: {
		background: '#1cec2e29 !important',
		borderLeft: `2px solid ${theme.palette.primary.main}`
	}
}));

export default function (props) {
	const {data, headRows, handleTableRowClick, rowSelectedId, proceedings, page = 0, setPage, pagination} = props;
	const classes = useStyles();
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState(headRows[0].id);
	const [selected, setSelected] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	function handleRequestSort(event, property) {
		const isDesc = orderBy === property && order === 'desc';
		setOrder(isDesc ? 'asc' : 'desc');
		setOrderBy(property);
	}

	function handleClick(event, id) {
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1)
			);
		}

		setSelected(newSelected);
	}

	function isSelected(name) {
		return selected.indexOf(name) !== -1;
	}

	function handleChangePage(event, newPage) {
		setPage(newPage);
	}

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const component = (
		<Paper className={classes.paper}>
			<EnhancedTableToolbar numSelected={selected.length} selected={selected} {...props}/>
			<TableContainer>
				<Table
					className={classes.table}
					aria-labelledby="tableTitle"
				>
					<EnhancedTableHead
						order={order}
						orderBy={orderBy}
						rowCount={data.length}
						headRows={headRows}
						onRequestSort={handleRequestSort}
					/>
					<TableBody>
						{stableSort(data, getSorting(order, orderBy))
							.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
							.map((row, i) => {
								const isItemSelected = isSelected(row.id);
								return (
									<TableRow
										key={row.id}
										selected={rowSelectedId ? (row.userId ? row.userId === rowSelectedId : row.id === rowSelectedId) : isItemSelected}
										classes={{selected: classes.selected}}
										role={!rowSelectedId && 'checkbox'}
										className={classes.tableRow}
										onClick={
											event => handleTableRowClick ?
												handleTableRowClick(row.userId ? row.userId : (proceedings ? {type: row.type, id: row.id} : row.id)) :
												handleClick(event, row.id)
										}
									>
										{
											Object.keys(row).map(item => item === 'checkbox' &&
												<TableCell padding="checkbox">
													<Checkbox
														checked={isItemSelected}
														inputProps={{'aria-labelledby': `enhanced-table-checkbox${i}`, style: {position: 'unset', height: 'unset', width: 'unset'}}}
													/>
												</TableCell>
											)
										}
										{headRows.reduce((acc, h) => {
											Object.keys(row).forEach(key => (key !== 'id' && key !== 'mongoId' && key !== 'checkbox') &&
												(
													h.id === key &&
													acc.push(
														<TableCell key={row[key]} component="th" scope="row">
															{(row[key] === true ?
																'true' :
																(
																	row[key] === false ?
																		'false' :
																		row[key]
																)
															)}
														</TableCell>
													)
												));
											return acc;
										}, [])}
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
			{
				pagination &&
					<TablePagination
						rowsPerPageOptions={[10, 25, 50]}
						component="div"
						count={data.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onChangePage={handleChangePage}
						onChangeRowsPerPage={handleChangeRowsPerPage}
						{...props}
					/>
			}
		</Paper>
	);

	return {
		...component
	};
}
