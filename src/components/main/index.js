import React from 'react';
import Banner from './banner';
import FormList from './formList';
import InstructionForCompleting from './instructionForCompleting';
import IsbnIsmn from './isbn_ismn';
import Issn from './issn';
import SearchComponent from './renderSearchComponent';

// Disabled until refactored: <SearchComponent/>

export default function () {
	return (
		<>
			<Banner/>
			<FormList/>
			<InstructionForCompleting/>
			<IsbnIsmn/>
			<Issn/>
		</>
	);
}
