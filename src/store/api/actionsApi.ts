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
                const {data} = await queryFulfilled;
                dispatch(
                    instancesApi.util.updateQueryData(
                        "getInstance",
                        params.instanceId,
                        () => data.instance,
                    ),
                );
            },
        }),
    }),
});

export const {endpoints: actionsEndpoints} = actionsApi;
