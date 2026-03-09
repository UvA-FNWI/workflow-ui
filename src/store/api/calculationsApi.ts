import {baseApi} from "~/store/api/baseApi.ts";
import type {Calculations} from "~/store/api/types/calculations.ts";

type CalculationParams = {instanceId: string; submissionId: string};

export const calculationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAverages: builder.query<Calculations, CalculationParams>({
            query: ({instanceId, submissionId}) => `/Calculations/${instanceId}/${submissionId}`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Calculations", instanceId, submissionId},
            ],
        }),
    }),
});
