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

import express from 'express';
import cors from 'cors';
import path from 'path';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import validateContentType from '@natlibfi/express-validate-content-type';
import parse from 'url-parse';
import fetch from 'node-fetch';
import base64 from 'base-64';
import svgCaptcha from 'svg-captcha';
import uuidv4 from 'uuid/v4';
import fs from 'fs';
import HttpStatus from 'http-status';
import jose from 'jose';
import {
	HTTP_PORT,
	TOKEN_MAX_AGE,
	SMTP_URL,
	API_URL,
	ADMINISTRATORS_EMAIL,
	PRIVATE_KEY_URL,
	NOTIFICATION_URL,
	COOKIE_NAME,
	CROWD_APP_PASSWORD,
	CROWD_APP_NAME,
	CROWD_URL,
	UI_URL,
	API_USERNAME,
	API_PASSWORD,
	API_CLIENT_USER_AGENT
} from './config';
import * as frontendConfig from './frontEndConfig';
import {Utils, createApiClient} from '@natlibfi/identifier-services-commons';
import CrowdClient from 'atlassian-crowd-client';

function bodyParse() {
	validateContentType({
		type: ['application/json']
	});
	return bodyParser.json({
		type: ['application/json']
	});
}

const app = express();
app.use(cors());
app.use(bodyParse());

process.on('SIGINT', () => {
	process.exit(-1);
});

app.use(express.static(path.resolve(__dirname, 'public')));

app.post('/message', (req, res) => {
	const {body, headers} = req;
	const token = headers.authorization;
	async function main() {
		const parseUrl = parse(SMTP_URL, true);
		const emailcontent = `
			${body.description ? body.description : body.body}
		`;

		let transporter = nodemailer.createTransport({
			host: parseUrl.hostname,
			port: parseUrl.port,
			secure: false
		});
		await transporter.sendMail({
			from: ADMINISTRATORS_EMAIL,
			to: body.sendTo ? body.sendTo : body.email,
			cc: body.cc ? body.cc : [],
			replyTo: ADMINISTRATORS_EMAIL,
			subject: body.subject,
			html: emailcontent
		});
		const response = await fetch(`${API_URL}/messages/`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				subject: body.subject,
				email: body.sendTo ? body.sendTo : body.email,
				cc: body.cc,
				body: body.description ? body.description : body.body
			})
		});
		if (response) {
			res.send('Message Sent');
		}
	}

	main().catch(console.error);
});

app.post('/sendEmail', (req, res) => {
	async function main() {
		const {request} = req.body;
		const result = await createLinkAndSendEmail({request});
		res.json(result);
	}

	main().catch(console.error);
});

let captchaList = [];
let captcha;

app.get('/captcha', (req, res) => {
	captcha = svgCaptcha.createMathExpr({
		mathMin: 1,
		mathMax: 9,
		mathOperator: '+',
		noise: 0
	});
	captcha.id = uuidv4();
	const {text, ...captchaWithoutText} = captcha;
	res.type('svg');
	captchaList.push(captcha);

	res.json(captchaWithoutText);
});

app.post('/captcha', (req, res) => {
	// eslint-disable-next-line no-unused-expressions
	captchaList.some(item => (item.id === req.body.id) && item.text === req.body.captchaInput) ?
		(res.send(true) && captchaList.map((item, i) => (item.text === req.body.captchaInput) &&
		captchaList.splice(i, 1))) : res.send(false) && captchaList.map((item, i) => (item.id === req.body.id) &&
		captchaList.splice(i, 1));
});

app.post('/auth', async (req, res) => {
	const API_URL = req.body.API_URL;
	const result = await fetch(`${API_URL}/auth`, {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			Authorization: `Basic ${base64.encode(`${req.body.username}:${req.body.password}`)}`
		}
	});
	const token = result.headers.get('Token');
	if (token === null) {
		res.status(HttpStatus.BAD_REQUEST).json();
	} else {
		res.cookie(COOKIE_NAME, token, {maxAge: TOKEN_MAX_AGE, secure: false});
		res.status(HttpStatus.OK).json(token);
	}
});

// =====> TO BE DELETED LATER <======
// app.get('/users/:id', async (req, res) => {
// 	const API_URL = req.body.API_URL;
// 	const systemToken = await systemAuth();
// 	const id = req.params.id;
// 	const result = await fetch(`${API_URL}/users/${id}`, {
// 		method: 'GET',
// 		headers: {
// 			Authorization: `Bearer ${systemToken}`
// 		}
// 	});

// 	res.json(result.json());
// });

