'use client';
import { appEnv } from '@/constants/app';
import { configureStore, createAction } from '@reduxjs/toolkit';
const rootReducer = (state = {}) => state;

export const updateVersion = createAction<void>('global/updateVersion');

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {},
    }),
  devTools: process.env.NODE_ENV !== appEnv.production,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
