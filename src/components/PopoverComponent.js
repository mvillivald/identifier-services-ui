import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	rootPopover: {
		display: 'flex',
		alignItems: 'center',
		marginLeft: '8px'
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1),
		maxWidth: 500,
		background: 'green',
		color: 'white'
	}
}));

export default function MouseOverPopover(props) {
	const {infoText, icon} = props;
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	const comp = (
		<div className={classes.rootPopover}>
			<Typography
				aria-owns={open ? 'mouse-over-popover' : undefined}
				aria-haspopup="true"
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
			>
				{icon}
			</Typography>
			<Popover
				disableRestoreFocus
				id="mouse-over-popover"
				className={classes.popover}
				classes={{
					paper: classes.paper
				}}
				open={open}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
				}}
				onClose={handlePopoverClose}
			>
				<div>{infoText}</div>
			</Popover>
		</div>
	);

	return {
		...comp
	};
}