app.post('/requests/publishers', async (req, res) => {
	const systemToken = await systemAuth();
	const response = await fetch(`${API_URL}/requests/publishers`, {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			Authorization: `Bearer ${systemToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(req.body)
	});
	res.status(response.status).json();
});

app.post('/publications/isbn-ismn', async (req, res) => {
	const {values, token} = req.body;
	const systemToken = await systemAuth();
	const response = await fetch(`${API_URL}/publications/isbn-ismn`, {
		method: 'POST',
		headers: token ? {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		} :
			{
				Authorization: `Bearer ${systemToken}`,
				'Content-Type': 'application/json'
			},
		body: JSON.stringify(values)
	});
	res.status(response.status).json();
});

app.post('/publications/issn', async (req, res) => {
	const {values, token} = req.body;
	const systemToken = await systemAuth();
	const response = await fetch(`${API_URL}/publications/issn`, {
		method: 'POST',
		headers: token ? {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		} :
			{
				Authorization: `Bearer ${systemToken}`,
				'Content-Type': 'application/json'
			},
		body: JSON.stringify(values)
	});
	res.status(response.status).json();
});

app.post('/requests/publications/isbn-ismn', async (req, res) => {
	const values = req.body;
	const systemToken = await systemAuth();
	const response = await fetch(`${API_URL}/requests/publications/isbn-ismn`, {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			Authorization: `Bearer ${systemToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(values)
	});
	res.status(response.status).json();
});

app.post('/requests/publications/issn', async (req, res) => {
	const values = req.body;
	const systemToken = await systemAuth();
	const response = await fetch(`${API_URL}/requests/publications/issn`, {
		method: 'POST',
		headers:
			{
				Authorization: `Bearer ${systemToken}`,
				'Content-Type': 'application/json'
			},
		body: JSON.stringify(values)
	});
	res.status(response.status).json();
});

async function systemAuth() {
	try {
		const result = await fetch(`${API_URL}/auth`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Basic ${base64.encode(`${API_USERNAME}:${API_PASSWORD}`)}`
			}
		});
		return result.headers.get('Token');
	} catch (err) {
		console.log(err);
	}
}

app.get('/notification', (req, res) => {
	const data = fs.readFileSync(`${NOTIFICATION_URL}`, 'utf8');
	res.json(data);
});

app.get('/logOut', (req, res) => {
	res.clearCookie(COOKIE_NAME);
	res.send('cookie cleared');
});

app.post('/passwordreset', async (req, res) => {
	try {
		const systemToken = await systemAuth();
		const response = await fetch(`${API_URL}/users/${req.body.id}/password`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${systemToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req.body)
		});
		res.status(response.status).json();
	} catch (err) {
		console.log(err);
	}
});

app.get('/users/passwordReset/:token', async (req, res) => {
	const token = req.params.token;
	const decrypted = decryptToken(token);
	const decoded = jose.JWT.decode(decrypted);
	if (Date.now() <= decoded.exp * 1000) {
		res.sendFile(path.join(__dirname, 'public/index.html'));
	} else {
		res.send('Link Expired !!!');
	}
});

app.post('/decryptToken', async (req, res) => {
	const token = req.body.token;
	const result = decryptToken(token);
	res.json(result);
});

app.post('/decodeToken', async (req, res) => {
	const token = req.body.token;
	const result = jose.JWT.decode(token);
	res.json(result);
});

app.get('/conf', (_req, res) => {
	res.json(frontendConfig);
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(HTTP_PORT, () => console.log('info', `Application Started on PORT ${HTTP_PORT}`));

function decryptToken(token) {
	const encryptionKey = jose.JWK.asKey(fs.readFileSync(`${PRIVATE_KEY_URL}`, 'utf-8'));
	const decrypted = jose.JWE.decrypt(token, encryptionKey);
	return decrypted.toString();
}

async function createLinkAndSendEmail({request}) {
	const {sendEmail} = Utils;
	const {JWK, JWE} = jose;
	const key = JWK.asKey(fs.readFileSync(PRIVATE_KEY_URL, 'utf-8'));
	if (CROWD_URL && CROWD_APP_NAME && CROWD_APP_PASSWORD) {
		const crowdClient = new CrowdClient({
			baseUrl: CROWD_URL,
			application: {
				name: CROWD_APP_NAME,
				password: CROWD_APP_PASSWORD
			}
		});

		const response = await crowdClient.user.get(request.email);
		if (response) {
			const privateData = {
				userId: request.email,
				id: request.email
			};
			const payload = jose.JWT.sign(privateData, key, {
				expiresIn: '24 hours',
				iat: true
			});
			const token = await JWE.encrypt(payload, key, {kid: key.kid});
			const link = `${UI_URL}/users/passwordReset/${token}`;
			const result = sendEmail({
				name: 'change password',
				args: {link},
				getTemplate,
				SMTP_URL,
				API_EMAIL: request.email,
				ADMINISTRATORS_EMAIL
			});
			return result;
		}
	}
}

async function getTemplate(query, cache) {
	const client = createApiClient({
		url: API_URL,
		username: API_USERNAME,
		password: API_PASSWORD,
		userAgent: API_CLIENT_USER_AGENT
	});
	const key = JSON.stringify(query);
	if (key in cache) {
		return cache[key];
	}

	return {...cache, [key]: await client.templates.getTemplate(query)};
}
