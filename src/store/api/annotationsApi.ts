import {baseApi} from "./baseApi";
import type {Annotation, CreateAnnotationBody} from "./types/annotations";

type AnnotationParams = {
    instanceId: string;
    submissionId: string;
    questionName: string;
    artifactId: string;
};

export const annotationsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAnnotations: build.query<Annotation[], AnnotationParams>({
            query: ({instanceId, submissionId, questionName, artifactId}) =>
                `Annotations/${instanceId}/${submissionId}/${questionName}/${artifactId}`,
            providesTags: (_result, _error, {artifactId}) => [{type: "Annotation", id: artifactId}],
        }),
        createAnnotation: build.mutation<
            Annotation,
            AnnotationParams & {body: CreateAnnotationBody}
        >({
            query: ({instanceId, submissionId, questionName, artifactId, body}) => ({
                url: `Annotations/${instanceId}/${submissionId}/${questionName}/${artifactId}`,
                method: "post",
                body,
            }),
            invalidatesTags: (_result, _error, {artifactId}) => [
                {type: "Annotation", id: artifactId},
            ],
        }),
    }),
});

export const {useGetAnnotationsQuery, useCreateAnnotationMutation} = annotationsApi;
