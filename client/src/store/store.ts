import { configureStore } from '@reduxjs/toolkit'
import accountSlice from './features/accountSlice'

export const store = configureStore({
	reducer: {

		account: accountSlice,

	},
	/**
	 * turns off errors for stuffing non-serializable objects into the store;
	 * if problems occur with the store disable this entire block to see the error messages that are getting blocked
	 * @param getDefaultMiddleware
	 * @returns
	 */
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		serializableCheck: {
			// Ignore these action types
			//ignoredActions: ['your/action/type'],
			// Ignore these field paths in all actions
			//ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
			// Ignore these paths in the state
			//ignoredPaths: ['items.dates'],

			ignoredActionPaths:['payload.account'],

			ignoredPaths: ['account.account'],
		},
	}),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch