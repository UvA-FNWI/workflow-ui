import type {PropsWithChildren, ReactElement} from "react";

import {Provider} from "react-redux";

import {configureStore} from "@reduxjs/toolkit";
import {render} from "@testing-library/react";

import {baseApi} from "~/store/api/baseApi";

export const createTestStore = () =>
    configureStore({
        reducer: {
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });

type TestStore = ReturnType<typeof createTestStore>;

type RenderWithProvidersOptions = {
    store?: TestStore;
};

export const renderWithProviders = (
    ui: ReactElement,
    {store = createTestStore()}: RenderWithProvidersOptions = {},
) => {
    const Wrapper = ({children}: PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
    );

    return {
        store,
        ...render(ui, {wrapper: Wrapper}),
    };
};
