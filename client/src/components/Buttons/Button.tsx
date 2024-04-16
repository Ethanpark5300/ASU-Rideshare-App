interface ButtonProps {
	label: string,
	onClickFn: Function,
}

/**
 * push button
 * @param props
 * @returns a button
 */
export const Button = (props: ButtonProps) => {
	return (
		<button className=""
			onClick={() => {
				//if active, bitwise xor[^](subtract flags), else or[|](add flags)
				props.onClickFn();
			}}
		>
			{props.label}
		</button>
	);
}