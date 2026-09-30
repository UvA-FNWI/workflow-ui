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
            invalidatesTags: (result, _error, {instanceId}) =>
                result ? [{type: "InstanceActions", id: instanceId}, {type: "Screen"}] : [],
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    if (data.instance) {
                        dispatch(
                            instancesApi.util.updateQueryData(
                                "getInstance",
                                params.instanceId,
                                () => data.instance,
                            ),
                        );
                    }
                    dispatch(applyEffectResult(data.result));
                } catch {
                    // The caller displays validation errors when an action cannot be executed.
                }
            },
        }),
    }),
});

export const {endpoints: actionsEndpoints} = actionsApi;
