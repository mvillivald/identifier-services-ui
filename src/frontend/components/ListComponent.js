import React from 'react';
import {Grid,
	ListItem,
	ListItemText,
	Chip,
	ExpansionPanel,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	Typography} from '@material-ui/core';
import {Field} from 'redux-form';
import {FormattedMessage} from 'react-intl';
import renderTextField from './form/render/renderTextField';
import renderSelect from './form/render/renderSelect';
import useFormStyles from '../styles/form';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useStyles from '../styles/listComponent';
import {element, fieldArrayElement} from './form/publisherRegistrationForm/commons';
import {fieldArray} from './form/publisherRegistrationForm/formFieldVariable';

export default function (props) {
	const classes = useStyles();

	const {label, value, edit, fieldName, clearFields} = props;
	const formClasses = useFormStyles();

	function renderSwitch(value) {
		switch (typeof value) {
			case undefined:
				return undefined;
			case 'string':
			case 'number':
				return (
					<>
						<Grid item xs={4}><span className={classes.label}>{label}:</span></Grid>
						<Grid item xs={8}>
							{
								edit ?
									<Field name={fieldName} className={formClasses.editForm} component={renderTextField}/> :
									value
							}
						</Grid>
					</>
				);
			case 'boolean':
				return (
					<>
						<Grid item xs={4}><span className={classes.label}>{label}:</span></Grid>
						<Grid item xs={8}>
							{
								edit ?
									<Field
										name={fieldName}
										type="select"
										className={formClasses.editForm}
										component={renderSelect}
										option={[
											{label: 'True', value: 'true'},
											{label: 'False', value: 'false'}
										]}
									/> :
									value.toString()
							}
						</Grid>
					</>
				);
			case 'object':
				return renderObject(value);

			default:
				return null;
		}

		function renderObject(obj) {
			if (obj.length === 0) {
				return null;
			}

			if (Array.isArray(obj)) {
				if (edit && fieldName === 'classification') {
					return (
						<>
							<Grid item xs={8}>
								{ element({
									array: fieldArray[1].publishingActivities.filter(item => item.name === 'classification'),
									classes: formClasses,
									clearFields
								})}
							</Grid>
						</>
					);
				}

				if (edit && fieldName === 'primaryContact') {
					return (
						<>
							<Grid item xs={4}><span className={classes.label}>{label}:</span></Grid>
							<Grid item xs={8}>
								{fieldArrayElement({data: fieldArray[2].primaryContact, fieldName: 'primaryContact', clearFields})}
							</Grid>
						</>
					);
				}

				if (obj.some(item => typeof item === 'string')) {
					return (
						<>
							<Grid item xs={4}><span className={classes.label}>{label}:</span></Grid>
							<Grid item xs={8}>
								{obj.map(item => {
									return (
										<Chip key={item} label={item}/>
									);
								})}
							</Grid>
						</>
					);
				}

				return renderExpansion(label, obj);
			}

			return renderExpansion(label, obj);
		}

		function renderExpansion(label, value, subFieldName) {
			const component = (
				<Grid item xs={12}>
					<ExpansionPanel>
						<ExpansionPanelSummary
							expandIcon={<ExpandMoreIcon/>}
							aria-controls="panel1a-content"
							className={classes.exPanel}
						>
							<Typography>
								<span className={classes.label}>
									<FormattedMessage id={`listComponent.${label}`}/>
								</span>
							</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails className={classes.objDetail}>
							{(Array.isArray(value) && value.length > 0) ? (
								value.map(item => (
									<ul key={item} style={{borderBottom: '1px dashed', listStyleType: 'none'}}>
										{Object.keys(item).map(key => item[key] ?
											(
												<li key={key} className={classes.dropDownList}>
													<span className={classes.label}>
														<FormattedMessage id={`listComponent.${key}`}/>:
													</span>
													<span>
														{
															edit ?
																<Field name={`${item}[${key}]`} className={formClasses.editForm} component={renderTextField}/> :
																item[key]
														}
													</span>
												</li>
											) : null
										)}
									</ul>
								))
							) : (
								Object.entries(value).map(([key, val]) =>
									typeof val === 'object' ?
										renderExpansion(key, val, value) :
										(
											(
												<li key={key} className={classes.dropDownList}>
													<span className={classes.label}>
														<FormattedMessage id={`listComponent.${key}`}/>:
													</span>
													<span>
														{
															typeof value[key] === 'boolean' ?
																(edit ?
																	<Field
																		name={`${fieldName}[${key}]`}
																		type="select"
																		className={formClasses.editForm}
																		component={renderSelect}
																		options={[
																			{label: 'True', value: 'true'},
																			{label: 'False', value: 'false'}
																		]}
																	/> :
																	value[key].toString()
																) : (
																	edit ?
																		(
																			key === 'defaultLanguage' ?
																				(
																					<Grid item xs={8}>
																						<Field
																							name={`${fieldName}[${key}]`}
																							type="select"
																							component={renderSelect}
																							options={[
																								{label: 'Fin', value: 'fin'},
																								{label: 'Eng', value: 'eng'},
																								{label: 'Swd', value: 'swe'}
																							]}
																						/>
																					</Grid>
																				) : (
																					<Field name={subFieldName ? `${fieldName}[${Object.keys(subFieldName)[0]}][${key}]` : `${fieldName}[${key}]`} className={formClasses.editForm} component={renderTextField}/>
																				)
																		) :
																		value[key]
																)
														}
													</span>
												</li>
											)
										)
								)
							)}
						</ExpansionPanelDetails>
					</ExpansionPanel>
				</Grid>
			);

			return component;
		}
	}

	const component = (
		<ListItem>
			<ListItemText>
				<Grid container>
					{renderSwitch(value)}
				</Grid>
			</ListItemText>
		</ListItem>

	);
	return {
		...component
	};
}
