//derived from:
//  https://react-redux.js.org/tutorials/typescript-quick-start


import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Account } from '../../account/Account';
import { RootState } from '../store';

interface accountState {
	account: Account | undefined,
}

const initialState = {
	account: undefined,
} as accountState


export const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		set: {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes.
			// Also, no return statement is required from these functions.

			reducer: (state, action: PayloadAction<accountState>) => {
				state.account = action.payload.account;
			},

			//prepare allows for us to have multiple arguments in a dispatch; this formats action
			prepare: (account:Account) => {
				return {
					payload: {account }
				};
			}
		},
	},
})

// Action creators are generated for each case reducer function
export const { set } = accountSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectAdvancedBuild = (state: RootState) => state.advancedBuild.statBuild

export default accountSlice.reducer