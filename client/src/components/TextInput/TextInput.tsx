import React, { MutableRefObject } from "react";

interface TextInputProps {
	/**what displays with no content*/
	placeholder: string,
	/**optional: regex limiting usable characters*/
	regex?: RegExp,
	/**the ref that will be modified by the input*/
	valueRef: MutableRefObject<string>,
	/**optional: default value in input if applicable*/
	defaultValue?: number | string,
	/**optional: max length of input*/
	maxLength?: number,
	/**optional: function that executes when enter is pressed while highlighting the input*/
	enterFunction?: Function,
	/**optional: undefined it is type text*/
	inputType?: string,
}

export const TextInput: React.FC<TextInputProps> = ({placeholder, regex, valueRef, defaultValue,maxLength, enterFunction, inputType }) => {

	return (
		<input
			//name={"allyLevelSet"}
			type={inputType ?? "text"}
			placeholder={placeholder}
			autoComplete="off"
			className="UITextInput"
			style={{
				maxWidth: "100%",
				height: "100%",
				padding: "3px",
			}}
			defaultValue={defaultValue}
			onChange={event => {
				if (event.target.value === '' || (regex !== undefined  ? regex.test(event.target.value) : true)) {
					(valueRef as MutableRefObject<string>).current = event.target.value;
				} else {
					event.target.value = valueRef.current + "";
				}
			}}
			onKeyUp={
				event => {
					if (event.key === "Enter") {
						event.preventDefault();
						if (enterFunction !== undefined)
							enterFunction();
					}
				}
			}
			maxLength={maxLength}
		/>
	);
}