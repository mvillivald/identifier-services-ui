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

import React, {useEffect} from 'react';

export default function (props) {
	const {messageInfo, setMessageToBeSend, quill, quillRef, input, disabled} = props;

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				if (messageInfo !== null) {
					if (setMessageToBeSend) {
						setMessageToBeSend({...messageInfo, body: quillRef.current.innerHTML});
					}

					if (input) {
						const {onChange} = input;
						onChange({body: quillRef.current.innerHTML});
					}
				}
			});
		}
	}, [disabled, input, messageInfo, quill, quillRef, setMessageToBeSend]);

	const component = (
		<div style={{width: '100%', minHeight: 400, border: '1px solid lightgray'}}>
			<div ref={quillRef}/>
		</div>
	);
	return {
		...component
	};
}

