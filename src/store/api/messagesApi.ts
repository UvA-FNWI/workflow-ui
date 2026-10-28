import {baseApi} from "./baseApi";
import type {AddMessageBody, MessageThread} from "./types/messages";

export const messagesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query<MessageThread[], string>({
            query: (instanceId) => `/Messages/${instanceId}`,
            providesTags: (_result, _error, instanceId) => [{type: "Messages", id: instanceId}],
        }),
        addMessage: builder.mutation<MessageThread, {instanceId: string} & AddMessageBody>({
            query: ({instanceId, ...body}) => ({
                url: `/Messages/${instanceId}`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, {instanceId}) => [
                {type: "Messages", id: instanceId},
            ],
        }),
    }),
});

export const {endpoints: messagesEndpoints} = messagesApi;
