/* eslint-disable complexity */
import React from 'react';
import {Grid, ListItem, ListItemText, Chip, Typography, Link} from '@material-ui/core';
import {Field, FieldArray} from 'redux-form';
import {FormattedMessage, useIntl} from 'react-intl';
import moment from 'moment';

import renderTextField from './form/render/renderTextField';
import renderSelect from './form/render/renderSelect';
import renderMultiSelect from './form/render/renderMultiSelect';
import renderTextArea from './form/render/renderTextArea';
import renderContactDetail from './form/render/renderContactDetail';
import useFormStyles from '../styles/form';
import useStyles from '../styles/listComponent';
import {fieldArray} from '../components/form/publisherRegistrationForm/formFieldVariable';
import {getFieldArray} from './form/IsbnIsmnRegForm';
import {classificationCodes, isbnClassificationCodes, publisherCategory} from './form/publisherRegistrationForm/formFieldVariable';

export default function (props) {
	const classes = useStyles();
	const {label, value, edit, linkPath, fieldName, clearFields} = props;
	const intl = useIntl();
	const formClasses = useFormStyles();

	function renderSwitch(value) {
		switch (typeof value) {
			case undefined:
				return undefined;
			case 'string':
			case 'number':
				return (
					(fieldName === 'additionalDetails' || fieldName === 'notes' || fieldName === 'rejectionReason' || fieldName === 'aliases' ||
						fieldName === 'organizationDetails[affiliate]' || fieldName === 'organizationDetails[distributor]') ?
						(edit ? renderEditAdditionalDetails(fieldName, label) : value) :
						<>
							<Grid item xs={6}>
								<span className={classes.label}>{label}:</span>
							</Grid>
							<Grid item xs={6}>
								{edit ? (
									fieldName === 'frequency' ? (
										renderEditFrequency(fieldName)
									) : (fieldName === 'preferences[defaultLanguage]' || fieldName === 'language') || fieldName === 'publisher[language]' || fieldName === 'uniform[language]' ? (
										renderEditDefaultLanguage(fieldName)
									) : fieldName === 'type' ? (
										renderEditType(fieldName)
									) : fieldName === 'state' ? (
										renderEditState(fieldName)
									) : fieldName === 'publisherType' ? (
										renderEditPublisherType(fieldName)
									) : fieldName === 'publisherCategory' ? (
										renderEditPublisherCategory(fieldName)
									) : fieldName === 'metadataDelivery' ? (
										renderEditMetadataDelivery(fieldName)
									) : fieldName === 'classification' ? (
										getClassificationValue(Number(value), classificationCodes)
									) : fieldName === 'publishingActivities' ? (
										renderEditPublishingActivities(fieldName)
									) : fieldName === 'backgroundProcessingState' ? (
										renderEditBackgroundProcessingState(fieldName)
									) : (
										<Field name={fieldName} className={formClasses.editForm} component={renderTextField}/>
									)
								) : (
									fieldName === 'classification' ? (
										getClassificationValue(Number(value), classificationCodes)
									) : fieldName === 'publisherCategory' ? (
										getPublisherCategory(value, publisherCategory)
									) : fieldName === 'timestamp' ? (
										moment(Number(value)).format('L')
									) : linkPath ?
										<Link href={linkPath} color="primary"> {value} </Link> :
										value
								)}
							</Grid>
						</>
				);
			case 'boolean':
				return (
					<>
						<Grid item xs={6}>
							<span className={classes.label}>{label}:</span>
						</Grid>
						<Grid item xs={6}>
							{edit ? (
								<Field
									name={fieldName}
									type="select"
									className={formClasses.editForm}
									component={renderSelect}
									options={[
										{label: 'True', value: 'true'},
										{label: 'False', value: 'false'}
									]}
								/>
							) : (
								value.toString()
							)}
						</Grid>
					</>
				);
			case 'object':
				return renderObject(value);

			default:
				return null;
		}

		function renderObject(obj) {
			if (Array.isArray(obj)) {
				if (fieldName === 'classification' || fieldName === 'isbnClassification') {
					if (edit) {
						const codes = fieldName === 'classification' ? classificationCodes : isbnClassificationCodes;
						return (
							<>
								<Grid item xs={6}>
									<span className={classes.label}>{label}:</span>
								</Grid>
								{renderEditClassification(fieldName, codes)}
							</>
						);
					}

					return (
						<>
							<Grid item xs={6}>
								<span className={classes.label}>{label}:</span>
							</Grid>
							{obj.map(item => (
								<Grid key={item} item>
									{
										fieldName === 'classification' ? (
											<Chip label={getClassificationValue(Number(item), classificationCodes)}/>
										) : (<Chip label={getClassificationValue(Number(item), isbnClassificationCodes)}/>
										)
									}
								</Grid>
							))}
						</>
					);
				}

				if (fieldName === 'organizationDetails[affiliates]') {
					if (edit) {
						return (
							<Grid item xs={12}>
								<FieldArray
									component={renderContactDetail}
									name={fieldName}
									props={{data: fieldArray[2].affiliate[1].fields, fieldName}}
								/>
							</Grid>
						);
					}

					return (
						<Grid item xs={6}>
							<span> No affiliate Added</span>
						</Grid>
					);
				}

				if (fieldName === 'publisherIdentifier') {
					return obj.map(item => (
						<Chip key={item} label={item}/>
					));
				}

				if (fieldName === 'authors') {
					if (edit) {
						const fields = getFieldArray(intl);
						return (
							<Grid item xs={12}>
								<FieldArray
									component={renderContactDetail}
									name={fieldName}
									props={{data: fields[4].Authors[0].fields, clearFields, fieldName}}
								/>
							</Grid>
						);
					}

					return (
						<>
							{obj.length > 0 ?
								obj.map(item => {
									const keys = Object.keys(item);
									return Array.isArray(item) ?
										renderObject(item) :
										(
											typeof item === 'string' ?
												(
													<Grid key={item} item>
														<Chip label={item}/>
													</Grid>
												) : (
													<Grid key={item} container>
														{keys.length > 0 && keys.map(k =>
															typeof item[k] === 'object' ?
																renderObject(item[k]) :
																(
																	<Grid key={k} container>
																		<Grid item xs={4}>
																			<span className={classes.label}>{intl.formatMessage({id: `listComponent.${k}`})}:</span>
																		</Grid>
																		<Grid item xs={8}>
																			{item[k]}
																		</Grid>
																		<hr/>
																	</Grid>
																)
														)}
													</Grid>
												)
										);
								}) : (
									<Grid item xs={6}>
										<span> No Authors Added</span>
									</Grid>
								)}
						</>
					);
				}

				if (fieldName === 'issnFormatDetails') {
					return (
						<>
							<Grid item xs={6}>
								<span className={classes.label}>{label}:</span>
							</Grid>
							{obj.map(item => {
								return (
									<Grid key={item} item>
										<Chip label={item.format}/>
									</Grid>
								);
							})}
						</>
					);
				}

				if (edit && fieldName === 'primaryContact') {
					return (
						<>
							<Grid item xs={6}>
								<span className={classes.label}>{label}:</span>
							</Grid>
							<Grid item xs={6}>
								{/* TO DO: fix needed to edit primary contact */}
								{/* {fieldArrayElement({data: fieldArray[1].primaryContact, fieldName: 'primaryContact', clearFields})} */}
							</Grid>
						</>
					);
				}

				if (obj.some(item => typeof item === 'string')) {
					return (
						<Grid item container className={classes.arrayContainer}>
							<Grid item xs={6}>
								<span className={classes.label}>{label}:</span>
							</Grid>
							<Grid item xs={6}>
								{obj.map(item => {
									return <Chip key={item} label={item}/>;
								})}
							</Grid>
						</Grid>
					);
				}

				return renderObjectElements(label, obj);
			}

			return renderObjectElements(label, obj);
		}

		function renderObjectElements(label, value, subFieldName) {
			const component = (
				<Grid item xs={12} className={classes.objectContainer}>
					<Typography>
						<span className={classes.label}>
							<FormattedMessage id={label}/>
						</span>
					</Typography>
					{Array.isArray(value) && value.length > 0 ?
						value.map(item =>
							typeof item === 'string' ? (
								<Chip key={item} label={item}/>
							) : (
								<ul key={item} style={{borderBottom: '1px dashed', listStyleType: 'none'}}>
									{Object.keys(item).map(key =>
										item[key] === 'string' ? (
											<li key={key} className={classes.dropDownList}>
												<span className={classes.label}>
													<FormattedMessage id={key}/>:
												</span>
												<span>{edit ? <Field name={`${item}[${key}]`} className={formClasses.editForm} component={renderTextField}/> : item[key]}</span>
											</li>
										) : renderObject(item)
									)}
								</ul>
							)
						) :
						Object.entries(value).map(([key, val]) =>
							typeof val === 'object' ? (
								renderObjectElements(key, val, value)
							) : (
								<li key={key} className={classes.dropDownList}>
									<span className={classes.label}>
										<FormattedMessage id={key}/>:
									</span>
									<span>
										{typeof value[key] === 'boolean' ? (
											edit ? (
												<Field
													name={`${fieldName}[${key}]`}
													type="select"
													className={formClasses.editForm}
													component={renderSelect}
													options={[
														{label: 'True', value: 'true'},
														{label: 'False', value: 'false'}
													]}
												/>
											) : (
												value[key].toString()
											)
										) : edit ? (
											key === 'defaultLanguage' ? (
												<Grid item xs={6}>
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
											) : key === 'format' ? (
												value[key]
											) : (value.format === 'electronic' || value.format === 'printed-and-electroinc') && key === 'fileFormat' ? (
												<Grid item xs={6}>
													<Field
														name={`${fieldName}[${key}]`}
														type="select"
														component={renderSelect}
														options={[
															{label: '', value: ''},
															{label: 'Pdf', value: 'pdf'},
															{label: 'Epub', value: 'epub'},
															{label: 'CD', value: 'cd'},
															{label: 'MP3', value: 'mp3'}
														]}
													/>
												</Grid>
											) : (value.format === 'printed' || value.format === 'printed-and-electroinc') && key === 'printFormat' ? (
												<Grid item xs={6}>
													<Field
														name={`${fieldName}[${key}]`}
														type="select"
														component={renderSelect}
														options={[
															{label: '', value: ''},
															{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.paperback'}), value: 'paperback'},
															{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.hardback'}), value: 'hardback'},
															{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.spiral-binding'}), value: 'spiral-binding'}
														]}
													/>
												</Grid>
											) : (
												<Field name={subFieldName ? `${fieldName}[${Object.keys(subFieldName)[0]}][${key}]` : `${fieldName}[${key}]`} className={formClasses.editForm} component={renderTextField}/>
											)
										) : (
											value[key]
										)}
									</span>
								</li>
							)
						)}
				</Grid>
			);

			return component;
		}
	}

	const component = (
		<ListItem>
			<ListItemText>
				<Grid container>{renderSwitch(value)}</Grid>
			</ListItemText>
		</ListItem>
	);
	return {
		...component
	};

	function renderEditDefaultLanguage(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: 'Fin', value: 'fin'},
						{label: 'Eng', value: 'eng'},
						{label: 'Swd', value: 'swe'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditState(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: 'New', value: 'new'},
						{label: 'Accepted', value: 'accepted'},
						{label: 'Rejected', value: 'rejected'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditBackgroundProcessingState(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: 'Pending', value: 'pending'},
						{label: 'In Progress', value: 'inProgress'},
						{label: 'Processed', value: 'processed'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditPublisherType(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: 'P', value: 'P'},
						{label: 'A', value: 'A'},
						{label: 'T', value: 'T'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditType(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.cartoon'}), value: 'cartoon'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.freepaper'}), value: 'free-paper'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.journal'}), value: 'journal'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.membershipmagazine'}), value: 'membership-magazine'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.monography'}), value: 'monography'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.newsletter'}), value: 'newsletter'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.newspaper'}), value: 'newspaper'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.staffmagazine'}), value: 'staff-magazine'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditPublisherCategory(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.privatePerson"/>, value: 'private person'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.associationCorporationOrganisation"/>, value: 'association/corporation/organisation/foundation'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.cityMunicipality"/>, value: 'city/municipality'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.school"/>, value: 'school'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.chruchOrcongregation"/>, value: 'church or congregation'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.governmentInstitution"/>, value: 'government institution'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.otherOrganization"/>, value: 'other organization'},
						{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.other"/>, value: 'other'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditPublishingActivities(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.continuous'}), value: 'continuous'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.occasional'}), value: 'occasional'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditMetadataDelivery(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: intl.formatMessage({id: 'listComponent.manual'}), value: 'manual'},
						{label: intl.formatMessage({id: 'listComponent.external'}), value: 'external'}
					]}
				/>
			</Grid>
		);
	}

	function renderEditFrequency(fieldName) {
		return (
			<Grid item xs={6}>
				<Field
					name={fieldName}
					type="select"
					component={renderSelect}
					options={[
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.yearly'}), value: 'yearly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.monthly'}), value: 'monthly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.weekly'}), value: 'weekly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.daily'}), value: 'daily'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.biyearly'}), value: 'bi-yearly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.quarterly'}), value: 'quarterly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.bimonthly'}), value: 'bi-monthly'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.continuously'}), value: 'continuously'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.irregular'}), value: 'irregular'}
					]}
				/>
			</Grid>
		);
	}

	function getClassificationValue(value, array) {
		const reducedValue = array.reduce((acc, item) => {
			if (item.value === value) {
				acc = intl.formatMessage({id: `${item.label.props.id}`});
				return acc;
			}

			return acc;
		}, '');
		return reducedValue;
	}

	function getPublisherCategory(value, array) {
		const reducedValue = array.reduce((acc, item) => {
			if (item.value === value) {
				acc = intl.formatMessage({id: `${item.label.props.id}`});
				return acc;
			}

			return acc;
		}, '');
		return reducedValue;
	}

	function renderEditClassification(fieldName, options) {
		return (
			<Grid item xs={12}>
				<Field
					className={`${classes.selectField} ${classes.full}`}
					component={renderMultiSelect}
					name={fieldName}
					type="multiSelect"
					options={options}
					props={{isMulti: true}}
				/>
			</Grid>
		);
	}

	function renderEditAdditionalDetails(fieldName, label) {
		return (
			<Field
				className={`${classes.textArea} ${classes.full}`}
				component={renderTextArea}
				name={fieldName}
				label={label}
				type="multiline"
			/>
		);
	}
}
