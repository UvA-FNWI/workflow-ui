import {baseApi} from "~/store/api/baseApi.ts";
import {instancesApi} from "~/store/api/instancesApi.ts";
import type {ExecuteActionParams} from "~/store/api/types/params.ts";
import type {ExecuteActionResult} from "~/store/api/types/returnTypes.ts";
import {applyEffectResult} from "~/store/effectsSlice.ts";

export const actionsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        executeAction: build.mutation<ExecuteActionResult, ExecuteActionParams>({
            query: (params) => ({
                url: "Actions",
                method: "post",
                body: params,
            }),
            invalidatesTags: (_result, _error, {instanceId}) => [
                {type: "InstanceActions", id: instanceId},
            ],
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                dispatch(
                    instancesApi.util.updateQueryData(
                        "getInstance",
                        params.instanceId,
                        () => data.instance,
                    ),
                );
                dispatch(applyEffectResult(data.result));
            },
        }),
    }),
});

export const {endpoints: actionsEndpoints} = actionsApi;
