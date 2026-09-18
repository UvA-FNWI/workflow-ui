import {applyEffectResult} from "../effectsSlice";
import {baseApi} from "./baseApi";
import {instancesApi} from "./instancesApi";
import type {PostponeDeadlinesRequest, PostponeDeadlinesResponse} from "./types/deadlines";
import type {Form} from "./types/submissions";

type Params = {instanceId: string};
export const deadlinesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPostponementForm: build.query<Form, Params & {actionName: string}>({
            query: ({instanceId, actionName}) =>
                `PostponeDeadline/${instanceId}/${encodeURIComponent(actionName)}`,
        }),
        postponeDeadlines: build.mutation<
            PostponeDeadlinesResponse,
            Params & {actionName: string; request: PostponeDeadlinesRequest}
        >({
            query: ({instanceId, actionName, request}) => ({
                url: `PostponeDeadline/${instanceId}/${encodeURIComponent(actionName)}`,
                method: "post",
                body: request,
            }),
            invalidatesTags: (result, _error, {instanceId}) =>
                result
                    ? [
                          {type: "InstanceActions", id: instanceId},
                          {type: "Assessments", instanceId},
                          "Submission",
                      ]
                    : [],
            async onQueryStarted({instanceId}, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(
                        instancesApi.util.updateQueryData(
                            "getInstance",
                            instanceId,
                            () => data.instance,
                        ),
                    );
                    if (data.effects) dispatch(applyEffectResult(data.effects));
                } catch {
                    // The modal displays validation errors and preserves the proposed changes.
                }
            },
        }),
    }),
});
