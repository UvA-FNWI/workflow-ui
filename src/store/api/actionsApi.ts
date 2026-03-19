import {baseApi} from "~/store/api/baseApi.ts";
import {instancesApi} from "~/store/api/instancesApi.ts";
import type {ExecuteActionParams} from "~/store/api/types/params.ts";
import type {ExecuteActionResult} from "~/store/api/types/returnTypes.ts";

export const actionsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        executeAction: build.mutation<ExecuteActionResult, ExecuteActionParams>({
            query: (params) => ({
                url: "Actions",
                method: "post",
                body: params,
            }),
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(
                        instancesApi.util.updateQueryData(
                            "getInstance",
                            params.instanceId,
                            () => data.instance,
                        ),
                    );

                    // TODO: Make something nice for this with a modal
                    const redirectUrl = data.result.redirectUrl;
                    if (redirectUrl) {
                        window.location.assign(redirectUrl);
                    }
                } catch {
                    return;
                }
            },
        }),
    }),
});

export const {endpoints: actionsEndpoints} = actionsApi;
