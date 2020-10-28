import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	RadioGroup,
	Radio,
	Box,
	FormControlLabel
} from '@material-ui/core';
import {commonStyles} from '../../styles/app';
import {FormattedMessage} from 'react-intl';

export default function TableComponent(props) {
	const {data, value, handleChange} = props;
	const classes = commonStyles();

	const comp = (
		<Box mb={2}>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell><FormattedMessage id="table.cell.prefix"/></TableCell>
						<TableCell align="right"><FormattedMessage id="table.cell.rangeStart"/></TableCell>
						<TableCell align="right"><FormattedMessage id="table.cell.rangeEnd"/></TableCell>
						<TableCell align="right"><FormattedMessage id="table.cell.assignRange"/></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map(row => (
						<TableRow key={row.id}>
							<TableCell component="th" scope="row">{row.prefix}</TableCell>
							<TableCell align="right">{row.rangeStart}</TableCell>
							<TableCell align="right">{row.rangeEnd}</TableCell>
							<TableCell align="right">
								<RadioGroup aria-label="ranges" name="range" value={value} onChange={handleChange}>
									<FormControlLabel className={classes.radioLabel} value={row.id} control={<Radio color="primary"/>}/>
								</RadioGroup>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);

	return {
		...comp
	};
}
