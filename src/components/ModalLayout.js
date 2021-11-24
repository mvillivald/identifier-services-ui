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
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Modal, Typography, Button} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import {useIntl} from 'react-intl';

import useStyles from '../styles/modalLayout';
import AlertDialogs from './AlertDialogs';

export default connect(mapStateToProps)(withRouter(props => {
	const {label, name, children, icon, fab, variant, color, mainClass, classed, isTableRow, setCreatingNewRange, handleCloseModal, form, title, dynamicTitle, setDynamicTitle, setPwd, modal, setModal} = props;
	const classes = useStyles();
	const intl = useIntl();
	const [openModal, setOpen] = useState(false);
	const [message, setMessage] = useState(null);
	const [agree, setAgree] = useState(null);

	useEffect(() => {
		if (setCreatingNewRange) {
			setCreatingNewRange(true);
		}

		return isTableRow && setOpen(modal);
	}, [isTableRow, modal, setCreatingNewRange]);

	useEffect(() => {
		if (form || fab) {
			handleClose();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [agree]);

	const handleOpen = () => {
		setOpen(true);
	};

	function handleClose() {
		setOpen(false);
		setAgree(null);
		if (title === 'Forgot Password ?') {
			setPwd(false);
		}

		if (dynamicTitle) {
			setDynamicTitle('');
		}

		if (isTableRow) {
			handleCloseModal && handleCloseModal(); // eslint-disable-line no-unused-expressions
			setModal(false);
		}
	}

	const component = (
		<>
			{fab ?
				<EmailIcon className={classes.personIcon} onClick={handleOpen}/> :
				<Button variant={variant} color={color} className={classed} size="medium" onClick={handleOpen}>
					{icon === true && <PersonIcon className={classes.personIcon} onClick={handleOpen}/>}
					{label}
				</Button>}
			<Modal
				disableRestoreFocus
				eslint-disable-next-line
				no-alert
				open={openModal}
				className={classes.container}
				aria-labelledby={`modal-${name}`} aria-describedby="modal-description"
				onClose={(form === true || fab) ? (() => {
					setMessage(intl.formatMessage({id: 'app.modal.exit.message'}));
					if (agree) {
						setAgree(null);
						setMessage(null);
						handleClose();
					}
				}) : handleClose}
			>
				<div className={mainClass ? mainClass : classes.main}>
					<IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
						<CloseIcon/>
					</IconButton>
					{title &&
						<Typography variant="h5" id={`modal-${name}`} className={classes.modaltitle}>
							{title}
						</Typography>}
					{React.cloneElement(children, {handleClose: handleClose})}
				</div>
			</Modal>
			{message && <AlertDialogs openAlert={agree} setOpenAlert={setAgree} setMessage={setMessage} message={message}/>}
		</>
	);

	return {
		...component
	};
}));

function mapStateToProps(state) {
	return {
		isLogin: state.login.isLogin,
		userInfo: state.login.userInfo
	};
}
