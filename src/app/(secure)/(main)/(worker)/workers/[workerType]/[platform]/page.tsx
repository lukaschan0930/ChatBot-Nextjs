import { MaketingPlatforms, WorkerTypes } from "@/app/lib/stack";
import TwitterMarketing from "@/app/components/workers/twittermarketing";

export async function generateStaticParams() {
    return WorkerTypes.flatMap((worker) =>
        MaketingPlatforms.map((platform) => ({
            workerType: worker.id,
            platform: platform.id
        }))
    );
}

export default async function Page({
    params
}: {
    params: Promise<{ workerType: string, platform: string }>
}) {
    const { workerType, platform } = await params;

    if (!WorkerTypes.some(worker => worker.id === workerType)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Invalid worker type</p>
            </div>
        );
    }

    if (!MaketingPlatforms.some(p => p.id === platform)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Invalid platform</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen w-screen px-4">
                {
                    platform === "twitter" ? (
                        <TwitterMarketing />
                    ) : (
                        <p>Invalid platform</p>
                    )
                }
            </div>
        </>
    );
}