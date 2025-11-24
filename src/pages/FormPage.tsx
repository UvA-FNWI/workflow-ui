import {PageControl} from "~/components/PageControl";
import {submissionsEndpoints} from "~/store/api/submissionsApi";

export const FormPage = ({
    instanceId,
    submissionId,
}: {
    instanceId: string;
    submissionId: string;
}) => {
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });

    if (!submission) return <div>Loading...</div>;

    return (
        <div>
            {submission.form.pages.map((page) => (
                <div key={page.index}>
                    <PageControl instanceId={instanceId} submissionId={submissionId} page={page} />
                </div>
            ))}
        </div>
    );
};
