import { MaketingPlatforms, WorkerTypes } from "@/app/lib/stack";
import ShadowBtn from "@/app/components/ShadowBtn";
import Link from "next/link";

export async function generateStaticParams() {
    return WorkerTypes.map((worker) => ({
        workerType: worker.id,
    }))
}

export default async function Page({ params }: { params: Promise<{ workerType: string }> }) {
    const { workerType } = await params;
    console.log("workerType", workerType);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {
                    workerType === "marketing" &&
                    MaketingPlatforms.map((platform) => (
                        <Link
                            href={`/workers/${workerType}/${platform.id}`}
                            key={platform.id}
                        >
                            <ShadowBtn
                                className={`w-full rounded-md`}
                                mainClassName={`text-white flex flex-col items-center justify-center py-7 px-2 md:px-16 relative`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[16px] text-nowrap">{platform.label}</span>
                                </div>
                            </ShadowBtn>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}