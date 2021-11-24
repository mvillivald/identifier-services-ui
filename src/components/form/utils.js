export function removeFields(content, fieldsToRemove) {
	const newContent = content ? {...content} : {};
	Object.keys(newContent).forEach(k => {
		newContent[k].fields = newContent[k].fields.filter(f => fieldsToRemove.indexOf(f.name) === -1);
	});

	return newContent;
}

export function removePages(content, pageNames) {
	const newContent = {...content};
	pageNames.forEach(n => {
		if (newContent[n] !== undefined) {
			delete newContent[n];
		}
	});

	return newContent;
}
